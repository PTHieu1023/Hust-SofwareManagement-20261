import jwt from 'jsonwebtoken';
import Env from '@/utils/env.utils';

type JWTPayload = Record<string, any> | null;
const JWT_ISSUER = 'elearning-platform';
const JWT_AUDIENCE = 'elearning-users';

/**
 * Generate a JWT token
 * @param payload - User data to encode in the token
 * @param expiresIn - Token expiration time (default from env)
 * @returns Signed JWT token
 * @throws Error if token generation fails
 */
export const generateToken = (
    payload: JWTPayload,
    expiresIn: number = 300 // 5 minutes
): string => {
    if (!Env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    if (payload === null) {
        throw new Error('Payload cannot be null');
    }

    const token = jwt.sign(payload, Env.JWT_SECRET, {
        expiresIn: expiresIn,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    });

    return token;
};

/**
 * Generate a refresh token with longer expiration
 * @param payload - User data to encode in the token
 * @param expiresIn - Token expiration time (default 30 days)
 * @returns Signed JWT refresh token
 */
export const generateRefreshToken = (
    payload: JWTPayload,
    expiresIn: number = 2592000 // 30 days
): string => {
    if (!Env.JWT_SECRET) {
        throw new Error('missing_jwt_secret');
    }
    if (payload === null) {
        throw new Error('Payload cannot be null');
    }

    const token = jwt.sign(
        { ...payload, tokenType: 'refresh' },
        Env.JWT_SECRET,
        {
            expiresIn: expiresIn,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        }
    );

    return token;
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify and decode
 * @returns Decoded token payload
 * @throws Error if token is invalid, expired, or verification fails
 */
export const verifyToken = (token: string): JWTPayload => {
    try {
        if (!token) {
            throw new Error('Token is required');
        }

        if (!Env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        return jwt.verify(token, Env.JWT_SECRET, {
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        }) as JWTPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('token_expired');
        }
        throw new Error('invalid_token');
    }
};