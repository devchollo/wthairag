"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookTest = exports.getIpDetails = exports.whoIsHostingThis = exports.whoisLookup = exports.generateQR = exports.getSSLReport = exports.generatePassword = exports.dnsLookup = void 0;
const dns_1 = __importDefault(require("dns"));
const tls_1 = __importDefault(require("tls"));
const axios_1 = __importDefault(require("axios"));
const qrcode_1 = __importDefault(require("qrcode"));
const util_1 = require("util");
const response_1 = require("../utils/response");
const resolveA = (0, util_1.promisify)(dns_1.default.resolve4);
const resolveMx = (0, util_1.promisify)(dns_1.default.resolveMx);
const resolveTxt = (0, util_1.promisify)(dns_1.default.resolveTxt);
const resolveNs = (0, util_1.promisify)(dns_1.default.resolveNs);
const resolveCname = (0, util_1.promisify)(dns_1.default.resolveCname);
const resolveSoa = (0, util_1.promisify)(dns_1.default.resolveSoa);
/**
 * Extracts the most accurate IP address from the request.
 * Handles proxies (Render, Cloudflare) and localhost.
 */
const getEffectiveIp = (req) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (Array.isArray(ip))
        ip = ip[0];
    if (typeof ip === 'string') {
        // Handle comma-separated lists from proxies (client, proxy1, proxy2)
        ip = ip.split(',')[0].trim();
    }
    if (ip.startsWith('::ffff:'))
        ip = ip.replace('::ffff:', '');
    // Handle localhost/private IPs for dev mode
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return '8.8.8.8'; // Fallback for local testing
    }
    return ip;
};
/**
 * Normalizes input (URL or naked domain) to a clean, lowercase naked domain.
 */
const normalizeDomain = (input) => {
    if (!input)
        return '';
    return input.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase().trim();
};
const dnsLookup = async (req, res) => {
    try {
        const input = req.body.domain || req.body.url;
        const domain = normalizeDomain(input);
        if (!domain)
            return (0, response_1.sendError)(res, 'Domain or URL is required', 400);
        const startTime = Date.now();
        const results = {
            domain,
            queryTime: 0,
            records: {},
            diagnostics: {
                hasMX: false,
                hasSPF: false,
                hasDMARC: false,
                hasDKIM: false,
                dnssecEnabled: false
            },
            report: {
                summary: 'Resolution complete.',
                issues: [],
                recommendations: []
            }
        };
        // Run common lookups in parallel
        const [a, mx, txt, ns, soa] = await Promise.allSettled([
            resolveA(domain),
            resolveMx(domain),
            resolveTxt(domain),
            resolveNs(domain),
            resolveSoa(domain)
        ]);
        if (a.status === 'fulfilled')
            results.records.A = a.value;
        if (mx.status === 'fulfilled') {
            results.records.MX = mx.value;
            results.diagnostics.hasMX = true;
        }
        if (txt.status === 'fulfilled') {
            results.records.TXT = txt.value;
            const flatTxt = txt.value.flat().join(' ').toLowerCase();
            results.diagnostics.hasSPF = flatTxt.includes('v=spf1');
            results.diagnostics.hasDMARC = flatTxt.includes('v=dmarc1');
        }
        if (ns.status === 'fulfilled')
            results.records.NS = ns.value;
        if (soa.status === 'fulfilled')
            results.records.SOA = soa.value;
        results.queryTime = Date.now() - startTime;
        // Recommendations based on missing records
        if (!results.diagnostics.hasMX) {
            results.report.issues.push('No MX records found. This domain cannot receive email.');
            results.report.recommendations.push('Configure MX records if you intend to use this domain for email.');
        }
        if (!results.diagnostics.hasSPF) {
            results.report.issues.push('Missing SPF record.');
            results.report.recommendations.push('Add an SPF TXT record to authorize your mail servers and prevent spoofing.');
        }
        return (0, response_1.sendSuccess)(res, results, 'DNS lookup successful');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `DNS resolution failed: ${error.message}`, 500);
    }
};
exports.dnsLookup = dnsLookup;
const generatePassword = async (req, res) => {
    const { length = 16, numbers = true, symbols = true, uppercase = true } = req.body;
    const charset = {
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        num: '0123456789',
        sym: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };
    let characters = charset.lower;
    if (uppercase)
        characters += charset.upper;
    if (numbers)
        characters += charset.num;
    if (symbols)
        characters += charset.sym;
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        password += characters[array[i] % characters.length];
    }
    return (0, response_1.sendSuccess)(res, { password, length, strength: length > 12 ? 'Strong' : 'Medium' }, 'Password generated');
};
exports.generatePassword = generatePassword;
const getSSLReport = async (req, res) => {
    try {
        const input = req.body.domain || req.body.url;
        const domain = normalizeDomain(input);
        if (!domain)
            return (0, response_1.sendError)(res, 'Domain or URL is required', 400);
        const startTime = Date.now();
        const checkSSL = (target) => {
            return new Promise((resolve, reject) => {
                const socket = tls_1.default.connect({
                    host: target,
                    port: 443,
                    servername: target,
                    rejectUnauthorized: false
                }, () => {
                    const cert = socket.getPeerCertificate(true);
                    const protocol = socket.getProtocol();
                    const cipher = socket.getCipher();
                    socket.destroy();
                    if (!cert || Object.keys(cert).length === 0) {
                        reject(new Error('Could not retrieve certificate.'));
                        return;
                    }
                    resolve({
                        valid: socket.authorized,
                        reason: socket.authorizationError,
                        issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
                        subject: cert.subject?.CN || 'Unknown',
                        expiry: cert.valid_to,
                        validFrom: cert.valid_from,
                        bits: cert.bits || 0,
                        serialNumber: cert.serialNumber || 'N/A',
                        fingerprint256: cert.fingerprint256 || 'N/A',
                        protocol: protocol || 'Unknown',
                        cipher: cipher?.name || 'Unknown',
                        cipherVersion: cipher?.version || 'Unknown',
                        altNames: cert.subjectaltname?.split(', ').map((s) => s.replace('DNS:', '')) || []
                    });
                });
                socket.on('error', (e) => {
                    socket.destroy();
                    reject(e);
                });
                socket.setTimeout(5000, () => {
                    socket.destroy();
                    reject(new Error('Connection timed out after 5 seconds'));
                });
            });
        };
        try {
            const certData = await checkSSL(domain);
            const queryTime = Date.now() - startTime;
            // Advanced diagnostics
            const expiryDate = new Date(certData.expiry);
            const now = new Date();
            const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const issues = [];
            if (!certData.valid)
                issues.push(`Chain validation failed: ${certData.reason}`);
            if (daysUntilExpiry < 30)
                issues.push(`Certificate expires in ${daysUntilExpiry} days.`);
            if (certData.bits < 2048)
                issues.push(`Key size (${certData.bits} bits) is below recommended 2048 bits.`);
            if (certData.protocol === 'TLSv1' || certData.protocol === 'TLSv1.1') {
                issues.push(`Outdated protocol detected: ${certData.protocol}. Upgrade to TLS 1.2+.`);
            }
            return (0, response_1.sendSuccess)(res, {
                domain,
                queryTime,
                certificate: {
                    status: certData.valid ? 'Valid Chain' : `Invalid (${certData.reason})`,
                    issuer: certData.issuer,
                    subject: certData.subject,
                    expiry: certData.expiry,
                    validFrom: certData.validFrom,
                    daysUntilExpiry,
                    serialNumber: certData.serialNumber,
                    fingerprint256: certData.fingerprint256,
                    keyStrength: `${certData.bits} bits`,
                    altNames: certData.altNames
                },
                connection: {
                    protocol: certData.protocol,
                    cipher: certData.cipher,
                    cipherVersion: certData.cipherVersion
                },
                report: {
                    summary: issues.length === 0 ? 'SSL configuration is optimal.' : `${issues.length} issue(s) detected.`,
                    issues,
                    recommendations: issues.length > 0 ? [
                        'Renew certificate before expiry.',
                        'Upgrade to TLS 1.3 for enhanced security.',
                        'Ensure HSTS is enabled with a long max-age.'
                    ] : ['Certificate is healthy. Consider enabling OCSP stapling for faster validation.']
                }
            }, 'SSL report generated');
        }
        catch (error) {
            return (0, response_1.sendError)(res, `Failed to audit SSL: ${error.message}`, 500);
        }
    }
    catch (err) {
        return (0, response_1.sendError)(res, `SSL operation failed: ${err.message}`, 500);
    }
};
exports.getSSLReport = getSSLReport;
const generateQR = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text)
            return (0, response_1.sendError)(res, 'Text/URL is required', 400);
        const qrCode = await qrcode_1.default.toDataURL(text, {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: '#020617',
                light: '#ffffff'
            },
            width: 400
        });
        return (0, response_1.sendSuccess)(res, {
            qrCode,
            downloadUrl: qrCode
        }, 'QR code generated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.generateQR = generateQR;
// WHOIS Lookup
const whoisLookup = async (req, res) => {
    try {
        const input = req.body.domain || req.body.url;
        const domain = normalizeDomain(input);
        if (!domain)
            return (0, response_1.sendError)(res, 'Domain or URL is required', 400);
        const whois = require('whois-json');
        const startTime = Date.now();
        const result = await whois(domain);
        const queryTime = Date.now() - startTime;
        // Normalize the response (whois-json returns varying formats)
        const normalized = {
            domain: result.domainName || domain,
            registrar: result.registrar || result.registrarName || 'Unknown',
            registrarUrl: result.registrarUrl || null,
            creationDate: result.creationDate || result.createdDate || null,
            expirationDate: result.registrarRegistrationExpirationDate || result.registryExpiryDate || result.expirationDate || null,
            updatedDate: result.updatedDate || result.lastUpdated || null,
            nameServers: result.nameServer || result.nameServers || [],
            status: result.domainStatus || result.status || [],
            dnssec: result.dnssec || 'unsigned',
            abuseContact: result.registrarAbuseContactEmail || null,
            abusePhone: result.registrarAbuseContactPhone || null,
            registrant: {
                name: result.registrantName || result.registrant || null,
                organization: result.registrantOrganization || null,
                email: result.registrantEmail || null,
                country: result.registrantCountry || null
            },
            admin: {
                name: result.adminName || null,
                organization: result.adminOrganization || null,
                email: result.adminEmail || null
            },
            tech: {
                name: result.techName || null,
                organization: result.techOrganization || null,
                email: result.techEmail || null
            }
        };
        // Convert nameServers to array if string
        if (typeof normalized.nameServers === 'string') {
            normalized.nameServers = normalized.nameServers.split('\n').filter(Boolean);
        }
        // Convert status to array if string
        if (typeof normalized.status === 'string') {
            normalized.status = [normalized.status];
        }
        return (0, response_1.sendSuccess)(res, {
            ...normalized,
            queryTime,
            raw: result
        }, 'WHOIS lookup successful');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `WHOIS lookup failed: ${error.message}`, 500);
    }
};
exports.whoisLookup = whoisLookup;
// WhoIsHostingThis - Hosting provider detection
const whoIsHostingThis = async (req, res) => {
    try {
        const input = req.body.domain || req.body.url;
        const domain = normalizeDomain(input);
        if (!domain)
            return (0, response_1.sendError)(res, 'Domain or URL is required', 400);
        const startTime = Date.now();
        const results = {
            domain,
            ip: null,
            hosting: {
                provider: 'Unknown',
                org: null,
                asn: null,
                asnName: null
            },
            cdn: {
                detected: false,
                provider: null
            },
            location: {
                country: null,
                region: null,
                city: null
            }
        };
        // Resolve A record to get IP
        try {
            const ips = await resolveA(domain);
            if (ips && ips.length > 0) {
                results.ip = ips[0];
                // Use ipinfo.io for ASN and location data
                const token = process.env.IPINFO_TOKEN;
                const ipInfo = await axios_1.default.get(`https://ipinfo.io/${results.ip}/json${token ? `?token=${token}` : ''}`);
                if (ipInfo.data) {
                    const data = ipInfo.data;
                    results.hosting.org = data.org || null;
                    results.location.country = data.country || null;
                    results.location.region = data.region || null;
                    results.location.city = data.city || null;
                    // Parse ASN from org field (format: "AS13335 Cloudflare, Inc.")
                    if (data.org) {
                        const asnMatch = data.org.match(/^(AS\d+)\s+(.+)$/);
                        if (asnMatch) {
                            results.hosting.asn = asnMatch[1];
                            results.hosting.asnName = asnMatch[2];
                        }
                    }
                    // Detection logic (reused below)
                    const detect = (orgStr) => {
                        const low = orgStr.toLowerCase();
                        if (low.includes('amazon') || low.includes('aws'))
                            return 'Amazon Web Services (AWS)';
                        if (low.includes('google'))
                            return 'Google Cloud Platform';
                        if (low.includes('microsoft') || low.includes('azure'))
                            return 'Microsoft Azure';
                        if (low.includes('cloudflare')) {
                            results.cdn.detected = true;
                            results.cdn.provider = 'Cloudflare';
                            return 'Cloudflare';
                        }
                        if (low.includes('digitalocean'))
                            return 'DigitalOcean';
                        if (low.includes('linode') || low.includes('akamai'))
                            return 'Akamai/Linode';
                        if (low.includes('ovh'))
                            return 'OVH';
                        if (low.includes('hetzner'))
                            return 'Hetzner';
                        if (low.includes('vultr'))
                            return 'Vultr';
                        if (low.includes('vercel'))
                            return 'Vercel';
                        if (low.includes('netlify'))
                            return 'Netlify';
                        if (low.includes('render'))
                            return 'Render';
                        if (low.includes('github') || low.includes('fastly')) {
                            if (low.includes('fastly')) {
                                results.cdn.detected = true;
                                results.cdn.provider = 'Fastly';
                            }
                            return (low.includes('github')) ? 'GitHub Pages' : 'Fastly';
                        }
                        if (low.includes('heroku') || low.includes('salesforce'))
                            return 'Heroku';
                        if (low.includes('namecheap'))
                            return 'Namecheap';
                        if (low.includes('godaddy'))
                            return 'GoDaddy';
                        if (low.includes('bluehost'))
                            return 'Bluehost';
                        if (low.includes('hostgator'))
                            return 'HostGator';
                        if (low.includes('siteground'))
                            return 'SiteGround';
                        if (low.includes('hostinger'))
                            return 'Hostinger';
                        return orgStr;
                    };
                    if (data.org)
                        results.hosting.provider = detect(data.org);
                }
            }
        }
        catch (apiErr) {
            console.error('IPInfo API Error (Hosting):', apiErr.message);
            // Fallback to ip-api.com
            try {
                const fallbackRes = await axios_1.default.get(`http://ip-api.com/json/${results.ip}`);
                if (fallbackRes.data && fallbackRes.data.status === 'success') {
                    const d = fallbackRes.data;
                    results.hosting.org = d.isp;
                    results.location.country = d.countryCode;
                    results.location.region = d.regionName;
                    results.location.city = d.city;
                    results.hosting.asn = d.as?.split(' ')[0];
                    results.hosting.asnName = d.as?.split(' ').slice(1).join(' ');
                    const low = (d.isp || d.org || d.as || '').toLowerCase();
                    if (low.includes('amazon') || low.includes('aws'))
                        results.hosting.provider = 'Amazon Web Services (AWS)';
                    else if (low.includes('google'))
                        results.hosting.provider = 'Google Cloud Platform';
                    else if (low.includes('microsoft') || low.includes('azure'))
                        results.hosting.provider = 'Microsoft Azure';
                    else if (low.includes('cloudflare')) {
                        results.hosting.provider = 'Cloudflare';
                        results.cdn.detected = true;
                        results.cdn.provider = 'Cloudflare';
                    }
                    else if (low.includes('render'))
                        results.hosting.provider = 'Render';
                    else if (low.includes('vercel'))
                        results.hosting.provider = 'Vercel';
                    else if (low.includes('digitalocean'))
                        results.hosting.provider = 'DigitalOcean';
                    else
                        results.hosting.provider = d.isp || 'Unknown';
                }
            }
            catch (fallbackErr) {
                console.error('Fallback API Error (Hosting):', fallbackErr.message);
            }
        }
        // Check for CDN via CNAME
        try {
            const cnames = await resolveCname(domain);
            if (cnames && cnames.length > 0) {
                const cname = cnames[0].toLowerCase();
                if (cname.includes('cloudflare')) {
                    results.cdn.detected = true;
                    results.cdn.provider = 'Cloudflare';
                }
                else if (cname.includes('cloudfront')) {
                    results.cdn.detected = true;
                    results.cdn.provider = 'Amazon CloudFront';
                }
                else if (cname.includes('fastly')) {
                    results.cdn.detected = true;
                    results.cdn.provider = 'Fastly';
                }
                else if (cname.includes('akamai')) {
                    results.cdn.detected = true;
                    results.cdn.provider = 'Akamai';
                }
            }
        }
        catch (e) {
            // No CNAME
        }
        results.queryTime = Date.now() - startTime;
        return (0, response_1.sendSuccess)(res, results, 'Hosting lookup successful');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `Hosting lookup failed: ${error.message}`, 500);
    }
};
exports.whoIsHostingThis = whoIsHostingThis;
const getIpDetails = async (req, res) => {
    try {
        const ip = getEffectiveIp(req);
        // Safe API Call with fallback to prevent 500 crashes
        let responseData = {};
        try {
            const token = process.env.IPINFO_TOKEN;
            const apiRes = await axios_1.default.get(`https://ipinfo.io/${ip}/json${token ? `?token=${token}` : ''}`);
            responseData = apiRes.data;
        }
        catch (apiErr) {
            console.error('IPInfo API Error:', apiErr.message);
            // Fallback for 429 or other API errors
            try {
                console.log('Falling back to ip-api.com...');
                const fallbackRes = await axios_1.default.get(`http://ip-api.com/json/${ip}`);
                if (fallbackRes.data && fallbackRes.data.status === 'success') {
                    const d = fallbackRes.data;
                    responseData = {
                        ip: d.query,
                        city: d.city,
                        region: d.regionName,
                        country: d.countryCode,
                        loc: `${d.lat},${d.lon}`,
                        org: d.isp,
                        timezone: d.timezone
                    };
                }
                else {
                    responseData = { ip };
                }
            }
            catch (fallbackErr) {
                console.error('Fallback API Error:', fallbackErr.message);
                responseData = { ip };
            }
        }
        const results = {
            ip: responseData.ip || ip,
            hostname: responseData.hostname || 'N/A',
            city: responseData.city || 'Unknown',
            region: responseData.region || 'Unknown',
            country: responseData.country || 'Unknown',
            loc: responseData.loc || '0,0',
            org: responseData.org || 'Unknown Provider',
            timezone: responseData.timezone || 'UTC',
            asn: responseData.org?.split(' ')[0] || 'N/A'
        };
        return (0, response_1.sendSuccess)(res, results, 'IP details retrieved');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `Internal system error during IP analysis: ${error.message}`, 500);
    }
};
exports.getIpDetails = getIpDetails;
const webhookTest = async (req, res) => {
    try {
        const { url, method, headers, body } = req.body;
        if (!url)
            return (0, response_1.sendError)(res, 'URL is required', 400);
        const startTime = Date.now();
        const axios = require('axios');
        const response = await axios({
            method: method || 'POST',
            url,
            headers: headers || {},
            data: body || {},
            validateStatus: () => true // Resolve promise for all status codes
        });
        const duration = Date.now() - startTime;
        return (0, response_1.sendSuccess)(res, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data,
            duration
        }, 'Webhook test complete');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.webhookTest = webhookTest;
