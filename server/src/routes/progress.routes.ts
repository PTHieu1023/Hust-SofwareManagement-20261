import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import * as progressController from '@/controllers/progress.controller';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Mark lesson as completed (Student)
router.post(
    '/lesson/:lessonId/complete',
    authorize('STUDENT'),
    progressController.markLessonComplete
);

// Get course progress (Student)
router.get('/course/:courseId', authorize('STUDENT'), progressController.getCourseProgress);

// Get all progress for student
router.get('/my-progress', authorize('STUDENT'), progressController.getMyProgress);

export default router;
