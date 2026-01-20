import express from 'express';
import multer from 'multer';
import { uploadDocument, listDocuments, deleteDocument, createManualDocument, downloadDocument } from '../controllers/knowledgeController';
import { queryChat, getChats } from '../controllers/chatController';
import { getWorkspaceStats } from '../controllers/workspaceDataController';
import { protect } from '../middleware/auth';
import { workspaceOverlay, authorize } from '../middleware/workspace';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(workspaceOverlay);

// Stats
router.get('/stats', getWorkspaceStats);

// Knowledge
router.post('/knowledge', authorize('owner', 'admin'), upload.single('file'), uploadDocument);
router.post('/knowledge/manual', authorize('owner', 'admin'), createManualDocument);
router.get('/knowledge', listDocuments);
router.get('/knowledge/:id/download', authorize('owner', 'admin', 'member'), downloadDocument);
router.delete('/knowledge/:id', authorize('owner', 'admin'), deleteDocument);

// Chat
router.post('/chat', queryChat);
router.get('/chat', getChats);

export default router;
