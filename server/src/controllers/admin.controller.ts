import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';

export const getAllUsers = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getAllUsers controller
    return res.status(501).json({ message: 'Not implemented' });
};

export const banUser = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement banUser controller
    return res.status(501).json({ message: 'Not implemented' });
};

export const unbanUser = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement unbanUser controller
    return res.status(501).json({ message: 'Not implemented' });
};

export const deleteUser = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement deleteUser controller
    return res.status(501).json({ message: 'Not implemented' });
};

export const getAllCourses = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getAllCourses controller
    return res.status(501).json({ message: 'Not implemented' });
};

export const deleteCourse = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement deleteCourse controller
    return res.status(501).json({ message: 'Not implemented' });
};

export const getStatistics = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getStatistics controller
    return res.status(501).json({ message: 'Not implemented' });
};
