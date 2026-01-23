import express from 'express';
import { listMembers, updateMemberRole, removeMember, inviteMember, acceptInvite, listPendingInvites, cancelInvite } from '../controllers/membershipController';
import { protect } from '../middleware/auth';
import { workspaceOverlay, authorize } from '../middleware/workspace';

const router = express.Router();

// Public onboarding
router.post('/accept-invite', acceptInvite);

router.use(protect);
router.use(workspaceOverlay);

router.get('/', listMembers);
router.get('/invites/pending', authorize('owner', 'admin'), listPendingInvites);
router.delete('/invites/:id', authorize('owner', 'admin'), cancelInvite);
router.post('/invite', authorize('owner', 'admin'), inviteMember);
router.put('/:membershipId', authorize('owner', 'admin'), updateMemberRole);
router.delete('/:membershipId', authorize('owner', 'admin'), removeMember);

export default router;
