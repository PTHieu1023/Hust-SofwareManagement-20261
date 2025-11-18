import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import * as adminController from '@/controllers/admin.controller';

const router = Router();

// All routes require admin authentication
router.use(authenticate, authorize('ADMIN'));

// User management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/ban', adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);
router.delete('/users/:id', adminController.deleteUser);

// Course management
router.get('/courses', adminController.getAllCourses);
router.delete('/courses/:id', adminController.deleteCourse);

// Statistics
router.get('/stats', adminController.getStatistics);

export default router;
