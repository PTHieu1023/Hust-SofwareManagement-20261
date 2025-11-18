import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { upload } from '@/middleware/upload';
import * as courseController from '@/controllers/course.controller';

const router = Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Protected routes (require authentication)
router.use(authenticate);

// Teacher-only routes
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

router.put(
    '/:id',
    authorize('TEACHER', 'ADMIN'),
    upload.single('thumbnail'),
    courseController.updateCourse
);

router.delete('/:id', authorize('TEACHER', 'ADMIN'), courseController.deleteCourse);

router.patch('/:id/publish', authorize('TEACHER', 'ADMIN'), courseController.publishCourse);

export default router;
