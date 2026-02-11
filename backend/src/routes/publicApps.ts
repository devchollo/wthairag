import express from 'express';
import multer from 'multer';
import { aiLimiter } from '../server';
import { getPublicSharedApp, submitPublicSharedApp } from '../controllers/appController';

const router = express.Router();

const formSubmitUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024,
        files: 10,
    },
});

router.get('/:shareToken', getPublicSharedApp);
router.post('/:shareToken/submit', aiLimiter, formSubmitUpload.any(), submitPublicSharedApp);

export default router;
