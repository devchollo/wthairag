"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/login', authController_1.login);
router.post('/logout', authController_1.logout);
router.post('/signup/initiate', authController_1.initiateSignup);
router.post('/signup/verify', authController_1.verifyEmail);
router.post('/signup/complete', authController_1.completeSignup);
router.get('/me', auth_1.protect, authController_1.getMe);
router.put('/update-me', auth_1.protect, authController_1.updateMe);
router.put('/update-password', auth_1.protect, authController_1.updatePassword);
exports.default = router;
