import express from 'express';
import cors from 'cors';
import { config } from '@/config';
import { errorHandler, notFound } from '@/middleware/errorHandler';
import logger from '@/config/logger';

// Import routes
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import courseRoutes from '@/routes/course.routes';
import lessonRoutes from '@/routes/lesson.routes';
import quizRoutes from '@/routes/quiz.routes';
import enrollmentRoutes from '@/routes/enrollment.routes';
import progressRoutes from '@/routes/progress.routes';
import adminRoutes from '@/routes/admin.routes';

const app = express();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Health check
app.get('/health', (_, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = config.PORT;

app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`📚 Environment: ${config.NODE_ENV}`);
});

export default app;
