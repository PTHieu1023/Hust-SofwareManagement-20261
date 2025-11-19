import { NextFunction, Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
    
export const getAllCourses = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getAllCourses controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const getCourseById = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getCourseById controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const createCourse = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement createCourse controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const updateCourse = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement updateCourse controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const deleteCourse = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement deleteCourse controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const publishCourse = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement publishCourse controller
    return res.status(501).json({ message: 'Not implemented' });
};
