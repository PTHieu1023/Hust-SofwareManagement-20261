import { User } from '@prisma/client';

/**
 * - Validate user input
 * - Check if email/username already exists
 * - Hash password using bcrypt
 * - Create user in database
 * - Generate JWT token
 * @param data - Registration data (email, username, password, fullName, role)
 * @returns Promise<{ user: User, token: string }>
 */
const register = async (_data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    role: string;
}): Promise<{ user: Omit<User, 'password'>; token: string }> => {
    // TODO: Implement registration logic
    throw new Error('Not implemented');
}

/**
 * - Find user by email
 * - Verify password using bcrypt
 * - Check if user is banned
 * - Generate JWT token
 * @param email - User email
 * @param password - User password
 * @returns Promise<{ user: User, token: string }>
 */
const login = async (
    _email: string,
    _password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> => {
    // TODO: Implement login logic
    throw new Error('Not implemented');
}

/**
 * - Sign token with user data (id, email, role)
 * - Set expiration time from config
 * @param user - User data
 * @returns string - JWT token
 */
const generateToken = (_user: { id: string; email: string; role: string }): string => {
    // TODO: Implement token generation
    throw new Error('Not implemented');
}

/**
 * - Verify token signature
 * - Check expiration
 * @param token - JWT token
 * @returns decoded token data
 */
const verifyToken = (_token: string): { id: string; email: string; role: string } => {
    // TODO: Implement token verification
    throw new Error('Not implemented');
}

export default {
    register,
    login,
    generateToken,
    verifyToken,
};
