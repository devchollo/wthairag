"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fileController_1 = require("../controllers/fileController");
const aiToolsController_1 = require("../controllers/aiToolsController");
const router = express_1.default.Router();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Max 10 files
    }
});
// File processing routes
router.post('/pdf/combine', upload.array('files', 10), fileController_1.combinePDFs);
router.post('/image/convert', upload.single('file'), fileController_1.convertImage);
router.post('/text-to-pdf', fileController_1.textToPdf);
router.post('/pdf/to-word', upload.single('file'), fileController_1.convertPdfToWord);
router.post('/word/to-pdf', upload.single('file'), fileController_1.convertWordToPdf);
router.post('/alt-text', upload.single('file'), aiToolsController_1.generateAltText);
router.get('/download/:filename', fileController_1.downloadFile);
exports.default = router;
