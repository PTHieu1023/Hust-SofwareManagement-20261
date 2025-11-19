import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '@/middleware/validation.middleware';
import * as authController from '@/controllers/auth.controller';

const router: Router = Router();

// Register
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('fullName').optional().isString(),
        body('role').isIn(['STUDENT', 'TEACHER']).withMessage('Role must be STUDENT or TEACHER'),
        validate,
    ],
    authController.register
);

// Login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
        validate,
    ],
    authController.login
);

export default router;
