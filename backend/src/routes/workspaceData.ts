import express from 'express';
import multer from 'multer';
import { uploadDocument, listDocuments, deleteDocument } from '../controllers/knowledgeController';
import { queryChat, getChats } from '../controllers/chatController';
import { protect } from '../middleware/auth';
import { workspaceOverlay, authorize } from '../middleware/workspace';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(workspaceOverlay);

// Knowledge
router.post('/knowledge', authorize('owner', 'admin', 'member'), upload.single('file'), uploadDocument);
router.get('/knowledge', listDocuments);
router.delete('/knowledge/:id', authorize('owner', 'admin'), deleteDocument);

// Chat
router.post('/chat', queryChat);
router.get('/chat', getChats);

export default router;
