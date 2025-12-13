import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
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

// Teacher/Admin: Get lesson detail (published + unpublished)
// GET /api/lesson/teacher/lesson/:id
router.get(
  "/teacher/lesson/:id",
  authorize("TEACHER", "ADMIN"),
  [
    param("id").isString().notEmpty().withMessage("lesson id is required"),
    validate,
  ],
  lessonController.getLessonDetailForTeacher
);

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
    [
        body('courseId').notEmpty().withMessage('Course ID is required'),
        body('title').notEmpty().withMessage('Title is required'),
        body('type').isIn(['VIDEO', 'PDF', 'TEXT']).withMessage('Invalid lesson type'),
        body('contentUrl').notEmpty().withMessage('Content URL is required'), // Bắt buộc URL từ API upload
        body('duration').optional().isInt({ min: 0 }),
        body('description').optional().isString(),
        // Order tự tính toán ở Service, không bắt buộc gửi từ FE trừ khi muốn chèn giữa
        body('order').optional().isInt(), 
        body('isPublished').optional().isBoolean().withMessage('isPublished must be boolean'),
        validate,
    ],
    lessonController.createLesson
);

// 2. Update Lesson Content (Edit)
router.put(
    '/:id',
    authorize('TEACHER', 'ADMIN'),
    [
        param('id').notEmpty(),
        body('title').optional().notEmpty(),
        body('type').optional().isIn(['VIDEO', 'PDF', 'TEXT']),
        body('contentUrl').optional().isURL(), 
        body('duration').optional().isInt({ min: 0 }),
        body('isPublished').optional().isBoolean().withMessage('isPublished must be boolean'),
        validate
    ],
    lessonController.updateLessonContent
);

// 3. Publish/Unpublish Lesson
router.patch(
    '/:id/publish',
    authorize('TEACHER', 'ADMIN'),
    [
        param('id').notEmpty(),
        body('isPublished').isBoolean().withMessage('isPublished must be boolean'),
        validate
    ],
    lessonController.toggleLessonPublish
);

router.delete('/:id', authorize('TEACHER', 'ADMIN'), lessonController.deleteLesson);

export default router;
