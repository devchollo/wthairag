"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workspaceController_1 = require("../controllers/workspaceController");
const auth_1 = require("../middleware/auth");
const workspace_1 = require("../middleware/workspace");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/:slug', workspaceController_1.getWorkspace);
router.put('/:workspaceId', workspace_1.workspaceOverlay, (0, workspace_1.authorize)('owner', 'admin'), workspaceController_1.updateWorkspace);
router.delete('/:workspaceId', workspace_1.workspaceOverlay, (0, workspace_1.authorize)('owner'), workspaceController_1.deleteWorkspaceRequest);
router.post('/:workspaceId/cancel-deletion', workspace_1.workspaceOverlay, (0, workspace_1.authorize)('owner'), workspaceController_1.cancelDeleteWorkspace);
exports.default = router;
