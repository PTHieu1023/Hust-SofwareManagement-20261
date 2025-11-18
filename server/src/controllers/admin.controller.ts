import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    // TODO: Implement getAllUsers controller
};

export const banUser = async (req: AuthRequest, res: Response) => {
    // TODO: Implement banUser controller
};

export const unbanUser = async (req: AuthRequest, res: Response) => {
    // TODO: Implement unbanUser controller
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    // TODO: Implement deleteUser controller
};

export const getAllCourses = async (req: AuthRequest, res: Response) => {
    // TODO: Implement getAllCourses controller
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
    // TODO: Implement deleteCourse controller
};

export const getStatistics = async (req: AuthRequest, res: Response) => {
    // TODO: Implement getStatistics controller
};
