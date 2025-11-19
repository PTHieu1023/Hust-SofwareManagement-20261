import { NextFunction, Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
    
export const markLessonComplete = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement markLessonComplete controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const getCourseProgress = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getCourseProgress controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const getMyProgress = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getMyProgress controller
    return res.status(501).json({ message: 'Not implemented' });
};
