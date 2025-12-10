import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import adminService from '@services/admin.service';

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { role, search, page, limit } = req.query;

        const filters = {
            role: role ? (role as string).toUpperCase() : undefined,
            search: search as string,
            page: page ? parseInt(page as string, 10) : 1,
            limit: limit ? parseInt(limit as string, 10) : 10,
        };

        const result = await adminService.getAllUsers(filters);

        return res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        return next(error);
    }
};

export const banUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        const user = await adminService.banUser(id);

        return res.status(200).json({
            success: true,
            message: 'User banned successfully',
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

export const unbanUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        const user = await adminService.unbanUser(id);

        return res.status(200).json({
            success: true,
            message: 'User unbanned successfully',
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        await adminService.deleteUser(id);

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        return next(error);
    }
};

export const getAllCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { search, page, limit } = req.query;

        const filters = {
            search: search as string,
            page: page ? parseInt(page as string, 10) : 1,
            limit: limit ? parseInt(limit as string, 10) : 10,
        };

        const result = await adminService.getAllCourses(filters);

        return res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required',
            });
        }

        await adminService.deleteCourse(id);

        return res.status(200).json({
            success: true,
            message: 'Course deleted successfully',
        });
    } catch (error) {
        return next(error);
    }
};

export const getStatistics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const stats = await adminService.getStatistics();

        return res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        return next(error);
    }
};
