import logger from '@/config/logger.config';
import { Request, Response, NextFunction } from 'express';
import { isHttpError } from 'http-errors';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    if(isHttpError(err)) {
        return res.status(err.statusCode).json({
            error: err.name,
            path: req.path,
            message: err.message,
            time: new Date().toISOString(),
        });
    }

    return res.status(500).json({
        error: 'InternalServerError',
        message: 'An unexpected error occurred',
    });
};

export const notFound = (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        time: new Date().toISOString(),
    });
};
