import express from 'express';
import { dnsLookup, generatePassword, getSSLReport, generateQR, whoisLookup, whoIsHostingThis, getIpDetails, webhookTest } from '../controllers/toolsController';
import { seoChecker, aeoChecker, geoChecker, aioChecker } from '../controllers/seoController';

const router = express.Router();

// Infrastructure Tools (Strict Limits)
import { strictLimiter, aiLimiter } from '../server';

router.post('/dns', strictLimiter, dnsLookup);
router.post('/password', strictLimiter, generatePassword);
router.post('/ssl', strictLimiter, getSSLReport);
router.post('/qr', strictLimiter, generateQR);
router.post('/whois', strictLimiter, whoisLookup);
router.post('/hosting', strictLimiter, whoIsHostingThis);
router.post('/ip', strictLimiter, getIpDetails);
router.post('/webhook', strictLimiter, webhookTest);

// SEO/AI Analysis Tools (AI Limits)
router.post('/seo', aiLimiter, seoChecker);
router.post('/aeo', aiLimiter, aeoChecker);
router.post('/geo', aiLimiter, geoChecker);
router.post('/aio', aiLimiter, aioChecker);

export default router;
