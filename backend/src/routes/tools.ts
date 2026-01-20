import express from 'express';
import { dnsLookup, generatePassword, getSSLReport, generateQR, whoisLookup, whoIsHostingThis } from '../controllers/toolsController';
import { seoChecker, aeoChecker, geoChecker, aioChecker } from '../controllers/seoController';

const router = express.Router();

// Infrastructure Tools
router.post('/dns', dnsLookup);
router.post('/password', generatePassword);
router.post('/ssl', getSSLReport);
router.post('/qr', generateQR);
router.post('/whois', whoisLookup);
router.post('/hosting', whoIsHostingThis);

// SEO/AI Analysis Tools
router.post('/seo', seoChecker);
router.post('/aeo', aeoChecker);
router.post('/geo', geoChecker);
router.post('/aio', aioChecker);

export default router;
