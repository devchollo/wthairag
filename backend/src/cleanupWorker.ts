import cron from 'node-cron';
import Document from './models/Document';
import Workspace from './models/Workspace';
import Membership from './models/Membership';
import Chat from './models/Chat';
import Alert from './models/Alert';
import { deleteFile } from './services/s3Service';

export const initCleanupWorker = () => {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        console.log('Running cleanup worker...');

        // 1. Delete temporary documents (placeholder logic: assuming temporary if marked in metadata or logic)
        // For this prompt, let's assume "temp" bucket or specific metadata
        const halfHourAgo = new Date(Date.now() - 30 * 60 * 1000);
        // Logic for temp file cleanup would go here
    });

    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running workspace deletion worker...');

        // 2. Hard delete workspaces pending deletion for > 7 days
        const now = new Date();
        const expiredWorkspaces = await Workspace.find({
            pendingDeletionAt: { $lte: now },
        });

        for (const workspace of expiredWorkspaces) {
            const workspaceId = workspace._id;

            // Delete from B2
            const docs = await Document.find({ workspaceId });
            for (const doc of docs) {
                if (doc.fileKey) {
                    await deleteFile(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey);
                }
            }

            // Hard delete from MongoDB
            await Document.deleteMany({ workspaceId });
            await Membership.deleteMany({ workspaceId });
            await Chat.deleteMany({ workspaceId });
            await Alert.deleteMany({ workspaceId });
            await workspace.deleteOne();

            console.log(`Hard deleted workspace: ${workspaceId}`);
        }
    });
};
