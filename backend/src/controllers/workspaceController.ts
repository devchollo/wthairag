import { Request, Response } from 'express';
import Workspace from '../models/Workspace';
import Membership from '../models/Membership';
import Document from '../models/Document';
import Alert from '../models/Alert';
import Chat from '../models/Chat';
import UsageLog from '../models/UsageLog';
import Invitation from '../models/Invitation';
import { deleteFile } from '../services/s3Service';
import { sendSuccess, sendError } from '../utils/response';

export const getWorkspace = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const workspace = await Workspace.findOne({ slug });

        if (!workspace) {
            return sendError(res, 'Workspace not found', 404);
        }

        // Check if user has access
        const membership = await Membership.findOne({
            userId: req.user?._id,
            workspaceId: workspace._id,
        });

        if (!membership) {
            return sendError(res, 'You do not have access to this workspace', 403);
        }

        return sendSuccess(res, { workspace, role: membership.role }, 'Workspace fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const updateWorkspace = async (req: Request, res: Response) => {
    try {
        const { name, config } = req.body;
        const workspace = await Workspace.findByIdAndUpdate(
            req.workspace?._id,
            { name, config },
            { new: true }
        );
        return sendSuccess(res, workspace, 'Workspace updated');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const deleteWorkspaceRequest = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.workspace?._id;
        if (!workspaceId) return sendError(res, 'Workspace context missing', 400);

        // 1. Delete associated files from storage (S3/B2)
        const documents = await Document.find({ workspaceId });
        const fileDeletionPromises = documents
            .filter(doc => doc.fileKey)
            .map(doc => deleteFile(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey!).catch(err => {
                console.error(`Failed to delete file ${doc.fileKey}:`, err);
            }));

        await Promise.all(fileDeletionPromises);

        // 2. Delete all related database records
        await Promise.all([
            Document.deleteMany({ workspaceId }),
            Alert.deleteMany({ workspaceId }),
            Chat.deleteMany({ workspaceId }),
            UsageLog.deleteMany({ workspaceId }),
            Invitation.deleteMany({ workspaceId }),
            Membership.deleteMany({ workspaceId }) // Removes all members including owner
        ]);

        // 3. Delete the workspace itself
        await Workspace.findByIdAndDelete(workspaceId);

        return sendSuccess(res, null, 'Workspace and all associated data have been permanently terminated.');
    } catch (error: any) {
        console.error('Workspace termination failed:', error);
        return sendError(res, error.message, 500);
    }
};

export const cancelDeleteWorkspace = async (req: Request, res: Response) => {
    return sendError(res, 'Workspace deletion is now immediate and cannot be cancelled.', 400);
};
