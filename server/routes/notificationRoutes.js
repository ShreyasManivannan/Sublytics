import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getPreferences,
  updatePreferences,
  sendTestEmail,
  sendTestSMS,
} from '../controllers/notificationController.js';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.post('/test-email', sendTestEmail);
router.post('/test-sms', sendTestSMS);

export default router;
