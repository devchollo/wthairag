import express from 'express';
import { login, logout, getMe, initiateSignup, verifyEmail, completeSignup, updateMe, updatePassword, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();


router.post('/login', login);
router.post('/logout', logout);
router.post('/signup/initiate', initiateSignup);
router.post('/signup/verify', verifyEmail);
router.post('/signup/complete', completeSignup);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/update-me', protect, updateMe);
router.put('/update-password', protect, updatePassword);

export default router;
