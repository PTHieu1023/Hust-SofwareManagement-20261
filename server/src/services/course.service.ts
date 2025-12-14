import { Course } from '@prisma/client';
import prisma from '@/config/prisma.config';


/**
 * - Apply category, level, search filters
 * - Include teacher info and counts
 * - Return only published courses for students
 * @param filters - Course filters (category, level, search)
 * @returns Promise<Course[]>
 */
const getAllCourses = async (filters: {
    category?: string;
    level?: string;
    search?: string;
}): Promise<Course[]> => {
    const where: any = { isPublished: true };

    if (filters?.category) where.category = filters.category;
    if (filters?.level) where.level = filters.level;

    if (filters?.search) {
        const q = filters.search;
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
        ];
    }

    const courses = await prisma.course.findMany({
        where,
        include: {
            teacher: true,
            _count: {
                select: { enrollments: true, lessons: true }
            }
        }
    });

    return courses;
}

/**
 * - Include teacher, lessons, quizzes
 * - Include enrollment count
 * @param courseId - Course ID
 * @returns Promise<Course | null>
 */
const getCourseById = async (courseId: string): Promise<Course | null> => {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            teacher: true,
            lessons: true,
            quizzes: true,
            _count: { select: { enrollments: true } }
        }
    });

    if (!course) return null;
    // Only return published courses in public routes
    if (!course.isPublished) return null;

    return course;
}

/**
 * - Validate teacher permission
 * - Create course with provided data
 * - Handle thumbnail upload
 * @param teacherId - Teacher user ID
 * @param data - Course data
 * @returns Promise<Course>
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
    const created = await prisma.course.create({
        data: {
            title: data.title,
            description: data.description ?? null,
            category: data.category ?? null,
            level: data.level ?? null,
            thumbnail: data.thumbnail ?? null,
            teacherId,
            isPublished: false
        }
    });

    return created;
}

/**
 * - Verify teacher owns the course
 * - Update course data
 * @param courseId - Course ID
 * @param teacherId - Teacher user ID
 * @param data - Update data
 * @returns Promise<Course>
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
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new Error('Course not found');
    if (course.teacherId !== teacherId) throw new Error('Unauthorized');

    const updated = await prisma.course.update({
        where: { id: courseId },
        data: {
            title: data.title ?? course.title,
            description: data.description ?? course.description,
            category: data.category ?? course.category,
            level: data.level ?? course.level,
            thumbnail: data.thumbnail ?? course.thumbnail
        }
    });

    return updated;
}

/**
 * - Verify teacher owns the course
 * - Delete course and related data (cascading)
 * @param courseId - Course ID
 * @param teacherId - Teacher user ID
 * @returns Promise<void>
 */
const deleteCourse = async (courseId: string, teacherId: string): Promise<void> => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new Error('Course not found');
    if (course.teacherId !== teacherId) throw new Error('Unauthorized');

    await prisma.course.delete({ where: { id: courseId } });
}

/**
 * - Verify teacher owns the course
 * - Toggle isPublished field
 * @param courseId - Course ID
 * @param teacherId - Teacher user ID
 * @returns Promise<Course>
 */
const togglePublish = async (courseId: string, teacherId: string): Promise<Course> => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new Error('Course not found');
    if (course.teacherId !== teacherId) throw new Error('Unauthorized');

    const updated = await prisma.course.update({
        where: { id: courseId },
        data: { isPublished: !course.isPublished }
    });

    return updated;
}

export default {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    togglePublish,
};