import { NextFunction, Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import progressService from '@/services/progress.service';

export const markLessonComplete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { lessonId } = req.params;
        const studentId = req.user!.id;

        const progress = await progressService.markLessonComplete(studentId, lessonId);

        return res.status(200).json({
            message: 'Lesson marked as completed',
            data: progress
        });
    } catch (error) {
        next(error);
    }
};

export const getCourseProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user!.id;

        const progressData = await progressService.getCourseProgress(studentId, courseId);

        return res.status(200).json({
            message: 'Course progress retrieved',
            data: progressData
        });
    } catch (error) {
        next(error);
    }
};

export const getMyProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user!.id;

        const progressData = await progressService.getStudentProgress(studentId);

        return res.status(200).json({
            message: 'Student progress retrieved',
            data: progressData
        });
    } catch (error) {
        next(error);
    }
};
