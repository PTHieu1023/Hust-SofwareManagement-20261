import { Enrollment } from '@prisma/client';
import prisma from '@/config/prisma.config';


/**
 * - Check if course is published
 * - Check if already enrolled
 * - Create enrollment record
 * @param studentId - Student user ID
 * @param courseId - Course ID
 * @returns Promise<Enrollment>
 */
const enrollInCourse = async (studentId: string, courseId: string): Promise<Enrollment> => {
    // Check course exists and is published
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || !course.isPublished) {
        throw new Error('Course not available for enrollment');
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } }
    });
    if (existing) {
        throw new Error('Student already enrolled in this course');
    }

    // Create enrollment record
    const enrollment = await prisma.enrollment.create({
        data: {
            studentId,
            courseId,
            enrolledAt: new Date(),
            progress: 0
        }
    });

    return enrollment;
}

/**
 * - Get all courses student is enrolled in
 * - Include course details and progress
 * @param studentId - Student user ID
 * @returns Promise<Enrollment[]>
 */
const getStudentEnrollments = async (studentId: string): Promise<Enrollment[]> => {
    const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        include: { course: true }
    });

    return enrollments;
}

/**
 * - Verify teacher owns the course
 * - Get all students enrolled in course
 * @param courseId - Course ID
 * @param teacherId - Teacher user ID
 * @returns Promise<Enrollment[]>
 */
const getCourseEnrollments = async (courseId: string, teacherId: string): Promise<Enrollment[]> => {
    // Verify teacher owns the course
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
        throw new Error('Course not found');
    }
    if (course.teacherId !== teacherId) {
        throw new Error('Unauthorized');
    }

    const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: { student: true }
    });

    return enrollments;
}

/**
 * - Remove enrollment
 * - Optionally remove progress data
 * @param studentId - Student user ID
 * @param courseId - Course ID
 * @returns Promise<void>
 */
const unenrollFromCourse = async (studentId: string, courseId: string): Promise<void> => {
    // Remove progress entries for this course and student
    await prisma.progress.deleteMany({
        where: {
            studentId,
            lesson: { courseId }
        }
    });

    // Remove enrollment record
    await prisma.enrollment.delete({
        where: { studentId_courseId: { studentId, courseId } }
    });
}

export default {
    enrollInCourse,
    getStudentEnrollments,
    getCourseEnrollments,
    unenrollFromCourse,
};;