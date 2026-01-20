import express from 'express';
import multer from 'multer';
import { combinePDFs, downloadFile, convertImage, textToPdf } from '../controllers/fileController';
import { generateAltText } from '../controllers/aiToolsController';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Max 10 files
    }
});

// File processing routes
router.post('/pdf/combine', upload.array('files', 10), combinePDFs);
router.post('/image/convert', upload.single('file'), convertImage);
router.post('/text-to-pdf', textToPdf);
router.post('/alt-text', upload.single('file'), generateAltText);
router.get('/download/:filename', downloadFile);

export default router;
