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
        console.log('Running cleanup worker for temporary files...');

        const now = new Date();
        const expiredDocs = await Document.find({
            expiresAt: { $lte: now },
            workspaceId: { $exists: false } // Safeguard: Never cleanup workspace-scoped records
        });

        for (const doc of expiredDocs) {
            try {
                if (doc.fileKey) {
                    await deleteFile(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey);
                }
                await doc.deleteOne();
                console.log(`Auto-deleted expired document: ${doc._id} (${doc.title})`);
            } catch (err: any) {
                console.error(`Failed to cleanup document ${doc._id}:`, err.message);
            }
        }
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
