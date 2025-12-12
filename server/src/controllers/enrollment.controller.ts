import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import enrollmentService from '@/services/enrollment.service';

export const enrollInCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user!.id;
        const { courseId } = req.params;

        const enrollment = await enrollmentService.enrollInCourse(studentId, courseId);

        return res.status(201).json({ message: 'Enrolled successfully', data: enrollment });
    } catch (error) {
        return next(error);
    }
};

export const getMyEnrollments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user!.id;

        const enrollments = await enrollmentService.getStudentEnrollments(studentId);

        return res.status(200).json({ message: 'Enrollments retrieved', data: enrollments });
    } catch (error) {
        return next(error);
    }
};

export const getCourseEnrollments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const { courseId } = req.params;

        const enrollments = await enrollmentService.getCourseEnrollments(courseId, teacherId);

        return res.status(200).json({ message: 'Course enrollments retrieved', data: enrollments });
    } catch (error) {
        return next(error);
    }
};

export const unenrollFromCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user!.id;
        const { courseId } = req.params;

        await enrollmentService.unenrollFromCourse(studentId, courseId);

        return res.status(200).json({ message: 'Unenrolled successfully' });
    } catch (error) {
        return next(error);
    }
};
