"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const workspace_1 = require("../middleware/workspace");
const analyticsController_1 = require("../controllers/analyticsController");
const router = express_1.default.Router();
// All routes require auth and workspace context
router.use(auth_1.protect);
router.use(workspace_1.workspaceOverlay);
router.get('/user', analyticsController_1.getUserStats);
router.get('/workspace', analyticsController_1.getWorkspaceStats); // Ideally add checkRole('admin') if ready
exports.default = router;
