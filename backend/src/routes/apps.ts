import express from 'express';
import {
    createApp,
    getApps,
    getApp,
    updateApp,
    deleteApp,
    runApp,
    submitFormApp,
    getLogoUploadUrl,
    confirmLogo,
    uploadLogo,
    deleteLogo,
    getBackgroundUploadUrl,
    confirmBackground,
    uploadBackground,
    updateBackground
} from '../controllers/appController';
import { protect } from '../middleware/auth';
import { workspaceOverlay, authorize } from '../middleware/workspace';
import { aiLimiter } from '../server';
import multer from 'multer';

const router = express.Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() });
const formSubmitUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024,
        files: 10,
    },
});

// All routes require auth and workspace context
router.use(protect);
router.use(workspaceOverlay);

// Public-ish routes (Members/Viewers)
router.get('/', getApps);
router.get('/:appId', getApp);
router.post('/:appId/run', aiLimiter, formSubmitUpload.any(), runApp);
router.post('/:appId/submit', aiLimiter, formSubmitUpload.any(), submitFormApp);

// Admin-only routes
router.post('/', authorize('owner', 'admin'), createApp);
router.put('/:appId', authorize('owner', 'admin'), updateApp);
router.delete('/:appId', authorize('owner', 'admin'), deleteApp);

// Asset management (admin-only)
router.post('/:appId/logo/upload-url', authorize('owner', 'admin'), getLogoUploadUrl);
router.post('/:appId/logo/confirm', authorize('owner', 'admin'), confirmLogo);
router.post('/:appId/logo/upload', authorize('owner', 'admin'), upload.single('file'), uploadLogo);
router.delete('/:appId/logo', authorize('owner', 'admin'), deleteLogo);

// Background management (admin-only)
router.post('/:appId/background/upload-url', authorize('owner', 'admin'), getBackgroundUploadUrl);
router.post('/:appId/background/confirm', authorize('owner', 'admin'), confirmBackground);
router.post('/:appId/background/upload', authorize('owner', 'admin'), upload.single('file'), uploadBackground);
router.put('/:appId/background', authorize('owner', 'admin'), updateBackground);

export default router;
