import express from 'express';
import { getWorkspace, updateWorkspace, deleteWorkspaceRequest, cancelDeleteWorkspace } from '../controllers/workspaceController';
import { protect } from '../middleware/auth';
import { workspaceOverlay, authorize } from '../middleware/workspace';

const router = express.Router();

router.use(protect);

router.get('/:slug', getWorkspace);
router.put('/:workspaceId', workspaceOverlay, authorize('owner', 'admin'), updateWorkspace);
router.delete('/:workspaceId', workspaceOverlay, authorize('owner'), deleteWorkspaceRequest);
router.post('/:workspaceId/cancel-deletion', workspaceOverlay, authorize('owner'), cancelDeleteWorkspace);

export default router;
