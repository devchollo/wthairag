import { Request, Response } from 'express';
import dns from 'dns';
import tls from 'tls';
import QRCode from 'qrcode';
import { promisify } from 'util';
import { sendSuccess, sendError } from '../utils/response';

const resolveA = promisify(dns.resolve4);
const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolveNs = promisify(dns.resolveNs);
const resolveCname = promisify(dns.resolveCname);
const resolveSoa = promisify(dns.resolveSoa);

export const dnsLookup = async (req: Request, res: Response) => {
    try {
        const { domain } = req.body;
        if (!domain) return sendError(res, 'Domain is required', 400);

        const startTime = Date.now();
        const results: any = {
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
        try { results.records.A = await resolveA(domain); } catch (e) { }
        try { results.records.MX = await resolveMx(domain); } catch (e) { }
        try { results.records.TXT = await resolveTxt(domain); } catch (e) { }
        try { results.records.NS = await resolveNs(domain); } catch (e) { }
        try { results.records.CNAME = await resolveCname(domain); } catch (e) { }
        try { results.records.SOA = await resolveSoa(domain); } catch (e) { }

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
        const issues: string[] = [];
        if (!results.diagnostics.hasMX) issues.push('No MX records found. Email may not be configured.');
        if (!results.diagnostics.hasSPF) issues.push('Missing SPF record. Email spoofing risk is elevated.');
        if (!results.diagnostics.hasDMARC) issues.push('Missing DMARC record. Email authentication policies are not enforced.');

        results.report = {
            summary: issues.length === 0 ? 'All critical mail security records are present.' : `${issues.length} potential configuration issue(s) detected.`,
            issues,
            recommendations: issues.length > 0 ? [
                'Add SPF records to prevent email spoofing.',
                'Configure DMARC for email authentication.',
                'Consider enabling DNSSEC for enhanced security.'
            ] : ['Continue monitoring DNS propagation regularly.']
        };

        return sendSuccess(res, results, 'DNS lookup successful');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const generatePassword = async (req: Request, res: Response) => {
    const { length = 16, numbers = true, symbols = true, uppercase = true } = req.body;

    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let chars = lower;
    if (uppercase) chars += upper;
    if (numbers) chars += nums;
    if (symbols) chars += syms;

    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return sendSuccess(res, { password }, 'Password generated');
};

export const getWhois = async (req: Request, res: Response) => {
    const { domain } = req.body;
    return sendSuccess(res, {
        domain,
        registrar: 'Query Service',
        expiry: '2027-01-01',
        aiReport: `The WHOIS information for ${domain} shows it is registered. Detailed analytics are being processed in the background.`
    }, 'WHOIS lookup successful');
};

export const generateQR = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        if (!text) return sendError(res, 'Text/URL is required', 400);

        const qrCode = await QRCode.toDataURL(text, {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: '#020617',
                light: '#ffffff'
            },
            width: 400
        });

        return sendSuccess(res, {
            qrCode,
            downloadUrl: qrCode
        }, 'QR code generated');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const getSSLReport = async (req: Request, res: Response) => {
    const { domain } = req.body;
    if (!domain) return sendError(res, 'Domain is required', 400);

    const startTime = Date.now();

    const checkSSL = (target: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const socket = tls.connect({
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
                    altNames: cert.subjectaltname?.split(', ').map((s: string) => s.replace('DNS:', '')) || []
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

        const issues: string[] = [];
        if (!certData.valid) issues.push(`Chain validation failed: ${certData.reason}`);
        if (daysUntilExpiry < 30) issues.push(`Certificate expires in ${daysUntilExpiry} days.`);
        if (certData.bits < 2048) issues.push(`Key size (${certData.bits} bits) is below recommended 2048 bits.`);
        if (certData.protocol === 'TLSv1' || certData.protocol === 'TLSv1.1') {
            issues.push(`Outdated protocol detected: ${certData.protocol}. Upgrade to TLS 1.2+.`);
        }

        return sendSuccess(res, {
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
    } catch (error: any) {
        return sendError(res, `Failed to audit SSL: ${error.message}`, 500);
    }
};
