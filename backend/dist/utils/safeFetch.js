"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeFetch = void 0;
const axios_1 = __importDefault(require("axios"));
const url_1 = require("url");
// @ts-ignore
const ip_range_check_1 = __importDefault(require("ip-range-check"));
// @ts-ignore
const dns_1 = __importDefault(require("dns"));
const util_1 = require("util");
const resolve4 = (0, util_1.promisify)(dns_1.default.resolve4);
const safeFetch = async (inputUrl, options = {}) => {
    try {
        const urlObj = new url_1.URL(inputUrl);
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
        const isPrivate = (0, ip_range_check_1.default)(targetIp, [
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
        return await axios_1.default.get(inputUrl, {
            ...options,
            maxRedirects: 3, // Limit redirects
            timeout: 8000, // Strict timeout
            maxContentLength: 5 * 1024 * 1024, // 5MB max response
            validateStatus: (status) => status < 500, // Reject server errors
        });
    }
    catch (error) {
        throw new Error(`Request blocked or failed: ${error.message}`);
    }
};
exports.safeFetch = safeFetch;
