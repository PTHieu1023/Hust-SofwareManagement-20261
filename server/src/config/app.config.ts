import logger from '@/config/logger.config';
import getRouter from '@/config/router.config';
import swaggerSpec from '@/config/swagger.config';
import { errorHandler, notFound } from '@/middleware/errorhandler.middleware';
import { requestLogger } from '@/middleware/logger.middleware';
import env from '@/utils/env.utils';

import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const bootstrap = async () => {
    const app: express.Application = express();

    // Initialize and start server
    try {
        // Middleware
        app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
        app.use(requestLogger);
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Serve static files (uploads)
        app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

        // Health check
        app.get('/health', (_, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });

        // Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'E-Learning API Docs',
        }));
        logger.info('[Finished] Swagger UI available at /api-docs');

        // Auto-register all API routes from the routes folder
        const router = await getRouter('/api');
        app.use(router);
        logger.info('[Finished] All routes registered successfully');

        // Error handling
        app.use(notFound);
        app.use(errorHandler);

        const PORT = env.PORT;
        app.listen(PORT, () => {
            logger.info(`[APP] Server is running on port ${PORT}`);
            logger.info(`[APP] Environment: ${env.NODE_ENV}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

export default bootstrap;