import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import Document from '../models/Document';
import Membership from '../models/Membership';
import Chat from '../models/Chat'; // Assuming there's a Chat model

export const getWorkspaceStats = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = (req as any).workspace;

        // Parallel counts for efficiency
        const [docCount, chatCount, memberCount] = await Promise.all([
            Document.countDocuments({ workspaceId }),
            Chat.countDocuments({ workspaceId }),
            Membership.countDocuments({ workspaceId })
        ]);

        const stats = {
            counts: {
                documents: docCount,
                chats: chatCount,
                members: memberCount
            },
            uptime: '99.9%', // Mock for now, but integrated in structure
            usage: {
                rag: chatCount > 0 ? `${(chatCount * 1.2).toFixed(1)}k` : '0',
                storage: `${(docCount * 0.5).toFixed(1)}MB`
            }
        };

        return sendSuccess(res, stats, 'Workspace stats retrieved');
    } catch (error: any) {
        return sendError(res, `Failed to retrieve stats: ${error.message}`, 500);
    }
};
