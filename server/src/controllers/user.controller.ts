import { AuthRequest } from '@/middleware/auth.middleware';
import { NextFunction, Response } from 'express';
import userService from '@/services/user.service';

/**
 * Get current user profile
 * GET /api/users/me
 */
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const user = await userService.getUserById(userId);

        return res.status(200).json({ message: 'User profile retrieved', data: user });
    } catch (error) {
        return next(error);
    }
};

/**
 * Update user profile
 * PUT /api/users/me
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const data = req.body;

        const updated = await userService.updateProfile(userId, data);

        return res.status(200).json({ message: 'Profile updated', data: updated });
    } catch (error) {
        return next(error);
    }
};
