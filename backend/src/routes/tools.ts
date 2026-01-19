import express from 'express';
import { dnsLookup, generatePassword, getSSLReport } from '../controllers/toolsController';

const router = express.Router();

router.post('/dns', dnsLookup);
router.post('/password', generatePassword);
router.post('/ssl', getSSLReport);

export default router;
