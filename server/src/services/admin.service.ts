import { User, Course, UserRole } from '@prisma/client';
import prisma from '@/config/prisma.config';

/**
 * - Support filtering by role
 * - Support search by email/username/fullName
 * - Include user statistics
 * @returns Promise<{ users: User[], pagination: any }>
 * @param _filters
 */
const getAllUsers = async (_filters: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
}): Promise<{ users: User[]; pagination: any }> => {
    const { role, search, page = 1, limit = 10 } = _filters;

    // Build where clause
    const where: any = {};

    // Filter by role - validate against Prisma enum
    if (role) {
        const validRoles = Object.values(UserRole);

        if (!validRoles.includes(role as UserRole)) {
            throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }

        where.role = role;
    }

    // Search by email/username/fullName
    if (search) {
        where.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
        ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
        where,
        skip,
        take: limit,
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
            updatedAt: true,
            _count: {
                select: {
                    coursesCreated: true,
                    enrollments: true,
                },
            },
        },
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
        users: users as any,
        pagination: {
            total,
            page,
            limit,
            totalPages,
        },
    };
}

/**
 * - Set isBanned to true
 * - Set isActive to false
 * @param userId - User ID
 * @returns Promise<User>
 */
const banUser = async (_userId: string): Promise<User> => {
    // TODO: Implement ban user
    throw new Error('Not implemented');
}

/**
 * - Set isBanned to false
 * - Set isActive to true
 * @param userId - User ID
 * @returns Promise<User>
 */
const unbanUser = async (_userId: string): Promise<User> => {
    // TODO: Implement unban user
    throw new Error('Not implemented');
}

/**
 * - Remove user and related data
 * @param userId - User ID
 * @returns Promise<void>
 */
const deleteUser = async (_userId: string): Promise<void> => {
    // TODO: Implement delete user
    throw new Error('Not implemented');
}

/**
 * - Support search
 * - Include teacher info and statistics
 * @param filters - Query filters
 * @returns Promise<{ courses: Course[], pagination: any }>
 */
const getAllCourses = async (_filters: {
    search?: string;
    page?: number;
    limit?: number;
}): Promise<{ courses: Course[]; pagination: any }> => {
    // TODO: Implement get all courses
    throw new Error('Not implemented');
}

/**
 * - Remove course regardless of ownership
 * @param courseId - Course ID
 * @returns Promise<void>
 */
const deleteCourse = async (_courseId: string): Promise<void> => {
    // TODO: Implement delete course
    throw new Error('Not implemented');
}

/**
 * - Total users, students, teachers
 * - Total courses, enrollments
 * - Recent enrollments
 * - Popular courses
 * @returns Promise<any>
 */
const getStatistics = async (): Promise<any> => {
    // TODO: Implement get statistics
    throw new Error('Not implemented');
}

export default {
    getAllUsers,
    banUser,
    unbanUser,
    deleteUser,
    getAllCourses,
    deleteCourse,
    getStatistics,
};