import { Course, Prisma } from '@prisma/client';
import prisma from '@/config/prisma.config';
import createHttpError from 'http-errors';

/**
 * UC-L04: Get courses for specific teacher (View My Courses)
 */
const getTeacherCourses = async (teacherId: string): Promise<Course[]> => {
    return await prisma.course.findMany({
        where: {
            teacherId: teacherId,
        },
        orderBy: {
            updatedAt: 'desc',
        },
        include: {
            _count: {
                select: { lessons: true, enrollments: true },
            },
        },
    });
};

/**
 * Public: Get all courses with filters (Browse Courses)
 */
const getAllCourses = async (filters: {
    category?: string;
    level?: string;
    search?: string;
}): Promise<Course[]> => {
    const { category, level, search } = filters;

    const where: Prisma.CourseWhereInput = {
        isPublished: true, // Only show published courses to students
        ...(category && { category }),
        ...(level && { level }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    return await prisma.course.findMany({
        where,
        include: {
            teacher: {
                select: { fullName: true, avatar: true },
            },
            _count: {
                select: { lessons: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * Helper: Get detailed course info
 */
const getCourseById = async (courseId: string, viewerId?: string): Promise<Course | null> => {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            teacher: {
                select: { id: true, fullName: true, avatar: true },
            },
            lessons: {
                // Logic: Nếu là chủ sở hữu xem thì hiện hết lesson, nếu là khách thì chỉ hiện lesson đã publish
                // Tuy nhiên, ở mức độ simple, ta tạm thời chỉ hiện lesson đã publish để tránh phức tạp
                where: { isPublished: true }, 
                orderBy: { order: 'asc' },
            },
            _count: {
                select: { enrollments: true },
            },
        },
    });

    if (!course) return null;

    // LOGIC CHẶN HỌC VIÊN XEM KHÓA DRAFT
    if (course.isPublished === false) {
        // Nếu người xem là chủ sở hữu (Teacher) thì vẫn cho xem (Preview mode)
        if (viewerId && viewerId === course.teacherId) {
            return course;
        }
        // Còn lại (Student hoặc Guest) thì chặn
        return null;
    }

    return course;
};

/**
 * UC-L05: Create Course
 */
const createCourse = async (
    teacherId: string,
    data: {
        title: string;
        description?: string;
        category?: string;
        level?: string;
        thumbnail?: string;
    }
): Promise<Course> => {
    return await prisma.course.create({
        data: {
            ...data,
            teacherId,
            isPublished: false, // Default is Draft
        },
    });
};

/**
 * UC-L06: Update Course
 */
const updateCourse = async (
    courseId: string,
    teacherId: string,
    data: {
        title?: string;
        description?: string;
        category?: string;
        level?: string;
        thumbnail?: string;
    }
): Promise<Course> => {
    // 1. Check ownership
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) throw createHttpError(404, 'Course not found');
    if (course.teacherId !== teacherId) throw createHttpError(403, 'You are not the owner of this course');

    // 2. Update
    return await prisma.course.update({
        where: { id: courseId },
        data: {
            ...data,
        },
    });
};

/**
 * UC-L09: Delete Course
 */
const deleteCourse = async (courseId: string, teacherId: string): Promise<void> => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) throw createHttpError(404, 'Course not found');
    if (course.teacherId !== teacherId) throw createHttpError(403, 'You are not the owner of this course');

    // onDelete: Cascade in Prisma schema will auto-delete lessons/enrollments
    await prisma.course.delete({
        where: { id: courseId },
    });
};

/**
 * UC-L07: Publish/Unpublish
 */
export const updateCoursePublishStatus = async (
    courseId: string,
    teacherId: string,
    isPublished: boolean
): Promise<Course> => {
    // 1. Tìm khóa học để kiểm tra sự tồn tại
    const course = await prisma.course.findUnique({ 
        where: { id: courseId } 
    });

    if (!course) {
        throw createHttpError(404, 'Course not found');
    }

    // 2. Kiểm tra quyền sở hữu (Verify Owner)
    if (course.teacherId !== teacherId) {
        throw createHttpError(403, 'You are not the owner of this course');
    }

    // [Tùy chọn - Logic mở rộng]
    // Nếu muốn Publish (isPublished = true), bạn nên kiểm tra xem khóa học đã có Chapter/Lesson chưa.
    // if (isPublished) {
    //     const hasContent = await prisma.chapter.findFirst({ where: { courseId, isPublished: true } });
    //     if (!hasContent) throw createHttpError(400, 'Cannot publish an empty course');
    // }

    // 3. Cập nhật trạng thái
    return await prisma.course.update({
        where: { id: courseId },
        data: { 
            isPublished: isPublished // Gán giá trị trực tiếp
        },
    });
};

export default {
    getTeacherCourses, // Export thêm hàm này
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    updateCoursePublishStatus,
};