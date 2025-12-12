import { AuthRequest } from '@/middleware/auth.middleware';
import { NextFunction, Response } from 'express';
import quizService from '@/services/quiz.service';

export const getQuizzesByCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.params;

        const quizzes = await quizService.getQuizzesByCourse(courseId);

        return res.status(200).json({ message: 'Quizzes retrieved', data: quizzes });
    } catch (error) {
        return next(error);
    }
};

export const getQuizById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const role = req.user?.role ?? 'STUDENT';

        const quiz = await quizService.getQuizById(id, role);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        return res.status(200).json({ message: 'Quiz retrieved', data: quiz });
    } catch (error) {
        return next(error);
    }
};

export const createQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const { title, description, courseId, passingScore, timeLimit, order } = req.body;

        const quiz = await quizService.createQuiz(teacherId, {
            title,
            description,
            courseId,
            passingScore: Number(passingScore),
            timeLimit: timeLimit ? Number(timeLimit) : undefined,
            order: Number(order)
        });

        return res.status(201).json({ message: 'Quiz created', data: quiz });
    } catch (error) {
        return next(error);
    }
};

export const updateQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const { id } = req.params;

        const updated = await quizService.updateQuiz(id, teacherId, req.body as any);

        return res.status(200).json({ message: 'Quiz updated', data: updated });
    } catch (error) {
        return next(error);
    }
};

export const deleteQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const { id } = req.params;

        await quizService.deleteQuiz(id, teacherId);

        return res.status(200).json({ message: 'Quiz deleted' });
    } catch (error) {
        return next(error);
    }
};

export const addQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const { quizId } = req.params;
        const { question, type, points, order, answers } = req.body;

        const added = await quizService.addQuestion(quizId, teacherId, {
            question,
            type,
            points: Number(points),
            order: Number(order),
            answers
        });

        return res.status(201).json({ message: 'Question added', data: added });
    } catch (error) {
        return next(error);
    }
};

export const submitQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user!.id;
        const { id } = req.params;
        const { answers, timeSpent } = req.body;

        const attempt = await quizService.submitQuiz(id, studentId, { answers, timeSpent });

        return res.status(201).json({ message: 'Quiz submitted', data: attempt });
    } catch (error) {
        return next(error);
    }
};

export const getQuizAttempts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user!.id;
        const { id } = req.params;

        const attempts = await quizService.getQuizAttempts(id, studentId);

        return res.status(200).json({ message: 'Attempts retrieved', data: attempts });
    } catch (error) {
        return next(error);
    }
};
