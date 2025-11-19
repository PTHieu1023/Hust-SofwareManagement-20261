import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const Env = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRES_IN: Number.parseInt(process.env.JWT_EXPIRES_IN || '300'),
    JWT_ISSUER: process.env.JWT_ISSUER || 'elearning-platform',
    JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'elearning-users',
    JWT_REFRESH_EXPIRES_IN: Number.parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '2592000'),
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_FILE_SIZE: Number.parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB default
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    SECURITY_PEPPER: process.env.SECURITY_PEPPER || 'HUST_20261-SOFTWARE_DEVELOPMENT_MANAGEMENT',
    SALT_ROUNDS: Number.parseInt(process.env.SALT_ROUNDS || '10'),
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '3a0bf8498c56e09a51a533c902b0d1e5839f59721f7e0c9e82bd4f7ee913821a', // 32 bytes hex
    ENCRYPTION_IV: process.env.ENCRYPTION_IV || 'b8f0f189c3e6b5d89e10d7c3', // 16 bytes hex
};

export default Env;