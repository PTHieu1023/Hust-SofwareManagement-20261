import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';

export const markLessonComplete = async (req: AuthRequest, res: Response) => {
    // TODO: Implement markLessonComplete controller
};

export const getCourseProgress = async (req: AuthRequest, res: Response) => {
    // TODO: Implement getCourseProgress controller
};

export const getMyProgress = async (req: AuthRequest, res: Response) => {
    // TODO: Implement getMyProgress controller
};

// Helper function to update enrollment progress
async function updateEnrollmentProgress(studentId: string, courseId: string) {
    // TODO: Implement updateEnrollmentProgress helper function
}
