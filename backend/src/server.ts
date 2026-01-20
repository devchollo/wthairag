import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sendError } from './utils/response';

// Load env vars
dotenv.config();

const app = express();

// Middleware
// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://vercel.live"], // Allow Vercel analytics
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", process.env.FRONTEND_URL || '*', "https://vitals.vercel-insights.com"],
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:3000'] : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Body limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Pollution Protection
import hpp from 'hpp';
app.use(hpp());

// Rate Limiting
import rateLimit from 'express-rate-limit';

// Global Limiter (100 reqs / 15 mins)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Strict Limiter for Auth/Tools (50 reqs / hour)
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: { status: 'error', message: 'Rate limit exceeded for this endpoint.' }
});

// AI Tool Limiter (20 reqs / hour) - applied in routes
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { status: 'error', message: 'AI generation limit reached. Please upgrade or wait.' }
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Import Routes
import authRoutes from './routes/auth';
import toolsRoutes from './routes/tools';
import workspaceRoutes from './routes/workspace';
import workspaceDataRoutes from './routes/workspaceData';
import alertRoutes from './routes/alerts';
import filesRoutes from './routes/files';

app.use('/api/auth', authRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/workspace-data', workspaceDataRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/files', filesRoutes);

// Initialize Keep-Alive & Cleanup Workers
import { initCleanupWorker } from './cleanupWorker';
import { initKeepAlive } from './keepAlive';

initCleanupWorker();
initKeepAlive();

// Error Handling
app.use((req, res) => {
    sendError(res, 'Route not found', 404);
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/worktoolshub';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

export default app;
