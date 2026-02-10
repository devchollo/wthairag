"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
router.use(auth_1.protect, admin_1.requireOwner);
router.get('/overview', adminController_1.getAdminOverview);
router.get('/tenants', adminController_1.getAdminTenants);
router.get('/testimonials', adminController_1.getAdminTestimonials);
router.get('/system-config', adminController_1.getSystemConfig);
router.put('/testimonials/:id/approve', adminController_1.approveTestimonial);
router.delete('/testimonials/:id/reject', adminController_1.rejectTestimonial);
exports.default = router;
