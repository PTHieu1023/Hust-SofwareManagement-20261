import { Lesson } from '@prisma/client';

export class LessonService {
    /**
     * TODO: Get lessons by course ID
     * - Filter by published status
     * - Order by lesson order
     * @param courseId - Course ID
     * @returns Promise<Lesson[]>
     */
    async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
        // TODO: Implement get lessons by course
        throw new Error('Not implemented');
    }

    /**
     * TODO: Get lesson by ID
     * - Include course information
     * @param lessonId - Lesson ID
     * @returns Promise<Lesson | null>
     */
    async getLessonById(lessonId: string): Promise<Lesson | null> {
        // TODO: Implement get lesson by id
        throw new Error('Not implemented');
    }

    /**
     * TODO: Create new lesson
     * - Verify teacher owns the course
     * - Handle file upload (video/PDF)
     * - Create lesson with ordering
     * @param teacherId - Teacher user ID
     * @param data - Lesson data
     * @returns Promise<Lesson>
     */
    async createLesson(
        teacherId: string,
        data: {
            title: string;
            description?: string;
            type: string;
            courseId: string;
            order: number;
            content?: string;
            contentUrl?: string;
            duration?: number;
        }
    ): Promise<Lesson> {
        // TODO: Implement lesson creation
        throw new Error('Not implemented');
    }

    /**
     * TODO: Update lesson
     * - Verify teacher owns the course
     * - Update lesson data
     * @param lessonId - Lesson ID
     * @param teacherId - Teacher user ID
     * @param data - Update data
     * @returns Promise<Lesson>
     */
    async updateLesson(
        lessonId: string,
        teacherId: string,
        data: Partial<Lesson>
    ): Promise<Lesson> {
        // TODO: Implement lesson update
        throw new Error('Not implemented');
    }

    /**
     * TODO: Delete lesson
     * - Verify teacher owns the course
     * - Delete lesson
     * @param lessonId - Lesson ID
     * @param teacherId - Teacher user ID
     * @returns Promise<void>
     */
    async deleteLesson(lessonId: string, teacherId: string): Promise<void> {
        // TODO: Implement lesson deletion
        throw new Error('Not implemented');
    }
}

export default new LessonService();
