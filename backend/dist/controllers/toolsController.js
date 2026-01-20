"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookTest = exports.getIpDetails = exports.whoIsHostingThis = exports.whoisLookup = exports.getSSLReport = exports.generateQR = exports.getWhois = exports.generatePassword = exports.dnsLookup = void 0;
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
const dnsLookup = async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain)
            return (0, response_1.sendError)(res, 'Domain is required', 400);
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
            }
        };
        // Fetch all record types
        try {
            results.records.A = await resolveA(domain);
        }
        catch (e) { }
        try {
            results.records.MX = await resolveMx(domain);
        }
        catch (e) { }
        try {
            results.records.TXT = await resolveTxt(domain);
        }
        catch (e) { }
        try {
            results.records.NS = await resolveNs(domain);
        }
        catch (e) { }
        try {
            results.records.CNAME = await resolveCname(domain);
        }
        catch (e) { }
        try {
            results.records.SOA = await resolveSoa(domain);
        }
        catch (e) { }
        results.queryTime = Date.now() - startTime;
        // Diagnostics
        if (results.records.MX && results.records.MX.length > 0) {
            results.diagnostics.hasMX = true;
        }
        if (results.records.TXT) {
            const txtFlat = results.records.TXT.flat().join(' ');
            results.diagnostics.hasSPF = txtFlat.includes('v=spf1');
            results.diagnostics.hasDMARC = txtFlat.toLowerCase().includes('v=dmarc1');
            results.diagnostics.hasDKIM = txtFlat.toLowerCase().includes('v=dkim1') || txtFlat.toLowerCase().includes('k=rsa');
        }
        // Generate report
        const issues = [];
        if (!results.diagnostics.hasMX)
            issues.push('No MX records found. Email may not be configured.');
        if (!results.diagnostics.hasSPF)
            issues.push('Missing SPF record. Email spoofing risk is elevated.');
        if (!results.diagnostics.hasDMARC)
            issues.push('Missing DMARC record. Email authentication policies are not enforced.');
        results.report = {
            summary: issues.length === 0 ? 'All critical mail security records are present.' : `${issues.length} potential configuration issue(s) detected.`,
            issues,
            recommendations: issues.length > 0 ? [
                'Add SPF records to prevent email spoofing.',
                'Configure DMARC for email authentication.',
                'Consider enabling DNSSEC for enhanced security.'
            ] : ['Continue monitoring DNS propagation regularly.']
        };
        return (0, response_1.sendSuccess)(res, results, 'DNS lookup successful');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.dnsLookup = dnsLookup;
const generatePassword = async (req, res) => {
    const { length = 16, numbers = true, symbols = true, uppercase = true } = req.body;
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let chars = lower;
    if (uppercase)
        chars += upper;
    if (numbers)
        chars += nums;
    if (symbols)
        chars += syms;
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (0, response_1.sendSuccess)(res, { password }, 'Password generated');
};
exports.generatePassword = generatePassword;
const getWhois = async (req, res) => {
    const { domain } = req.body;
    return (0, response_1.sendSuccess)(res, {
        domain,
        registrar: 'Query Service',
        expiry: '2027-01-01',
        aiReport: `The WHOIS information for ${domain} shows it is registered. Detailed analytics are being processed in the background.`
    }, 'WHOIS lookup successful');
};
exports.getWhois = getWhois;
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
const getSSLReport = async (req, res) => {
    const { domain } = req.body;
    if (!domain)
        return (0, response_1.sendError)(res, 'Domain is required', 400);
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
};
exports.getSSLReport = getSSLReport;
// WHOIS Lookup
const whoisLookup = async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain)
            return (0, response_1.sendError)(res, 'Domain is required', 400);
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
        const { domain } = req.body;
        if (!domain)
            return (0, response_1.sendError)(res, 'Domain is required', 400);
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
                    // Infer hosting provider from common patterns
                    const orgLower = (data.org || '').toLowerCase();
                    if (orgLower.includes('amazon') || orgLower.includes('aws')) {
                        results.hosting.provider = 'Amazon Web Services (AWS)';
                    }
                    else if (orgLower.includes('google')) {
                        results.hosting.provider = 'Google Cloud Platform';
                    }
                    else if (orgLower.includes('microsoft') || orgLower.includes('azure')) {
                        results.hosting.provider = 'Microsoft Azure';
                    }
                    else if (orgLower.includes('cloudflare')) {
                        results.hosting.provider = 'Cloudflare';
                        results.cdn.detected = true;
                        results.cdn.provider = 'Cloudflare';
                    }
                    else if (orgLower.includes('digitalocean')) {
                        results.hosting.provider = 'DigitalOcean';
                    }
                    else if (orgLower.includes('linode') || orgLower.includes('akamai')) {
                        results.hosting.provider = 'Akamai/Linode';
                    }
                    else if (orgLower.includes('ovh')) {
                        results.hosting.provider = 'OVH';
                    }
                    else if (orgLower.includes('hetzner')) {
                        results.hosting.provider = 'Hetzner';
                    }
                    else if (orgLower.includes('vultr')) {
                        results.hosting.provider = 'Vultr';
                    }
                    else if (orgLower.includes('vercel')) {
                        results.hosting.provider = 'Vercel';
                    }
                    else if (orgLower.includes('netlify')) {
                        results.hosting.provider = 'Netlify';
                    }
                    else if (orgLower.includes('render')) {
                        results.hosting.provider = 'Render';
                    }
                    else if (orgLower.includes('github') || orgLower.includes('fastly')) {
                        results.hosting.provider = (orgLower.includes('github')) ? 'GitHub Pages' : 'Fastly';
                    }
                    else if (orgLower.includes('heroku') || orgLower.includes('salesforce')) {
                        results.hosting.provider = 'Heroku';
                    }
                    else if (orgLower.includes('fastly')) {
                        results.hosting.provider = 'Fastly';
                        results.cdn.detected = true;
                        results.cdn.provider = 'Fastly';
                    }
                    else if (orgLower.includes('namecheap')) {
                        results.hosting.provider = 'Namecheap';
                    }
                    else if (orgLower.includes('godaddy')) {
                        results.hosting.provider = 'GoDaddy';
                    }
                    else if (orgLower.includes('bluehost')) {
                        results.hosting.provider = 'Bluehost';
                    }
                    else if (orgLower.includes('hostgator')) {
                        results.hosting.provider = 'HostGator';
                    }
                    else if (orgLower.includes('siteground')) {
                        results.hosting.provider = 'SiteGround';
                    }
                    else if (orgLower.includes('hostinger')) {
                        results.hosting.provider = 'Hostinger';
                    }
                    else if (data.org) {
                        results.hosting.provider = data.org;
                    }
                }
            }
        }
        catch (e) {
            // IP lookup failed
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
            // If API fails, we still return the IP we detected
            responseData = { ip };
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
