import { AuthRequest } from '@/middleware/auth';
import { Response } from 'express';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: AuthRequest, res: Response) => {
    // TODO: Call authService.register() with req.body
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: AuthRequest, res: Response) => {
    // TODO: Call authService.login() with req.body
};