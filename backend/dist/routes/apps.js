"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appController_1 = require("../controllers/appController");
const auth_1 = require("../middleware/auth");
const workspace_1 = require("../middleware/workspace");
const server_1 = require("../server");
const router = express_1.default.Router({ mergeParams: true });
// All routes require auth and workspace context
router.use(auth_1.protect);
router.use(workspace_1.workspaceOverlay);
// Public-ish routes (Members/Viewers)
router.get('/', appController_1.getApps); // Filtered by status inside controller
router.get('/:appId', appController_1.getApp); // Filtered by status inside controller
router.post('/:appId/run', server_1.aiLimiter, appController_1.runApp);
// Admin-only routes
router.post('/', (0, workspace_1.authorize)('owner', 'admin'), appController_1.createApp);
router.put('/:appId', (0, workspace_1.authorize)('owner', 'admin'), appController_1.updateApp);
router.delete('/:appId', (0, workspace_1.authorize)('owner', 'admin'), appController_1.deleteApp);
// Only admins can manage assets usually
router.post('/:appId/logo/upload-url', (0, workspace_1.authorize)('owner', 'admin'), appController_1.getLogoUploadUrl);
router.post('/:appId/logo/confirm', (0, workspace_1.authorize)('owner', 'admin'), appController_1.confirmLogo);
router.delete('/:appId/logo', (0, workspace_1.authorize)('owner', 'admin'), appController_1.deleteLogo);
exports.default = router;
