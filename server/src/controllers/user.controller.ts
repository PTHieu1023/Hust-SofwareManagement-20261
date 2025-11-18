import { AuthRequest } from '@/middleware/auth';
import { Response } from 'express';

/**
 * Get current user profile
 * GET /api/users/me
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    // TODO: Call userService.getUserById() with req.user.id
};

/**
 * Update user profile
 * PUT /api/users/me
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
    // TODO: Implement updateProfile controller
};
