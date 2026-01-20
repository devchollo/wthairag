"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertWordToPdf = exports.convertPdfToWord = exports.textToPdf = exports.convertImage = exports.downloadFile = exports.combinePDFs = void 0;
const pdf_lib_1 = require("pdf-lib");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const response_1 = require("../utils/response");
const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const htmlToDocx = require('html-to-docx');
const TEMP_DIR = path_1.default.join(process.cwd(), 'temp');
// Ensure temp directory exists
if (!fs_1.default.existsSync(TEMP_DIR)) {
    fs_1.default.mkdirSync(TEMP_DIR, { recursive: true });
}
// Clean up old files (run periodically)
const cleanupOldFiles = () => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    try {
        const files = fs_1.default.readdirSync(TEMP_DIR);
        files.forEach(file => {
            const filePath = path_1.default.join(TEMP_DIR, file);
            const stat = fs_1.default.statSync(filePath);
            if (now - stat.mtimeMs > maxAge) {
                fs_1.default.unlinkSync(filePath);
            }
        });
    }
    catch (e) {
        console.error('Cleanup error:', e);
    }
};
// Run cleanup every 5 minutes
setInterval(cleanupOldFiles, 5 * 60 * 1000);
// PDF Combiner
const combinePDFs = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length < 2) {
            return (0, response_1.sendError)(res, 'At least 2 PDF files are required', 400);
        }
        // Validate all files are PDFs
        for (const file of files) {
            if (file.mimetype !== 'application/pdf') {
                return (0, response_1.sendError)(res, 'All files must be PDFs', 400);
            }
        }
        // Create merged PDF
        const mergedPdf = await pdf_lib_1.PDFDocument.create();
        for (const file of files) {
            const pdfBytes = file.buffer;
            const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        const mergedPdfBytes = await mergedPdf.save();
        // Generate unique filename
        const filename = `combined_${Date.now()}.pdf`;
        const filePath = path_1.default.join(TEMP_DIR, filename);
        // Save to temp directory
        fs_1.default.writeFileSync(filePath, Buffer.from(mergedPdfBytes));
        // Return download URL
        const downloadUrl = `/api/files/download/${filename}`;
        return (0, response_1.sendSuccess)(res, {
            filename,
            downloadUrl,
            pageCount: mergedPdf.getPageCount(),
            fileSize: mergedPdfBytes.length,
            expiresIn: '30 minutes'
        }, 'PDFs combined successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `Failed to combine PDFs: ${error.message}`, 500);
    }
};
exports.combinePDFs = combinePDFs;
// File Download
const downloadFile = async (req, res) => {
    try {
        const { filename } = req.params;
        // Sanitize filename to prevent directory traversal
        const sanitizedFilename = path_1.default.basename(filename);
        const filePath = path_1.default.join(TEMP_DIR, sanitizedFilename);
        if (!fs_1.default.existsSync(filePath)) {
            return (0, response_1.sendError)(res, 'File not found or expired', 404);
        }
        res.download(filePath, sanitizedFilename, (err) => {
            if (!err) {
                // Schedule deletion 5 minutes after successful download
                setTimeout(() => {
                    try {
                        if (fs_1.default.existsSync(filePath)) {
                            fs_1.default.unlinkSync(filePath);
                            console.log(`Auto-deleted downloaded file: ${sanitizedFilename}`);
                        }
                    }
                    catch (e) {
                        console.error(`Failed to auto-delete ${sanitizedFilename}:`, e);
                    }
                }, 5 * 60 * 1000);
            }
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, `Download failed: ${error.message}`, 500);
    }
};
exports.downloadFile = downloadFile;
// Image Converter (PNG <-> JPG)
const convertImage = async (req, res) => {
    try {
        const file = req.file;
        const { targetFormat } = req.body;
        if (!file) {
            return (0, response_1.sendError)(res, 'Image file is required', 400);
        }
        const validFormats = ['png', 'jpg', 'jpeg', 'webp'];
        if (!validFormats.includes(targetFormat?.toLowerCase())) {
            return (0, response_1.sendError)(res, 'Invalid target format. Use: png, jpg, jpeg, or webp', 400);
        }
        let converted;
        switch (targetFormat.toLowerCase()) {
            case 'png':
                converted = await sharp(file.buffer).png().toBuffer();
                break;
            case 'jpg':
            case 'jpeg':
                converted = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();
                break;
            case 'webp':
                converted = await sharp(file.buffer).webp({ quality: 90 }).toBuffer();
                break;
            default:
                return (0, response_1.sendError)(res, 'Unsupported format', 400);
        }
        // Save to temp
        const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
        const filename = `converted_${Date.now()}.${ext}`;
        const filePath = path_1.default.join(TEMP_DIR, filename);
        fs_1.default.writeFileSync(filePath, converted);
        return (0, response_1.sendSuccess)(res, {
            filename,
            downloadUrl: `/api/files/download/${filename}`,
            originalSize: file.size,
            convertedSize: converted.length,
            format: targetFormat,
            expiresIn: '30 minutes'
        }, 'Image converted successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `Conversion failed: ${error.message}`, 500);
    }
};
exports.convertImage = convertImage;
// Helper: Create PDF from Text
const createPdfBuffFromText = async (text) => {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const fontSize = 12;
    const margin = 50;
    const lineHeight = fontSize * 1.5;
    const maxWidth = page.getWidth() - margin * 2;
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length * (fontSize * 0.5) > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
        }
        else {
            currentLine = testLine;
        }
    }
    if (currentLine)
        lines.push(currentLine);
    let y = page.getHeight() - margin;
    let currentPage = page;
    for (const line of lines) {
        if (y < margin) {
            currentPage = pdfDoc.addPage([612, 792]);
            y = currentPage.getHeight() - margin;
        }
        currentPage.drawText(line, { x: margin, y, size: fontSize });
        y -= lineHeight;
    }
    return await pdfDoc.save();
};
// Text to PDF Converter
const textToPdf = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string') {
            return (0, response_1.sendError)(res, 'Text content is required', 400);
        }
        const pdfBytes = await createPdfBuffFromText(text);
        const filename = `text_${Date.now()}.pdf`;
        const filePath = path_1.default.join(TEMP_DIR, filename);
        fs_1.default.writeFileSync(filePath, Buffer.from(pdfBytes));
        return (0, response_1.sendSuccess)(res, {
            filename,
            downloadUrl: `/api/files/download/${filename}`,
            convertedSize: pdfBytes.length,
            expiresIn: '30 minutes'
        }, 'Text converted to PDF');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `Conversion failed: ${error.message}`, 500);
    }
};
exports.textToPdf = textToPdf;
// PDF to Word (Simple Text Extraction)
const convertPdfToWord = async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return (0, response_1.sendError)(res, 'PDF file is required', 400);
        const data = await pdfParse(file.buffer);
        const text = data.text;
        // Wrap text in basic HTML for docx conversion with preserved paragraphs
        const htmlContent = `<html><body>${text.split('\n').map((line) => `<p>${line || '&nbsp;'}</p>`).join('')}</body></html>`;
        const docxBuffer = await htmlToDocx(htmlContent, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });
        const filename = `converted_${Date.now()}.docx`;
        const filePath = path_1.default.join(TEMP_DIR, filename);
        fs_1.default.writeFileSync(filePath, docxBuffer);
        return (0, response_1.sendSuccess)(res, {
            filename,
            downloadUrl: `/api/files/download/${filename}`,
            originalSize: file.size,
            convertedSize: docxBuffer.length,
            format: 'docx',
            expiresIn: '30 minutes'
        }, 'PDF converted to Word successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `PDF to Word failed: ${error.message}`, 500);
    }
};
exports.convertPdfToWord = convertPdfToWord;
// Word to PDF
const convertWordToPdf = async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return (0, response_1.sendError)(res, 'Word file is required', 400);
        // Extract raw text
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        const text = result.value;
        if (!text)
            return (0, response_1.sendError)(res, 'Could not extract text from Word document', 400);
        const pdfBytes = await createPdfBuffFromText(text);
        const filename = `converted_${Date.now()}.pdf`;
        const filePath = path_1.default.join(TEMP_DIR, filename);
        fs_1.default.writeFileSync(filePath, Buffer.from(pdfBytes));
        return (0, response_1.sendSuccess)(res, {
            filename,
            downloadUrl: `/api/files/download/${filename}`,
            convertedSize: pdfBytes.length,
            format: 'pdf',
            expiresIn: '30 minutes'
        }, 'Word converted to PDF successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `Word to PDF failed: ${error.message}`, 500);
    }
};
exports.convertWordToPdf = convertWordToPdf;
