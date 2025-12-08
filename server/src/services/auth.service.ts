import { User, PrismaClient, UserRole } from '@prisma/client';
import * as SecurityUtils from '@/utils/security.utils';
import * as JwtUtils from '@/utils/jwt.utils';
import Env from '@/utils/env.utils';

const prisma = new PrismaClient();

const AVATAR_COLORS = [
    'F44336', // Red
    'E91E63', // Pink
    '9C27B0', // Purple
    '673AB7', // Deep Purple
    '3F51B5', // Indigo
    '2196F3', // Blue
    '03A9F4', // Light Blue (đậm vừa đủ)
    '009688', // Teal
    '4CAF50', // Green
    'FF9800', // Orange
    'FF5722', // Deep Orange
];

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
    avatar?: string;
}): Promise<{ user: Omit<User, 'password'>; token: string }> => {
    // TODO: Implement registration logic
    const { email, username, password, fullName, role , avatar} = data;

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

    let finalAvatar = avatar;
    if (!finalAvatar){
        const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        const initial = username.substring(0, 2);
        finalAvatar = avatar || `https://ui-avatars.com/api/?name=${initial}&background=${randomColor}&color=fff`;
    }

    const newUser = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
            fullName,
            role,
            avatar: finalAvatar,
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
    email: string,
    password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> => {
    // TODO: Implement login logic
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error('Email or password is incorrect.');
    }

    if (user.isBanned) {
        throw new Error('Account has been banned. Please contact the administrator.');
    }

    if (!user.isActive) {
        throw new Error('Account has not been activated.');
    }

    const isPasswordValid = await SecurityUtils.checkHash(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Email or password is incorrect.');
    }

    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    const token = JwtUtils.generateToken(payload, Env.JWT_EXPIRES_IN);

    const { password: _, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        token
    };
}

/**
 * - Sign token with user data (id, email, role)
 * - Set expiration time from config
 * @param user - User data
 * @returns string - JWT token
 */
const generateToken = (user: { id: string; email: string; role: string }): string => {
    // TODO: Implement token generation
    return JwtUtils.generateToken(
        { id: user.id, email: user.email, role: user.role },
        Env.JWT_EXPIRES_IN
    );
}

/**
 * - Verify token signature
 * - Check expiration
 * @param token - JWT token
 * @returns decoded token data
 */
const verifyToken = (token: string): { id: string; email: string; role: string } => {
    // TODO: Implement token verification
    const decoded = JwtUtils.verifyToken(token);
    
    return {
        id: decoded?.id,
        email: decoded?.email,
        role: decoded?.role
    };
}

export default {
    register,
    login,
    generateToken,
    verifyToken,
};
