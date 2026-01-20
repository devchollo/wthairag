import express from 'express';
import { dnsLookup, generatePassword, getSSLReport, generateQR } from '../controllers/toolsController';

const router = express.Router();

router.post('/dns', dnsLookup);
router.post('/password', generatePassword);
router.post('/ssl', getSSLReport);
router.post('/qr', generateQR);

export default router;
