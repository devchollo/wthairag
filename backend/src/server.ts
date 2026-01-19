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
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/api/auth', authRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/workspace-data', workspaceDataRoutes);
app.use('/api/alerts', alertRoutes);

// Initialize Cleanup Worker
import { initCleanupWorker } from './cleanupWorker';
initCleanupWorker();

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
