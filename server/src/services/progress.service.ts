import { Progress } from '@prisma/client';

export class ProgressService {
    /**
     * TODO: Mark lesson as complete
     * - Verify student is enrolled
     * - Create/update progress record
     * - Update enrollment overall progress percentage
     * @param studentId - Student user ID
     * @param lessonId - Lesson ID
     * @returns Promise<Progress>
     */
    async markLessonComplete(studentId: string, lessonId: string): Promise<Progress> {
        // TODO: Implement mark lesson complete
        throw new Error('Not implemented');
    }

    /**
     * TODO: Get course progress for student
     * - Get all lesson progress for a course
     * - Calculate overall progress percentage
     * @param studentId - Student user ID
     * @param courseId - Course ID
     * @returns Promise<{ progress: Progress[], overallProgress: number }>
     */
    async getCourseProgress(
        studentId: string,
        courseId: string
    ): Promise<{ progress: Progress[]; overallProgress: number }> {
        // TODO: Implement get course progress
        throw new Error('Not implemented');
    }

    /**
     * TODO: Get all progress for student
     * - Get progress across all enrolled courses
     * - Include course details and statistics
     * @param studentId - Student user ID
     * @returns Promise<any[]>
     */
    async getStudentProgress(studentId: string): Promise<any[]> {
        // TODO: Implement get student progress
        throw new Error('Not implemented');
    }

    /**
     * TODO: Update enrollment progress percentage
     * - Calculate completed lessons vs total lessons
     * - Update enrollment progress field
     * - Mark as completed if 100%
     * @param studentId - Student user ID
     * @param courseId - Course ID
     * @returns Promise<void>
     */
    async updateEnrollmentProgress(studentId: string, courseId: string): Promise<void> {
        // TODO: Implement update enrollment progress
        throw new Error('Not implemented');
    }
}

export default new ProgressService();
