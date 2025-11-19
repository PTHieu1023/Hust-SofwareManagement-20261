import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
    
export const enrollInCourse = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement enrollInCourse controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const getMyEnrollments = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getMyEnrollments controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const getCourseEnrollments = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getCourseEnrollments controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const unenrollFromCourse = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement unenrollFromCourse controller
    return res.status(501).json({ message: 'Not implemented' });
};
