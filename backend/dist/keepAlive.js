"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initKeepAlive = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Self-ping logic to prevent the server from sleeping on platforms like Render.
 * It pings the configured URL every minute.
 */
const initKeepAlive = () => {
    const PING_URL = process.env.API_URL || process.env.RENDER_EXTERNAL_URL;
    if (!PING_URL) {
        console.log('Keep-alive skipped: No API_URL or RENDER_EXTERNAL_URL provided.');
        return;
    }
    const healthUrl = `${PING_URL.replace(/\/$/, '')}/health`;
    console.log(`Keep-alive initialized. Target: ${healthUrl}`);
    // Ping every 1 minute (60000ms)
    setInterval(async () => {
        try {
            const response = await axios_1.default.get(healthUrl);
            console.log(`[Keep-Alive] Ping successful at ${new Date().toISOString()}: ${response.status}`);
        }
        catch (error) {
            console.error(`[Keep-Alive] Ping failed at ${new Date().toISOString()}: ${error.message}`);
        }
    }, 30000);
};
exports.initKeepAlive = initKeepAlive;
