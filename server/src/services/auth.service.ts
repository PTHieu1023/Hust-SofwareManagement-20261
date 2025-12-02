import { User, PrismaClient, UserRole } from '@prisma/client';
// import { hashString } from '@/utils/security.utils';
import * as SecurityUtils from '@/utils/security.utils';
import * as JwtUtils from '@/utils/jwt.utils';
import Env from '@/utils/env.utils';

const prisma = new PrismaClient();

/**
 * - Validate user input
 * - Check if email/username already exists
 * - Hash password using bcrypt
 * - Create user in database
 * - Generate JWT token
 * @param data - Registration data (email, username, password, fullName, role)
 * @returns Promise<{ user: User, token: string }>
 */
const register = async (data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    role: UserRole;
}): Promise<{ user: Omit<User, 'password'>; token: string }> => {
    // TODO: Implement registration logic
    const { email, username, password, fullName, role } = data;

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: email },
                { username: username }
            ]
        }
    });

    if (existingUser) {
        throw new Error('Email or Username already exists');
    }

    const hashedPassword = await SecurityUtils.hashString(password);

    const newUser = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
            fullName,
            role,
        }
    });

    const payload = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
    };

    const token = JwtUtils.generateToken(payload, Env.JWT_EXPIRES_IN);

    const { password: _, ...userWithoutPassword } = newUser;

    return {
        user: userWithoutPassword,
        token
    };
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
