import express from 'express';
import { login, getMe, initiateSignup, verifyEmail, completeSignup } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
