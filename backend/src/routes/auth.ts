import express from 'express';
import { login, logout, getMe, initiateSignup, verifyEmail, completeSignup } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();


router.post('/login', login);
router.post('/logout', logout);
router.post('/signup/initiate', initiateSignup);
router.post('/signup/verify', verifyEmail);
router.post('/signup/complete', completeSignup);
router.get('/me', protect, getMe);

export default router;
