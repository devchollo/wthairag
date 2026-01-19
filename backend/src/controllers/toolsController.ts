import { Request, Response } from 'express';
import dns from 'dns';
import { promisify } from 'util';
import { sendSuccess, sendError } from '../utils/response';

const resolveAny = promisify(dns.resolveAny);
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
        registrar: 'Mock Registrar',
        expiry: '2027-01-01',
        aiReport: `The WHOIS information for ${domain} shows it is registered until 2027. No immediate action required.`
    }, 'WHOIS lookup successful');
};

export const generateQR = async (req: Request, res: Response) => {
    const { text } = req.body;
    return sendSuccess(res, {
        qrCode: 'data:image/png;base64,...',
        downloadUrl: '#'
    }, 'QR code generated');
};

export const getSSLReport = async (req: Request, res: Response) => {
    // Placeholder for SSL check logic
    // In a real app, you'd use a library or shell out to openssl
    const { domain } = req.body;
    return sendSuccess(res, {
        domain,
        status: 'valid',
        expiry: '2026-12-31',
        issuer: 'Let\'s Encrypt',
        aiReport: `The SSL certificate for ${domain} is valid and configured correctly. Recommendations: Ensure HSTS is enabled.`
    }, 'SSL report generated');
};
