import express from 'express';
import { listMembers, updateMemberRole, removeMember } from '../controllers/membershipController';
import { protect } from '../middleware/auth';
import { workspaceOverlay, authorize } from '../middleware/workspace';

const router = express.Router();

router.use(protect);
router.use(workspaceOverlay);

router.get('/', authorize('owner', 'admin'), listMembers);
router.put('/:membershipId', authorize('owner', 'admin'), updateMemberRole);
router.delete('/:membershipId', authorize('owner', 'admin'), removeMember);

export default router;
