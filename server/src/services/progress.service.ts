import { Progress } from '@prisma/client';
import prisma from '@/config/prisma.config';
/**
 * - Verify student is enrolled
 * - Create/update progress record
 * - Update enrollment overall progress percentage
 * @param studentId - Student user ID
 * @param lessonId - Lesson ID
 * @returns Promise<Progress>
 */
const markLessonComplete = async (studentId: string, lessonId: string): Promise<Progress> => {
    // Get lesson to find course
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { course: true }
    });

    if (!lesson) {
        throw new Error('Lesson not found');
    }

    // Verify student is enrolled
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            studentId,
            courseId: lesson.courseId
        }
    });

    if (!enrollment) {
        throw new Error('Student is not enrolled in this course');
    }

    // Create or update progress record
    const progress = await prisma.progress.upsert({
        where: {
            studentId_lessonId: {
                studentId,
                lessonId
            }
        },
        update: {
            completedAt: new Date()
        },
        create: {
            studentId,
            lessonId,
            courseId: lesson.courseId, // Add this
            completedAt: new Date()
        }
    });

    // Update enrollment overall progress percentage
    await updateEnrollmentProgress(studentId, lesson.courseId);

    return progress;
}

/**
 * - Get all lesson progress for a course
 * - Calculate overall progress percentage
 * @param studentId - Student user ID
 * @param courseId - Course ID
 * @returns Promise<{ progress: Progress[], overallProgress: number }>
 */
const getCourseProgress = async (
    studentId: string,
    courseId: string
): Promise<{ progress: Progress[]; overallProgress: number }> => {
    // Get all lessons in the course
    const lessons = await prisma.lesson.findMany({
        where: { courseId }
    });

    if (lessons.length === 0) {
        return { progress: [], overallProgress: 0 };
    }

    // Get all progress records for the student in this course
    const progress = await prisma.progress.findMany({
        where: {
            studentId,
            lesson: { courseId }
        },
        include: { lesson: true }
    });

    // Calculate overall progress percentage
    const overallProgress = (progress.length / lessons.length) * 100;

    return { progress, overallProgress: Math.round(overallProgress) };
}

/**
 * - Get progress across all enrolled courses
 * - Include course details and statistics
 * @param studentId - Student user ID
 * @returns Promise<any[]>
 */
const getStudentProgress = async (studentId: string): Promise<any[]> => {
    // Get all enrollments for the student
    const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        include: { 
            course: true
        }
    });

    // Get progress for each course
    const progressData = await Promise.all(
        enrollments.map(async (enrollment) => {
            const { progress, overallProgress } = await getCourseProgress(
                studentId,
                enrollment.courseId
            );

            return {
                course: enrollment.course,
                progress,
                overallProgress,
                enrolledAt: enrollment.enrolledAt,
                completedAt: enrollment.completedAt
            };
        })
    );

    return progressData;
}

/**
 * - Calculate completed lessons vs total lessons
 * - Update enrollment progress field
 * - Mark as completed if 100%
 * @param studentId - Student user ID
 * @param courseId - Course ID
 * @returns Promise<void>
 */
const updateEnrollmentProgress = async (studentId: string, courseId: string): Promise<void> => {
    // Get total lessons in course
    const totalLessons = await prisma.lesson.count({
        where: { courseId }
    });

    if (totalLessons === 0) {
        return;
    }

    // Get completed lessons
    const completedLessons = await prisma.progress.count({
        where: {
            studentId,
            lesson: { courseId }
        }
    });

    // Calculate progress percentage
    const progressPercentage = (completedLessons / totalLessons) * 100;

    // Update enrollment
    await prisma.enrollment.update({
        where: {
            studentId_courseId: {
                studentId,
                courseId
            }
        },
        data: {
            progress: Math.round(progressPercentage),
            completedAt: progressPercentage === 100 ? new Date() : null
        }
    });
}

export default {
    markLessonComplete,
    getCourseProgress,
    getStudentProgress,
    updateEnrollmentProgress,
};