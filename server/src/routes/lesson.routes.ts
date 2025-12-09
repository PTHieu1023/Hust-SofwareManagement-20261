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
        param('id').isString().notEmpty().withMessage('lesson id is required'),
        validate,
    ],
    lessonController.getLessonDetailForStudent
);

// Teacher-only routes

/**
 * Manage lessons for a course
 * -> GET /api/lesson/teacher/course/:courseId
 * - only TEACHER role
 * - server-side checks:
 *    + check course exists
 *    + check course.teacherId === currentUser.id
 *    + return all lessons (published/unpublished)
 */
router.get(
  '/teacher/course/:courseId',
  authorize('TEACHER'),
  [
    param('courseId').isString().notEmpty().withMessage('courseId is required'),
    validate,
  ],
  lessonController.getLessonsForTeacherByCourse
);

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
