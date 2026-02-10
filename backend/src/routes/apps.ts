import express from 'express';
import {
    createApp,
    getApps,
    getApp,
    updateApp,
    deleteApp,
    runApp,
    getLogoUploadUrl,
    confirmLogo,
    deleteLogo
} from '../controllers/appController';
import { protect } from '../middleware/auth';
import { workspaceOverlay, authorize } from '../middleware/workspace';
import { aiLimiter } from '../server';

const router = express.Router({ mergeParams: true });

// All routes require auth and workspace context
router.use(protect);
router.use(workspaceOverlay);

// Public-ish routes (Members/Viewers)
router.get('/', getApps); // Filtered by status inside controller
router.get('/:appId', getApp); // Filtered by status inside controller
router.post('/:appId/run', aiLimiter, runApp);

// Admin-only routes
router.post('/', authorize('owner', 'admin'), createApp);
router.put('/:appId', authorize('owner', 'admin'), updateApp);
router.delete('/:appId', authorize('owner', 'admin'), deleteApp);

// Only admins can manage assets usually
router.post('/:appId/logo/upload-url', authorize('owner', 'admin'), getLogoUploadUrl);
router.post('/:appId/logo/confirm', authorize('owner', 'admin'), confirmLogo);
router.delete('/:appId/logo', authorize('owner', 'admin'), deleteLogo);

export default router;
