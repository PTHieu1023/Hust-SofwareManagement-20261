import { Progress } from '@prisma/client';
import prisma from '../config/prisma.config';

/**
 * - Verify student is enrolled
 * - Create/update progress record
 * - Update enrollment overall progress percentage
 * @param studentId - Student user ID
 * @param lessonId - Lesson ID
 * @returns Promise<Progress>
 */
const markLessonComplete = async (studentId: string, lessonId: string): Promise<Progress> => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { courseId: true }
    });

    if (!lesson) {
        throw new Error('Lesson not found.');
    }

    const courseId = lesson.courseId;

    // 2. Tạo hoặc cập nhật record Progress
    const progressRecord = await prisma.progress.upsert({
        where: {
            studentId_lessonId: {
                studentId,
                lessonId,
            }
        },
        update: { completedAt: new Date() }, // Đảm bảo luôn được đánh dấu là hoàn thành
        create: {
            studentId,
            lessonId,
            completedAt: new Date(),
        }
    });

    // 3. Cập nhật tiến độ tổng thể của Enrollment (luôn gọi sau khi hoàn thành Lesson)
    await updateEnrollmentProgress(studentId, courseId);

    return progressRecord;
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
): Promise<{ progress: Progress[]; overallProgress: number; totalLessons: number }> => {
    const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } },
        select: { progress: true }
    });

    if (!enrollment) {
        throw new Error('Student not enrolled in this course.');
    }

    // 2. Lấy tất cả các bài học đã hoàn thành
    const completedProgresses = await prisma.progress.findMany({
        where: {
            studentId,
            lesson: { courseId }
        }
    });
    
    // 3. Lấy tổng số bài học (để client có thể tính lại hoặc hiển thị)
    const totalLessonsCount = await prisma.lesson.count({
        where: { courseId }
    });

    return {
        progress: completedProgresses,
        overallProgress: enrollment.progress, // Sử dụng giá trị đã tính toán và lưu trong Enrollment
        totalLessons: totalLessonsCount
    };
}

/**
 * - Get progress across all enrolled courses
 * - Include course details and statistics
 * @param studentId - Student user ID
 * @returns Promise<any[]>
 */
const getStudentProgress = async (studentId: string): Promise<any[]> => {
    const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    thumbnail: true,
                }
            }
        }
    });

    // Định dạng dữ liệu trả về
    const studentProgressData = enrollments.map((e: typeof enrollments[number]) => ({
        courseId: e.courseId,
        courseTitle: e.course.title,
        courseThumbnail: e.course.thumbnail,
        overallProgress: e.progress,
        isCompleted: e.completed,
    }));
    
    return studentProgressData;
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
    const totalLessons = await prisma.lesson.count({
        where: { courseId },
    });

    if (totalLessons === 0) {
        // Không có bài học nào, coi như hoàn thành 100% nếu có Enrollment
        await prisma.enrollment.update({
            where: { studentId_courseId: { studentId, courseId } },
            data: { progress: 100, completed: true },
        });
        return;
    }

    // 2. Lấy số bài học đã hoàn thành
    const completedLessons = await prisma.progress.count({
        where: {
            studentId,
            lesson: { courseId }
        }
    });

    // 3. Tính toán phần trăm
    const overallProgress = (completedLessons / totalLessons) * 100;
    const isCompleted = overallProgress >= 100;

    // 4. Cập nhật Enrollment
    await prisma.enrollment.update({
        where: { studentId_courseId: { studentId, courseId } },
        data: {
            progress: parseFloat(overallProgress.toFixed(2)), // Lưu 2 chữ số thập phân
            completed: isCompleted,
        },
    });
}

export default {
    markLessonComplete,
    getCourseProgress,
    getStudentProgress,
    updateEnrollmentProgress,
};