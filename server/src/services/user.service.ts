import { User } from '@prisma/client';

/**
 * - Query database for user by id
 * - Exclude password from result
 * @param userId - User ID
 * @returns Promise<User | null>
 */
const getUserById = async (_userId: string): Promise<Omit<User, 'password'> | null> => {
    // TODO: Implement get user by id
    throw new Error('Not implemented');
}

/**
 * - Update user data (fullName, avatar, etc.)
 * - Return updated user without password
 * @param userId - User ID
 * @param data - Update data
 * @returns Promise<User>
 */
const updateProfile = async (
    _userId: string,
    _data: { fullName?: string; avatar?: string }
): Promise<Omit<User, 'password'>> => {
    // TODO: Implement profile update
    throw new Error('Not implemented');
}

export default {
    getUserById,
    updateProfile,
};