import { Lesson } from '@prisma/client';


/** ID
 * - Filter by published status
 * - Order by lesson order
 * @param courseId - Course ID
 * @returns Promise<Lesson[]>
 */
const getLessonsByCourse = async (_courseId: string): Promise<Lesson[]> => {
    // TODO: Implement get lessons by course
    throw new Error('Not implemented');
}

/**
 * - Include course information
 * @param lessonId - Lesson ID
 * @returns Promise<Lesson | null>
 */
const getLessonById = async (_lessonId: string): Promise<Lesson | null> => {
    // TODO: Implement get lesson by id
    throw new Error('Not implemented');
}

/**
 * - Verify teacher owns the course
 * - Handle file upload (video/PDF)
 * - Create lesson with ordering
 * @param teacherId - Teacher user ID
 * @param data - Lesson data
 * @returns Promise<Lesson>
 */
const createLesson = async (
    _teacherId: string,
    _data: {
        title: string;
        description?: string;
        type: string;
        courseId: string;
        order: number;
        content?: string;
        contentUrl?: string;
        duration?: number;
    }
): Promise<Lesson> => {
    // TODO: Implement lesson creation
    throw new Error('Not implemented');
}

/**
 * - Verify teacher owns the course
 * - Update lesson data
 * @param lessonId - Lesson ID
 * @param teacherId - Teacher user ID
 * @param data - Update data
 * @returns Promise<Lesson>
 */
const updateLesson = async (
    _lessonId: string,
    _teacherId: string,
    _data: Partial<Lesson>
): Promise<Lesson> => {
    // TODO: Implement lesson update
    throw new Error('Not implemented');
}

/**
 * - Verify teacher owns the course
 * - Delete lesson
 * @param lessonId - Lesson ID
 * @param teacherId - Teacher user ID
 * @returns Promise<void>
 */
const deleteLesson = async (_lessonId: string, _teacherId: string): Promise<void> => {
    // TODO: Implement lesson deletion
    throw new Error('Not implemented');
}

export default {
    getLessonsByCourse,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
};
