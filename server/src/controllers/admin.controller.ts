import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import adminService from '@services/admin.service';

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { role, search, page, limit } = req.query;

        const filters = {
            role: role as string,
            search: search as string,
            page: page ? parseInt(page as string, 10) : 1,
            limit: limit ? parseInt(limit as string, 10) : 10,
        };

        const result = await adminService.getAllUsers(filters);

        return res.status(200).json({
            success: true,
            data: result.users,
            pagination: result.pagination,
        });
    } catch (error) {
        return next(error);
    }
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
