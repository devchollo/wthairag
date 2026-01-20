import axios from 'axios';

/**
 * Self-ping logic to prevent the server from sleeping on platforms like Render.
 * It pings the configured URL every minute.
 */
export const initKeepAlive = () => {
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
            const response = await axios.get(healthUrl);
            console.log(`[Keep-Alive] Ping successful at ${new Date().toISOString()}: ${response.status}`);
        } catch (error: any) {
            console.error(`[Keep-Alive] Ping failed at ${new Date().toISOString()}: ${error.message}`);
        }
    }, 60000);
};
