import { Router } from 'express';
import { body,param } from 'express-validator';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { upload } from '@/middleware/storage.middleware';
import * as courseController from '@/controllers/course.controller';

const router: Router = Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Protected routes (require authentication)
router.use(authenticate);

// UC-L04: Get My Courses (Teacher Dashboard)
// Note: Đặt route này TRƯỚC các route có param /:id để tránh conflict
router.get(
    '/teacher/my-courses', 
    authorize('TEACHER', 'ADMIN'), 
    courseController.getMyCourses
);

// UC-L05: Create Course
router.post(
    '/',
    authorize('TEACHER', 'ADMIN'),
    upload.single('thumbnail'),
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('description').optional().isString(),
        body('category').optional().isString(),
        body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
        validate,
    ],
    courseController.createCourse
);

// UC-L06: Update Course
router.put(
    '/:id',
    authorize('TEACHER', 'ADMIN'),
    upload.single('thumbnail'),
    courseController.updateCourse
);

// UC-L09: Delete Course
router.delete('/:id', authorize('TEACHER', 'ADMIN'), courseController.deleteCourse);

// UC-L07: Publish/Unpublish
router.patch(
    '/:id/publish',
    authorize('TEACHER', 'ADMIN'),
    [
        param('id').notEmpty().withMessage('Course ID is required'),
        body('isPublished').isBoolean().withMessage('isPublished must be boolean'),
        validate // Middleware xử lý lỗi validation
    ],
    courseController.toggleCoursePublish
);

export default router;