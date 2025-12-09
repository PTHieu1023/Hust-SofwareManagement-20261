import prisma from '@/config/prisma.config';
import { Course, User, UserRole, Prisma } from '@prisma/client';
import { UserFilters, PaginatedUsers } from '@/types';

/**
 * Get all users with filtering and pagination
 * - Support filtering by role
 * - Support search by email/username/fullName
 * - Include user statistics
 */
const getAllUsers = async (filters: UserFilters): Promise<PaginatedUsers> => {
    const { role, search, page = 1, limit = 10 } = filters;

    // Validate pagination params
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(limit, 100)); // Max 100 per page

    // Build where clause with proper Prisma type
    const where: Prisma.UserWhereInput = {};

    // Filter by role
    if (role) {
        const validRoles = Object.values(UserRole);
        if (!validRoles.includes(role as UserRole)) {
            throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }
        where.role = role as UserRole;
    }

    // Search by email/username/fullName (trim whitespace)
    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
        where.OR = [
            { email: { contains: trimmedSearch, mode: 'insensitive' } },
            { username: { contains: trimmedSearch, mode: 'insensitive' } },
            { fullName: { contains: trimmedSearch, mode: 'insensitive' } },
        ];
    }

    // Calculate pagination
    const skip = (validPage - 1) * validLimit;

    // Query count and data in parallel for better performance
    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            skip,
            take: validLimit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                role: true,
                isActive: true,
                isBanned: true,
                createdAt: true,
                _count: {
                    select: {
                        coursesCreated: true,
                        enrollments: true,
                    },
                },
            },
        }),
    ]);

    // Calculate total pages (handle edge case when limit = 0)
    const totalPages = validLimit > 0 ? Math.ceil(total / validLimit) : 0;

    return {
        users,
        pagination: {
            total,
            page: validPage,
            limit: validLimit,
            totalPages,
        },
    };
};

/**
 * - Set isBanned to true
 * - Set isActive to false
 * @param userId - User ID
 * @returns Promise<User>
 */
const banUser = async (userId: string): Promise<User> => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Check if user is admin (cannot ban admin)
    if (user.role === UserRole.ADMIN) {
        throw new Error('Cannot ban admin user');
    }

    // Check if user is already banned
    if (user.isBanned) {
        throw new Error('User is already banned');
    }

    // Ban user
    const bannedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            isBanned: true,
            isActive: false,
        },
    });

    return bannedUser;
};

/**
 * - Set isBanned to false
 * - Set isActive to true
 * @param userId - User ID
 * @returns Promise<User>
 */
const unbanUser = async (userId: string): Promise<User> => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Check if user is not banned
    if (!user.isBanned) {
        throw new Error('User is not banned');
    }

    // Unban user
    const unbannedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            isBanned: false,
            isActive: true,
        },
    });

    return unbannedUser;
};

/**
 * - Remove user and related data
 * @param userId - User ID
 * @returns Promise<void>
 */
const deleteUser = async (userId: string): Promise<void> => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Check if user is admin (cannot delete admin)
    if (user.role === UserRole.ADMIN) {
        throw new Error('Cannot delete admin user');
    }

    // Delete user (Prisma will handle cascade deletion based on schema)
    await prisma.user.delete({
        where: { id: userId },
    });
};

/**
 * - Support search
 * - Include teacher info and statistics
 * @param _filters - Query filters
 * @returns Promise<{ courses: Course[], pagination: any }>
 */
const getAllCourses = async (_filters: {
    search?: string;
    page?: number;
    limit?: number;
}): Promise<{ courses: Course[]; pagination: any }> => {
    const { search, page = 1, limit = 10 } = _filters;

    // Build where clause
    const where: any = {};

    // Search by title/description/category
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
        ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.course.count({ where });

    // Get courses with pagination
    const courses = await prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            category: true,
            level: true,
            isPublished: true,
            createdAt: true,
            teacher: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
            _count: {
                select: {
                    lessons: true,
                    quizzes: true,
                    enrollments: true,
                },
            },
        },
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
        courses: courses as any,
        pagination: {
            total,
            page,
            limit,
            totalPages,
        },
    };
};

/**
 * - Remove course regardless of ownership
 * @param courseId - Course ID
 * @returns Promise<void>
 */
const deleteCourse = async (courseId: string): Promise<void> => {
    // Check if course exists
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course) {
        throw new Error('Course not found');
    }

    // Delete course (Prisma will handle cascade deletion based on schema)
    await prisma.course.delete({
        where: { id: courseId },
    });
};

/**
 * - Total users, students, teachers
 * - Total courses, enrollments
 * - Recent enrollments
 * - Popular courses
 * @returns Promise<any>
 */
const getStatistics = async (): Promise<any> => {
    // Get total counts
    const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.enrollment.count(),
    ]);

    // Count users by role
    const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: {
            role: true,
        },
    });

    const totalStudents = usersByRole.find((r: { role: UserRole }) => r.role === 'STUDENT')?._count.role || 0;
    const totalTeachers = usersByRole.find((r: { role: UserRole }) => r.role === 'TEACHER')?._count.role || 0;
    const totalAdmins = usersByRole.find((r: { role: UserRole }) => r.role === 'ADMIN')?._count.role || 0;

    // Get recent enrollments (last 10)
    const recentEnrollments = await prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        select: {
            id: true,
            enrolledAt: true,
            student: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            course: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });

    // Get popular courses (by enrollment count)
    const popularCourses = await prisma.course.findMany({
        take: 10,
        orderBy: {
            enrollments: {
                _count: 'desc',
            },
        },
        select: {
            id: true,
            title: true,
            category: true,
            isPublished: true,
            teacher: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
            _count: {
                select: {
                    enrollments: true,
                    lessons: true,
                    quizzes: true,
                },
            },
        },
    });

    return {
        overview: {
            totalUsers,
            totalStudents,
            totalTeachers,
            totalAdmins,
            totalCourses,
            totalEnrollments,
        },
        recentEnrollments,
        popularCourses,
    };
};

export default {
    getAllUsers,
    banUser,
    unbanUser,
    deleteUser,
    getAllCourses,
    deleteCourse,
    getStatistics,
};
