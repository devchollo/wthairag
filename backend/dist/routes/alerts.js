"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const alertController_1 = require("../controllers/alertController");
const auth_1 = require("../middleware/auth");
const workspace_1 = require("../middleware/workspace");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.use(workspace_1.workspaceOverlay);
router.post('/', (0, workspace_1.authorize)('owner', 'admin'), alertController_1.createAlert);
router.get('/', alertController_1.listAlerts);
router.put('/:id', (0, workspace_1.authorize)('owner', 'admin'), alertController_1.updateAlert);
router.put('/:id/resolve', (0, workspace_1.authorize)('owner', 'admin'), alertController_1.resolveAlert);
router.delete('/:id', (0, workspace_1.authorize)('owner', 'admin'), alertController_1.deleteAlert);
exports.default = router;
