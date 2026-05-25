import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  connectGmail,
  handleCallback,
  fetchInvoices,
  getStatus,
} from '../controllers/gmailController.js';

const router = Router();

// All Gmail routes require authentication
router.use(authMiddleware);

router.get('/connect', connectGmail);
router.post('/callback', handleCallback);
router.post('/fetch-invoices', fetchInvoices);
router.get('/status', getStatus);

export default router;
