import { AuthRequest } from '@/middleware/auth.middleware';
import { NextFunction, Response } from 'express';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Call authService.register() with req.body
    return res.status(501).json({ message: 'Not implemented' });
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Call authService.login() with req.body
    return res.status(501).json({ message: 'Not implemented' });
};