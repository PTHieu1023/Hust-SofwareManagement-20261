import { Enrollment } from '@prisma/client';

export class EnrollmentService {
    /**
     * TODO: Enroll student in course
     * - Check if course is published
     * - Check if already enrolled
     * - Create enrollment record
     * @param studentId - Student user ID
     * @param courseId - Course ID
     * @returns Promise<Enrollment>
     */
    async enrollInCourse(_studentId: string, _courseId: string): Promise<Enrollment> {
        // TODO: Implement enrollment
        throw new Error('Not implemented');
    }

    /**
     * TODO: Get student enrollments
     * - Get all courses student is enrolled in
     * - Include course details and progress
     * @param studentId - Student user ID
     * @returns Promise<Enrollment[]>
     */
    async getStudentEnrollments(_studentId: string): Promise<Enrollment[]> {
        // TODO: Implement get student enrollments
        throw new Error('Not implemented');
    }

    /**
     * TODO: Get course enrollments
     * - Verify teacher owns the course
     * - Get all students enrolled in course
     * @param courseId - Course ID
     * @param teacherId - Teacher user ID
     * @returns Promise<Enrollment[]>
     */
    async getCourseEnrollments(_courseId: string, _teacherId: string): Promise<Enrollment[]> {
        // TODO: Implement get course enrollments
        throw new Error('Not implemented');
    }

    /**
     * TODO: Unenroll from course
     * - Remove enrollment
     * - Optionally remove progress data
     * @param studentId - Student user ID
     * @param courseId - Course ID
     * @returns Promise<void>
     */
    async unenrollFromCourse(_studentId: string, _courseId: string): Promise<void> {
        // TODO: Implement unenrollment
        throw new Error('Not implemented');
    }
}

export default new EnrollmentService();
