import { Request, Response } from 'express';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import { sendSuccess, sendError } from '../utils/response';

const TEMP_DIR = path.join(process.cwd(), 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Clean up old files (run periodically)
const cleanupOldFiles = () => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    try {
        const files = fs.readdirSync(TEMP_DIR);
        files.forEach(file => {
            const filePath = path.join(TEMP_DIR, file);
            const stat = fs.statSync(filePath);
            if (now - stat.mtimeMs > maxAge) {
                fs.unlinkSync(filePath);
            }
        });
    } catch (e) {
        console.error('Cleanup error:', e);
    }
};

// Run cleanup every 5 minutes
setInterval(cleanupOldFiles, 5 * 60 * 1000);

// PDF Combiner
export const combinePDFs = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length < 2) {
            return sendError(res, 'At least 2 PDF files are required', 400);
        }

        // Validate all files are PDFs
        for (const file of files) {
            if (file.mimetype !== 'application/pdf') {
                return sendError(res, 'All files must be PDFs', 400);
            }
        }

        // Create merged PDF
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const pdfBytes = file.buffer;
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();

        // Generate unique filename
        const filename = `combined_${Date.now()}.pdf`;
        const filePath = path.join(TEMP_DIR, filename);

        // Save to temp directory
        fs.writeFileSync(filePath, Buffer.from(mergedPdfBytes));

        // Return download URL
        const downloadUrl = `/api/files/download/${filename}`;

        return sendSuccess(res, {
            filename,
            downloadUrl,
            pageCount: mergedPdf.getPageCount(),
            fileSize: mergedPdfBytes.length,
            expiresIn: '30 minutes'
        }, 'PDFs combined successfully');
    } catch (error: any) {
        return sendError(res, `Failed to combine PDFs: ${error.message}`, 500);
    }
};

// File Download
export const downloadFile = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;

        // Sanitize filename to prevent directory traversal
        const sanitizedFilename = path.basename(filename as string);
        const filePath = path.join(TEMP_DIR, sanitizedFilename);

        if (!fs.existsSync(filePath)) {
            return sendError(res, 'File not found or expired', 404);
        }

        res.download(filePath, sanitizedFilename, (err) => {
            if (!err) {
                // Schedule deletion 5 minutes after successful download
                setTimeout(() => {
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`Auto-deleted downloaded file: ${sanitizedFilename}`);
                        }
                    } catch (e) {
                        console.error(`Failed to auto-delete ${sanitizedFilename}:`, e);
                    }
                }, 5 * 60 * 1000);
            }
        });
    } catch (error: any) {
        return sendError(res, `Download failed: ${error.message}`, 500);
    }
};

// Image Converter (PNG <-> JPG)
export const convertImage = async (req: Request, res: Response) => {
    try {
        const file = req.file as Express.Multer.File;
        const { targetFormat } = req.body;

        if (!file) {
            return sendError(res, 'Image file is required', 400);
        }

        const validFormats = ['png', 'jpg', 'jpeg', 'webp'];
        if (!validFormats.includes(targetFormat?.toLowerCase())) {
            return sendError(res, 'Invalid target format. Use: png, jpg, jpeg, or webp', 400);
        }

        const sharp = require('sharp');
        let converted: Buffer;

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
                return sendError(res, 'Unsupported format', 400);
        }

        // Save to temp
        const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
        const filename = `converted_${Date.now()}.${ext}`;
        const filePath = path.join(TEMP_DIR, filename);
        fs.writeFileSync(filePath, converted);

        return sendSuccess(res, {
            filename,
            downloadUrl: `/api/files/download/${filename}`,
            originalSize: file.size,
            convertedSize: converted.length,
            format: targetFormat,
            expiresIn: '30 minutes'
        }, 'Image converted successfully');
    } catch (error: any) {
        return sendError(res, `Conversion failed: ${error.message}`, 500);
    }
};

// Text to PDF Converter
export const textToPdf = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return sendError(res, 'Text content is required', 400);
        }

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]); // Letter size

        // Simple text rendering (basic implementation)
        const fontSize = 12;
        const margin = 50;
        const lineHeight = fontSize * 1.5;
        const maxWidth = page.getWidth() - margin * 2;

        // Split text into lines
        const words = text.split(' ');
        let lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (testLine.length * (fontSize * 0.5) > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);

        // Draw text
        let y = page.getHeight() - margin;
        for (const line of lines) {
            if (y < margin) {
                // Add new page if needed
                const newPage = pdfDoc.addPage([612, 792]);
                y = newPage.getHeight() - margin;
            }
            page.drawText(line, { x: margin, y, size: fontSize });
            y -= lineHeight;
        }

        const pdfBytes = await pdfDoc.save();
        const filename = `text_${Date.now()}.pdf`;
        const filePath = path.join(TEMP_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(pdfBytes));

        return sendSuccess(res, {
            filename,
            downloadUrl: `/api/files/download/${filename}`,
            pageCount: pdfDoc.getPageCount(),
            expiresIn: '30 minutes'
        }, 'Text converted to PDF');
    } catch (error: any) {
        return sendError(res, `Conversion failed: ${error.message}`, 500);
    }
};
