import logger from "@/config/logger.config";
import { Request, Response, NextFunction } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    logger.info(`[INCOMING] ${req.method} ${req.originalUrl}`);
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`[OUTGOING] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    return next();
}