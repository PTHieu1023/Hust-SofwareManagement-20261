import { User } from '@prisma/client';

export class UserService {
    /**
     * TODO: Get user by ID
     * - Query database for user by id
     * - Exclude password from result
     * @param userId - User ID
     * @returns Promise<User | null>
     */
    async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
        // TODO: Implement get user by id
        throw new Error('Not implemented');
    }

    /**
     * TODO: Update user profile
     * - Update user data (fullName, avatar, etc.)
     * - Return updated user without password
     * @param userId - User ID
     * @param data - Update data
     * @returns Promise<User>
     */
    async updateProfile(
        userId: string,
        data: { fullName?: string; avatar?: string }
    ): Promise<Omit<User, 'password'>> {
        // TODO: Implement profile update
        throw new Error('Not implemented');
    }
}

export default new UserService();
