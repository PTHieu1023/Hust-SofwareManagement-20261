import logger from '@/config/logger.config';
import { Request, Response } from 'express';
import { isHttpError } from 'http-errors';

export const errorHandler = (err: Error, req: Request, res: Response) => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Note: Do not expose detailed error messages to clients to prevent
    // leaking sensitive information.
    // Only expose them if you can ensure that the error is from the client side.
    // This will be discussed in the group in the future.
    if(isHttpError(err)) {
        const statusCode = err.statusCode;
        // Client errors (4xx) - Safe to expose detailed messages
        if (statusCode >= 400 && statusCode < 500) {
            return res.status(statusCode).json({
                error: err.name,
                path: req.path,
                message: err.message,
                time: new Date().toISOString(),
            });
        }
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
