import { AuthRequest } from '@/middleware/auth.middleware';
import { NextFunction, Response } from 'express';
    
export const getLessonsByCourse = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getLessonsByCourse controller
    return res.status(501).json({ message: 'Not implemented' });
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
