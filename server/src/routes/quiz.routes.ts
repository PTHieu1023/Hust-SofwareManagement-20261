import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '@/middleware/auth.middleware';
import { authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import * as quizController from '@/controllers/quiz.controller';

const router: Router = Router();

// Get quizzes for a course
router.get('/course/:courseId', authenticate, quizController.getQuizzesByCourse);

// Get quiz details
router.get('/:id', authenticate, quizController.getQuizById);

// Protected routes
router.use(authenticate);

// Teacher-only routes
router.post(
    '/',
    authorize('TEACHER', 'ADMIN'),
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('description').optional().isString(),
        body('courseId').notEmpty().withMessage('Course ID is required'),
        body('passingScore').isInt({ min: 0, max: 100 }),
        body('timeLimit').optional().isInt(),
        body('order').isInt(),
        validate,
    ],
    quizController.createQuiz
);

router.put('/:id', authorize('TEACHER', 'ADMIN'), quizController.updateQuiz);

router.delete('/:id', authorize('TEACHER', 'ADMIN'), quizController.deleteQuiz);

// Question management
router.post(
    '/:quizId/questions',
    authorize('TEACHER', 'ADMIN'),
    [
        body('question').notEmpty().withMessage('Question text is required'),
        body('type').isIn(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']),
        body('points').isInt({ min: 1 }),
        body('order').isInt(),
        body('answers').isArray().withMessage('Answers must be an array'),
        validate,
    ],
    quizController.addQuestion
);

// Submit quiz attempt (Student)
router.post(
    '/:id/submit',
    authorize('STUDENT'),
    [body('answers').isObject().withMessage('Answers must be provided'), validate],
    quizController.submitQuiz
);

// Get student attempts
router.get('/:id/attempts', quizController.getQuizAttempts);

export default router;
