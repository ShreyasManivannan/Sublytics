import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getMonthlySpending,
  getCategoryBreakdown,
  getYearlyTotal,
  getTrends,
} from '../controllers/analyticsController.js';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

router.get('/monthly', getMonthlySpending);
router.get('/categories', getCategoryBreakdown);
router.get('/yearly', getYearlyTotal);
router.get('/trends', getTrends);

export default router;
