import { AuthRequest } from '@/middleware/auth.middleware';
import { NextFunction, Response } from 'express';
    
export const getQuizzesByCourse = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getQuizzesByCourse controller
    return res.status(501).json({ message: 'Not implemented' });
};
        
export const getQuizById = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getQuizById controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const createQuiz = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement createQuiz controller
    return res.status(501).json({ message: 'Not implemented' });
};
            
export const updateQuiz = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement updateQuiz controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const deleteQuiz = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement deleteQuiz controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const addQuestion = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement addQuestion controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const submitQuiz = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement submitQuiz controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const getQuizAttempts = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement getQuizAttempts controller
    return res.status(501).json({ message: 'Not implemented' });
};
