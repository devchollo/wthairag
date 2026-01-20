
import express from 'express';
import Testimonial from '../models/Testimonial';
import { sendSuccess, sendError } from '../utils/response';
import { strictLimiter } from '../server';

const router = express.Router();

// Public: Submit a testimonial
router.post('/', strictLimiter, async (req, res) => {
    try {
        const { name, role, text, rating } = req.body;

        if (!name || !role || !text || !rating) {
            return sendError(res, 'All fields are required', 400);
        }

        const testimonial = await Testimonial.create({
            name,
            role,
            text,
            rating,
            isApproved: false // Requires admin approval
        });

        return sendSuccess(res, testimonial, 'Testimonial submitted successfully');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
});

// Public: Get approved testimonials
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
        return sendSuccess(res, testimonials);
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
});

export default router;
