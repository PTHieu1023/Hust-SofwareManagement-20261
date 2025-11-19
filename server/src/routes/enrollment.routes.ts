import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import * as enrollmentController from '@/controllers/enrollment.controller';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Enroll in a course (Student)
router.post('/:courseId', authorize('STUDENT'), enrollmentController.enrollInCourse);

// Get student enrollments
router.get('/my-enrollments', authorize('STUDENT'), enrollmentController.getMyEnrollments);

// Get course enrollments (Teacher/Admin)
router.get(
    '/course/:courseId',
    authorize('TEACHER', 'ADMIN'),
    enrollmentController.getCourseEnrollments
);

// Unenroll from course
router.delete('/:courseId', authorize('STUDENT'), enrollmentController.unenrollFromCourse);

export default router;
