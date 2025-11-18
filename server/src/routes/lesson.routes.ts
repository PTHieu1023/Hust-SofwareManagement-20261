import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { upload } from '@/middleware/upload';
import * as lessonController from '@/controllers/lesson.controller';

const router = Router();

// Get lessons for a course
router.get('/course/:courseId', lessonController.getLessonsByCourse);

// Get single lesson
router.get('/:id', lessonController.getLessonById);

// Protected routes (require authentication)
router.use(authenticate);

// Teacher-only routes
router.post(
    '/',
    authorize('TEACHER', 'ADMIN'),
    upload.single('content'),
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('description').optional().isString(),
        body('type').isIn(['VIDEO', 'PDF', 'TEXT']).withMessage('Invalid lesson type'),
        body('courseId').notEmpty().withMessage('Course ID is required'),
        body('order').isInt().withMessage('Order must be an integer'),
        validate,
    ],
    lessonController.createLesson
);

router.put(
    '/:id',
    authorize('TEACHER', 'ADMIN'),
    upload.single('content'),
    lessonController.updateLesson
);

router.delete('/:id', authorize('TEACHER', 'ADMIN'), lessonController.deleteLesson);

export default router;
