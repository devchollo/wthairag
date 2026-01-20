"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiLimiter = exports.strictLimiter = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const response_1 = require("./utils/response");
// Load env vars
dotenv_1.default.config();
const app = (0, express_1.default)();
// Trust Proxy (Required for Render/Vercel)
app.set('trust proxy', 1);
// Middleware
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: true, // Reflect origin to allow multiple domains (wthairag.onrender.com, worktoolshub.com)
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-workspace-id', 'x-workspace-slug']
}));
// Cookie parser - MUST come before routes
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// NoSQL Injection Protection
// Express 5 makes req.query a getter; mongoSanitize needs it to be writable
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: { ...req.query },
        writable: true,
        enumerable: true,
        configurable: true
    });
    next();
});
app.use((0, express_mongo_sanitize_1.default)());
// Pollution Protection
const hpp_1 = __importDefault(require("hpp"));
app.use((0, hpp_1.default)());
// Rate Limiting
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Global Limiter (100 reqs / 15 mins)
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);
// Strict Limiter for Auth/Tools (50 reqs / hour)
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: { status: 'error', message: 'Rate limit exceeded for this endpoint.' }
});
// AI Tool Limiter (20 reqs / hour) - applied in routes
exports.aiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { status: 'error', message: 'AI generation limit reached. Please upgrade or wait.' }
});
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});
// Import Routes
const auth_1 = __importDefault(require("./routes/auth"));
const tools_1 = __importDefault(require("./routes/tools"));
const workspace_1 = __importDefault(require("./routes/workspace"));
const workspaceData_1 = __importDefault(require("./routes/workspaceData"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const files_1 = __importDefault(require("./routes/files"));
const testimonials_1 = __importDefault(require("./routes/testimonials"));
const membership_1 = __importDefault(require("./routes/membership"));
const analytics_1 = __importDefault(require("./routes/analytics"));
app.use('/api/auth', auth_1.default);
app.use('/api/tools', tools_1.default);
app.use('/api/workspace', workspace_1.default);
app.use('/api/workspaces', workspace_1.default); // Alias for plural usage
app.use('/api/workspace-data', workspaceData_1.default);
app.use('/api/alerts', alerts_1.default);
app.use('/api/files', files_1.default);
app.use('/api/testimonials', testimonials_1.default);
app.use('/api/memberships', membership_1.default);
app.use('/api/analytics', analytics_1.default);
// Initialize Keep-Alive & Cleanup Workers
const cleanupWorker_1 = require("./cleanupWorker");
const keepAlive_1 = require("./keepAlive");
(0, cleanupWorker_1.initCleanupWorker)();
(0, keepAlive_1.initKeepAlive)();
// Error Handling
app.use((req, res) => {
    (0, response_1.sendError)(res, 'Route not found', 404);
});
// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/worktoolshub';
mongoose_1.default
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
exports.default = app;
