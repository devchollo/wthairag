"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const knowledgeController_1 = require("../controllers/knowledgeController");
const chatController_1 = require("../controllers/chatController");
const workspaceDataController_1 = require("../controllers/workspaceDataController");
const auth_1 = require("../middleware/auth");
const workspace_1 = require("../middleware/workspace");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.use(auth_1.protect);
router.use(workspace_1.workspaceOverlay);
// Stats
router.get('/stats', workspaceDataController_1.getWorkspaceStats);
// Knowledge
router.post('/knowledge', (0, workspace_1.authorize)('owner', 'admin'), upload.single('file'), knowledgeController_1.uploadDocument);
router.post('/knowledge/manual', (0, workspace_1.authorize)('owner', 'admin'), knowledgeController_1.createManualDocument);
router.get('/knowledge', knowledgeController_1.listDocuments);
router.get('/knowledge/:id/download', (0, workspace_1.authorize)('owner', 'admin', 'member'), knowledgeController_1.downloadDocument);
router.delete('/knowledge/:id', (0, workspace_1.authorize)('owner', 'admin'), knowledgeController_1.deleteDocument);
// Chat
router.post('/chat', chatController_1.queryChat);
router.get('/chat', chatController_1.getChats);
exports.default = router;
