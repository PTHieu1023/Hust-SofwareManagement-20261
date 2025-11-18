import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import * as userController from '@/controllers/user.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Update user profile
router.put('/me', userController.updateProfile);

export default router;
