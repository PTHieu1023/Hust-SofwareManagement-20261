import { AuthRequest } from '@/middleware/auth.middleware';
import { NextFunction, Response } from 'express';
import authService from '@/services/auth.service';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Call authService.register() with req.body
    try {
        const result = await authService.register(req.body);

        return res.status(201).json({
            message: 'Registration succeeded',
            data: result
        });
    } catch (error: any) {
        return res.status(400).json({
            message: error.message || 'Registration failed'
        });
        
        // next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Call authService.login() with req.body
    return res.status(501).json({ message: 'Not implemented' });
};