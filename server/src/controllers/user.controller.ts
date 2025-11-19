import { AuthRequest } from '@/middleware/auth.middleware';
import { NextFunction, Response } from 'express';

/**
 * Get current user profile
 * GET /api/users/me
 */
export const getCurrentUser = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Call userService.getUserById() with req.user.id
    return res.status(501).json({ message: 'Not implemented' });    
};

/**
 * Update user profile
 * PUT /api/users/me
 */
export const updateProfile = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement updateProfile controller
    return res.status(501).json({ message: 'Not implemented' });
};
