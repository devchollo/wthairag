import express from 'express';
import { protect } from '../middleware/auth';
import { requireOwner } from '../middleware/admin';
import {
    approveTestimonial,
    getAdminOverview,
    getAdminTenants,
    getAdminTestimonials,
    rejectTestimonial
} from '../controllers/adminController';

const router = express.Router();

router.use(protect, requireOwner);

router.get('/overview', getAdminOverview);
router.get('/tenants', getAdminTenants);
router.get('/testimonials', getAdminTestimonials);
router.put('/testimonials/:id/approve', approveTestimonial);
router.delete('/testimonials/:id/reject', rejectTestimonial);

export default router;
