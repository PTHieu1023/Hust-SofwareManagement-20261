import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

/**
 * TODO: Implement JWT authentication middleware
 * - Extract token from Authorization header
 * - Verify token using jwt.verify()
 * - Decode user data and attach to req.user
 * - Handle invalid/expired tokens
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // TODO: Verify token and decode user data
        const decoded = jwt.verify(token, config.JWT_SECRET) as {
            id: string;
            email: string;
            role: string;
        };

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * TODO: Implement role-based authorization middleware
 * - Check if user role is in allowed roles
 * - Return 403 if user doesn't have permission
 */
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};
