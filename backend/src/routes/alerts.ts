import express from 'express';
import { createAlert, listAlerts, resolveAlert, updateAlert, deleteAlert } from '../controllers/alertController';
import { protect } from '../middleware/auth';
import { workspaceOverlay, authorize } from '../middleware/workspace';

const router = express.Router();

router.use(protect);
router.use(workspaceOverlay);

router.post('/', authorize('owner', 'admin', 'member'), createAlert);
router.get('/', listAlerts);
router.put('/:id', authorize('owner', 'admin'), updateAlert);
router.put('/:id/resolve', authorize('owner', 'admin'), resolveAlert);
router.delete('/:id', authorize('owner', 'admin'), deleteAlert);

export default router;
