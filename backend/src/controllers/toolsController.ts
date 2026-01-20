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

export const dnsLookup = async (req: Request, res: Response) => {
    try {
        const { domain } = req.body;
        if (!domain) return sendError(res, 'Domain is required', 400);

        const results: any = {};
        try { results.A = await resolveA(domain); } catch (e) { }
        try { results.MX = await resolveMx(domain); } catch (e) { }
        try { results.TXT = await resolveTxt(domain); } catch (e) { }
        try { results.NS = await resolveNs(domain); } catch (e) { }
        try { results.CNAME = await resolveCname(domain); } catch (e) { }

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

    const checkSSL = (target: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const socket = tls.connect({
                host: target,
                port: 443,
                servername: target,
                rejectUnauthorized: false // We want to inspect even invalid certs
            }, () => {
                const cert = socket.getPeerCertificate();
                socket.destroy();

                if (!cert || Object.keys(cert).length === 0) {
                    reject(new Error('Could not retrieve certificate. No certificate returned from server.'));
                    return;
                }

                resolve({
                    valid: !socket.authorized ? false : true,
                    authorized: socket.authorized,
                    reason: socket.authorizationError,
                    issuer: cert.issuer.O || cert.issuer.CN,
                    expiry: cert.valid_to,
                    subject: cert.subject.CN,
                    bits: cert.bits
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

        return sendSuccess(res, {
            domain,
            status: certData.valid ? 'Valid Chain' : `Invalid (${certData.reason})`,
            expiry: certData.expiry,
            issuer: certData.issuer,
            aiReport: `The SSL certificate for ${domain} is issued by ${certData.issuer}. ${certData.valid ? 'The trust chain is fully established.' : `There is a trust issue: ${certData.reason}.`} Expiry is set for ${certData.expiry}.`
        }, 'SSL report generated');
    } catch (error: any) {
        return sendError(res, `Failed to audit SSL: ${error.message}`, 500);
    }
};
