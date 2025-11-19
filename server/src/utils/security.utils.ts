import bcrypt from 'bcrypt';
import Env from '@/utils/env.utils';
import crypto from 'node:crypto';

export const hashString = async (input: string): Promise<string> => {
    const salt = await bcrypt.genSalt(Env.SALT_ROUNDS);
    return await bcrypt.hash(input + Env.SECURITY_PEPPER, salt);
};

export const checkHash = async (
    origin: string,
    hashedValue: string
): Promise<boolean> => {
    return await bcrypt.compare(origin + Env.SECURITY_PEPPER, hashedValue);
};

export const encrytpData = (data: string): string => {
    const cipher = crypto.createCipheriv(
        'aes-256-gcm',
        Buffer.from(Env.ENCRYPTION_KEY, 'hex'),
        Buffer.from(Env.ENCRYPTION_IV, 'hex')
    );
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return encrypted + authTag.toString('hex');
}

export const decryptData = (encryptedData: string): string => {
    const authTag = Buffer.from(encryptedData.slice(-32), 'hex');
    const encrypted = encryptedData.slice(0, -32);
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(Env.ENCRYPTION_KEY, 'hex'),
        Buffer.from(Env.ENCRYPTION_IV, 'hex')
    );
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}