"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCleanupWorker = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const Document_1 = __importDefault(require("./models/Document"));
const Workspace_1 = __importDefault(require("./models/Workspace"));
const Membership_1 = __importDefault(require("./models/Membership"));
const Chat_1 = __importDefault(require("./models/Chat"));
const Alert_1 = __importDefault(require("./models/Alert"));
const s3Service_1 = require("./services/s3Service");
const initCleanupWorker = () => {
    // Run every 30 minutes
    node_cron_1.default.schedule('*/30 * * * *', async () => {
        console.log('Running cleanup worker...');
        // 1. Delete temporary documents (placeholder logic: assuming temporary if marked in metadata or logic)
        // For this prompt, let's assume "temp" bucket or specific metadata
        const halfHourAgo = new Date(Date.now() - 30 * 60 * 1000);
        // Logic for temp file cleanup would go here
    });
    // Run every day at midnight
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log('Running workspace deletion worker...');
        // 2. Hard delete workspaces pending deletion for > 7 days
        const now = new Date();
        const expiredWorkspaces = await Workspace_1.default.find({
            pendingDeletionAt: { $lte: now },
        });
        for (const workspace of expiredWorkspaces) {
            const workspaceId = workspace._id;
            // Delete from B2
            const docs = await Document_1.default.find({ workspaceId });
            for (const doc of docs) {
                if (doc.fileKey) {
                    await (0, s3Service_1.deleteFile)(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey);
                }
            }
            // Hard delete from MongoDB
            await Document_1.default.deleteMany({ workspaceId });
            await Membership_1.default.deleteMany({ workspaceId });
            await Chat_1.default.deleteMany({ workspaceId });
            await Alert_1.default.deleteMany({ workspaceId });
            await workspace.deleteOne();
            console.log(`Hard deleted workspace: ${workspaceId}`);
        }
    });
};
exports.initCleanupWorker = initCleanupWorker;
