import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { upload } from '@/middleware/storage.middleware';
import * as lessonController from '@/controllers/lesson.controller';

const router: Router = Router();

// Get lessons for a course
router.get(
    '/course/:courseId', 
    [
    param('courseId').isString().notEmpty().withMessage('courseId is required'),
    validate,
    ],
    lessonController.getLessonsForStudentByCourse
);

/**
 * Protected routes (require authentication)
 * From here on, user must be logged in.
 */
router.use(authenticate);

// Get lesson detail (view content)
// Used by students to watch a lesson (video/PDF/text)
router.get(
    '/:id',
    authorize('STUDENT'),
    [
        param('id')
        .isString()
        .notEmpty()
        .withMessage('lesson id is required'),
        validate,
    ],
    lessonController.getLessonDetailForStudent
);

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
        body('isPublished').notEmpty().withMessage('isPublished is required'),
        validate,
    ],
    lessonController.createLesson
);

router.put(
    '/:id',
    authorize('TEACHER', 'ADMIN'),
    upload.single('content'),
    [
        param('id').notEmpty(),
        body('type').optional().isIn(['VIDEO', 'PDF']),
        body('isPublished').optional().isBoolean().withMessage('isPublished must be boolean'),
        validate
    ],
    lessonController.updateLesson
);

router.delete('/:id', authorize('TEACHER', 'ADMIN'), lessonController.deleteLesson);

export default router;
