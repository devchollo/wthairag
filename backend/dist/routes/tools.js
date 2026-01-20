"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const toolsController_1 = require("../controllers/toolsController");
const seoController_1 = require("../controllers/seoController");
const router = express_1.default.Router();
// Infrastructure Tools (Strict Limits)
const server_1 = require("../server");
router.post('/dns', server_1.strictLimiter, toolsController_1.dnsLookup);
router.post('/password', server_1.strictLimiter, toolsController_1.generatePassword);
router.post('/ssl', server_1.strictLimiter, toolsController_1.getSSLReport);
router.post('/qr', server_1.strictLimiter, toolsController_1.generateQR);
router.post('/whois', server_1.strictLimiter, toolsController_1.whoisLookup);
router.post('/hosting', server_1.strictLimiter, toolsController_1.whoIsHostingThis);
router.post('/ip', server_1.strictLimiter, toolsController_1.getIpDetails);
router.post('/webhook', server_1.strictLimiter, toolsController_1.webhookTest);
// SEO/AI Analysis Tools (AI Limits)
router.post('/seo', server_1.aiLimiter, seoController_1.seoChecker);
router.post('/aeo', server_1.aiLimiter, seoController_1.aeoChecker);
router.post('/geo', server_1.aiLimiter, seoController_1.geoChecker);
router.post('/aio', server_1.aiLimiter, seoController_1.aioChecker);
exports.default = router;
