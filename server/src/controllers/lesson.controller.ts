import { AuthRequest } from '@/middleware/auth.middleware';
import { NextFunction, Response } from 'express';
import lessonService from '@/services/lesson.service';

export const getLessonsForStudentByCourse = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
    const { courseId } = req.params;

    // Gọi service lấy danh sách lesson đã publish
    const lessons = await lessonService.getLessonsByCourse(courseId);

    return res.status(200).json(lessons);
  } catch (error) {
    console.error('getLessonsForStudentByCourse error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
    
export const getLessonById = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getLessonById controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const createLesson = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement createLesson controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const updateLesson = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement updateLesson controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const deleteLesson = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement deleteLesson controller
    return res.status(501).json({ message: 'Not implemented' });
};
