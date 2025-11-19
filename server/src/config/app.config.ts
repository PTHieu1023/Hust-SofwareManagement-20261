import logger from '@/config/logger.config';
import getRouter from '@/config/router.config';
import { errorHandler, notFound } from '@/middleware/errorhandler.middleware';
import { requestLogger } from '@/middleware/logger.middleware';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

const ENV = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_FILE_SIZE: Number.parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB default
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};


const bootstrap = async () => {
    const app: express.Application = express();

    // Initialize and start server
    try {
        // Load environment variables
        dotenv.config();

        // Middleware
        app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
        app.use(requestLogger);
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Serve static files (uploads)
        app.use('/uploads', express.static(ENV.UPLOAD_DIR));

        // Health check
        app.get('/health', (_, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });

        // Auto-register all API routes from the routes folder
        const router = await getRouter('/api');
        app.use(router);
        logger.info('[Finished] All routes registered successfully');

        // Error handling
        app.use(notFound);
        app.use(errorHandler);

        const PORT = ENV.PORT;
        app.listen(PORT, () => {
            logger.info(`[APP] Server is running on port ${PORT}`);
            logger.info(`[APP] Environment: ${ENV.NODE_ENV}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

export default {
    bootstrap,
    ENV
};