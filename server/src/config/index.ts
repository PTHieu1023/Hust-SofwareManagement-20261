import dotenv from 'dotenv';

dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_FILE_SIZE: Number.parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB default
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
