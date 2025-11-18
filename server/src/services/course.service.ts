import { Course } from '@prisma/client';

export class CourseService {
    /**
     * TODO: Get all published courses with filters
     * - Apply category, level, search filters
     * - Include teacher info and counts
     * - Return only published courses for students
     * @param filters - Course filters (category, level, search)
     * @returns Promise<Course[]>
     */
    async getAllCourses(filters: {
        category?: string;
        level?: string;
        search?: string;
    }): Promise<Course[]> {
        // TODO: Implement get all courses with filters
        throw new Error('Not implemented');
    }

    /**
     * TODO: Get course by ID with details
     * - Include teacher, lessons, quizzes
     * - Include enrollment count
     * @param courseId - Course ID
     * @returns Promise<Course | null>
     */
    async getCourseById(courseId: string): Promise<Course | null> {
        // TODO: Implement get course by id
        throw new Error('Not implemented');
    }

    /**
     * TODO: Create new course
     * - Validate teacher permission
     * - Create course with provided data
     * - Handle thumbnail upload
     * @param teacherId - Teacher user ID
     * @param data - Course data
     * @returns Promise<Course>
     */
    async createCourse(
        teacherId: string,
        data: {
            title: string;
            description?: string;
            category?: string;
            level?: string;
            thumbnail?: string;
        }
    ): Promise<Course> {
        // TODO: Implement course creation
        throw new Error('Not implemented');
    }

    /**
     * TODO: Update course
     * - Verify teacher owns the course
     * - Update course data
     * @param courseId - Course ID
     * @param teacherId - Teacher user ID
     * @param data - Update data
     * @returns Promise<Course>
     */
    async updateCourse(
        courseId: string,
        teacherId: string,
        data: {
            title?: string;
            description?: string;
            category?: string;
            level?: string;
            thumbnail?: string;
        }
    ): Promise<Course> {
        // TODO: Implement course update
        throw new Error('Not implemented');
    }

    /**
     * TODO: Delete course
     * - Verify teacher owns the course
     * - Delete course and related data (cascading)
     * @param courseId - Course ID
     * @param teacherId - Teacher user ID
     * @returns Promise<void>
     */
    async deleteCourse(courseId: string, teacherId: string): Promise<void> {
        // TODO: Implement course deletion
        throw new Error('Not implemented');
    }

    /**
     * TODO: Toggle course publish status
     * - Verify teacher owns the course
     * - Toggle isPublished field
     * @param courseId - Course ID
     * @param teacherId - Teacher user ID
     * @returns Promise<Course>
     */
    async togglePublish(courseId: string, teacherId: string): Promise<Course> {
        // TODO: Implement publish toggle
        throw new Error('Not implemented');
    }
}

export default new CourseService();
