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
export const login = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Call authService.login() with req.body
    try {
        const { email, password } = req.body;

        const result = await authService.login(email, password);

        return res.status(200).json({
            message: 'Login succeeded',
            data: result
        });
    } catch (error: any) {
        if (error.message === 'Email or password is incorrect.') {
            return res.status(401).json({
                message: error.message
            });
        }

        if (error.message.includes('banned') || error.message.includes('activated')) {
            return res.status(403).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: error.message || 'Login failed'
        });
    }
};