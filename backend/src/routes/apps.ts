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
    deleteLogo,
    uploadBackgroundImage,
    updateBackground
} from '../controllers/appController';
import { protect } from '../middleware/auth';
import { workspaceOverlay, authorize } from '../middleware/workspace';
import { aiLimiter } from '../server';

const router = express.Router({ mergeParams: true });

// All routes require auth and workspace context
router.use(protect);
router.use(workspaceOverlay);

// Public-ish routes (Members/Viewers)
router.get('/', getApps);
router.get('/:appId', getApp);
router.post('/:appId/run', aiLimiter, runApp);

// Admin-only routes
router.post('/', authorize('owner', 'admin'), createApp);
router.put('/:appId', authorize('owner', 'admin'), updateApp);
router.delete('/:appId', authorize('owner', 'admin'), deleteApp);

// Asset management (admin-only)
router.post('/:appId/logo/upload-url', authorize('owner', 'admin'), getLogoUploadUrl);
router.post('/:appId/logo/confirm', authorize('owner', 'admin'), confirmLogo);
router.delete('/:appId/logo', authorize('owner', 'admin'), deleteLogo);

// Background management (admin-only)
router.post('/:appId/background/upload', authorize('owner', 'admin'), uploadBackgroundImage);
router.put('/:appId/background', authorize('owner', 'admin'), updateBackground);

export default router;
