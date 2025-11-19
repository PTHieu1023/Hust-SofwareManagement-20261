import app from '@/config/app.config';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
        extractToken(req);
        return next();
    } catch (error) {
        return next(error);
    }
};


export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, _: Response, next: NextFunction) => {
        try {
            if (!roles || roles.length === 0)
                return next();
            extractToken(req);
            const role = req.user?.role;
            if (role && !roles.includes(role)) 
                throw createHttpError(403, 'Insufficient permissions');
        } catch (error) {
            return next(error);
        }
    };
};

const extractToken = (req: AuthRequest) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        throw createHttpError(401, 'Authentication required');
    }

    const decoded = jwt.verify(token, app.ENV.JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
    };

    req.user = decoded;
}