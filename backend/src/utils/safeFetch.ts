
import axios from 'axios';
import { URL } from 'url';
// @ts-ignore
import ipRangeCheck from 'ip-range-check';
// @ts-ignore
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

export const safeFetch = async (inputUrl: string, options: any = {}) => {
    try {
        const urlObj = new URL(inputUrl);

        // 1. Protocol Check
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            throw new Error('Invalid protocol. Only HTTP/HTTPS allowed.');
        }

        // 2. Resolve DNS (Rebinding check - simplified)
        // In a real robust system, we'd hook into the axios transport, but precise DNS resolution helps.
        const ips = await resolve4(urlObj.hostname);

        if (!ips || ips.length === 0) {
            throw new Error('DNS resolution failed');
        }

        const targetIp = ips[0];

        // 3. IP Check (Block private/local ranges)
        const isPrivate = ipRangeCheck(targetIp, [
            '10.0.0.0/8',
            '172.16.0.0/12',
            '192.168.0.0/16',
            '127.0.0.0/8',
            '0.0.0.0/8',
            'fd00::/8', // IPv6 private
            '::1'
        ]);

        if (isPrivate) {
            throw new Error('Access to private/local network blocked (SSRF Protection)');
        }

        // 4. Perform Request with hardened config
        return await axios.get(inputUrl, {
            ...options,
            maxRedirects: 3, // Limit redirects
            timeout: 8000,   // Strict timeout
            maxContentLength: 5 * 1024 * 1024, // 5MB max response
            validateStatus: (status) => status < 500, // Reject server errors
        });
    } catch (error: any) {
        throw new Error(`Request blocked or failed: ${error.message}`);
    }
};
