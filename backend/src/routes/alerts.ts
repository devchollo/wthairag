import express from 'express';
import { createAlert, listAlerts, resolveAlert } from '../controllers/alertController';
import { protect } from '../middleware/auth';
import { workspaceOverlay, authorize } from '../middleware/workspace';

const router = express.Router();

router.use(protect);
router.use(workspaceOverlay);

router.post('/', authorize('owner', 'admin', 'member'), createAlert);
router.get('/', listAlerts);
router.put('/:id/resolve', authorize('owner', 'admin'), resolveAlert);

export default router;
