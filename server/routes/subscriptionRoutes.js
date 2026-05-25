import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getStats,
  scanInvoice,
} from '../controllers/subscriptionController.js';

const router = Router();

// All subscription routes require authentication
router.use(authMiddleware);

// Scan invoice OCR (must come before dynamic :id params)
router.post('/scan', scanInvoice);

// Stats must come before :id to avoid treating "stats" as an id param
router.get('/stats', getStats);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
