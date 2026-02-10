"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const membershipController_1 = require("../controllers/membershipController");
const auth_1 = require("../middleware/auth");
const workspace_1 = require("../middleware/workspace");
const router = express_1.default.Router();
// Public onboarding
router.post('/accept-invite', membershipController_1.acceptInvite);
router.use(auth_1.protect);
router.use(workspace_1.workspaceOverlay);
router.get('/', membershipController_1.listMembers);
router.get('/invites/pending', (0, workspace_1.authorize)('owner', 'admin'), membershipController_1.listPendingInvites);
router.delete('/invites/:id', (0, workspace_1.authorize)('owner', 'admin'), membershipController_1.cancelInvite);
router.post('/invite', (0, workspace_1.authorize)('owner', 'admin'), membershipController_1.inviteMember);
router.put('/:membershipId', (0, workspace_1.authorize)('owner', 'admin'), membershipController_1.updateMemberRole);
router.delete('/:membershipId', (0, workspace_1.authorize)('owner', 'admin'), membershipController_1.removeMember);
exports.default = router;
