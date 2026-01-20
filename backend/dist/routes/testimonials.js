"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Testimonial_1 = __importDefault(require("../models/Testimonial"));
const response_1 = require("../utils/response");
const server_1 = require("../server");
const router = express_1.default.Router();
// Public: Submit a testimonial
router.post('/', server_1.strictLimiter, async (req, res) => {
    try {
        const { name, role, text, rating } = req.body;
        if (!name || !role || !text || !rating) {
            return (0, response_1.sendError)(res, 'All fields are required', 400);
        }
        const testimonial = await Testimonial_1.default.create({
            name,
            role,
            text,
            rating,
            isApproved: false // Requires admin approval
        });
        return (0, response_1.sendSuccess)(res, testimonial, 'Testimonial submitted successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
});
// Public: Get approved testimonials
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial_1.default.find({ isApproved: true }).sort({ createdAt: -1 });
        return (0, response_1.sendSuccess)(res, testimonials);
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
});
exports.default = router;
