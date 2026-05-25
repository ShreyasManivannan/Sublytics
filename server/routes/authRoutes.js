import { Router } from 'express';
import { register, login, googleAuth, getProfile } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Public routes (no auth required)
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes
router.get('/profile', authMiddleware, getProfile);

export default router;
