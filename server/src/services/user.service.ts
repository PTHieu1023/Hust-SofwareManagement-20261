import { User } from '@prisma/client';
import prisma from '@/config/prisma.config';

/**
 * - Query database for user by id
 * - Exclude password from result
 * @param userId - User ID
 * @returns Promise<User | null>
 */
const getUserById = async (userId: string): Promise<Omit<User, 'password'> | null> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

/**
 * - Update user data (fullName, avatar, etc.)
 * - Return updated user without password
 * @param userId - User ID
 * @param data - Update data
 * @returns Promise<User>
 */
const updateProfile = async (
    userId: string,
    data: { fullName?: string; avatar?: string }
): Promise<Omit<User, 'password'>> => {
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

export default {
    getUserById,
    updateProfile,
};