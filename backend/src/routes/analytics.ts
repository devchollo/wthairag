import express from 'express';
import { protect } from '../middleware/auth';
import { workspaceOverlay } from '../middleware/workspace';
import { getUserStats, getWorkspaceStats } from '../controllers/analyticsController';

const router = express.Router();

// All routes require auth and workspace context
router.use(protect);
router.use(workspaceOverlay);

router.get('/user', getUserStats);
router.get('/workspace', getWorkspaceStats); // Ideally add checkRole('admin') if ready

export default router;
