// # Run all tests
// npm test

// # Run only this test file
// npm test unbanUser.test.ts

// # Run tests with coverage
// npm test -- --coverage

// # Run tests in watch mode
// npm test -- --watch

import { UserRole } from '@prisma/client';

// Mock Prisma client before importing
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockCount = jest.fn();
const mockFindMany = jest.fn();

jest.mock('@/config/prisma.config', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: mockFindUnique,
            update: mockUpdate,
            count: mockCount,
            findMany: mockFindMany,
        },
    },
}));

// Import service after mocking
import adminService from '@/services/admin.service';

describe('Admin Service - Unban User', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('unbanUser', () => {
        const userId = 'test-user-id-123';

        it('should successfully unban a banned student user', async () => {
            // Mock banned user data
            const mockBannedUser = {
                id: userId,
                email: 'test@example.com',
                username: 'testuser',
                fullName: 'Test User',
                role: UserRole.STUDENT,
                isActive: false,
                isBanned: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockUnbannedUser = {
                ...mockBannedUser,
                isBanned: false,
                isActive: true,
            };

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockBannedUser as any);
            mockUpdate.mockResolvedValue(mockUnbannedUser as any);

            // Execute
            const result = await adminService.unbanUser(userId);

            // Assert
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    isBanned: false,
                    isActive: true,
                },
            });
            expect(result).toEqual(mockUnbannedUser);
            expect(result.isBanned).toBe(false);
            expect(result.isActive).toBe(true);
        });

        it('should throw error when user not found', async () => {
            // Setup mock
            mockFindUnique.mockResolvedValue(null);

            // Execute & Assert
            await expect(adminService.unbanUser(userId)).rejects.toThrow('User not found');
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('should throw error when user is not banned', async () => {
            // Mock user that is already active (not banned)
            const mockActiveUser = {
                id: userId,
                email: 'test@example.com',
                username: 'testuser',
                fullName: 'Test User',
                role: UserRole.STUDENT,
                isActive: true,
                isBanned: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Setup mock
            mockFindUnique.mockResolvedValue(mockActiveUser as any);

            // Execute & Assert
            await expect(adminService.unbanUser(userId)).rejects.toThrow('User is not banned');
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('should successfully unban a banned teacher user', async () => {
            // Mock banned teacher user
            const mockBannedTeacher = {
                id: userId,
                email: 'teacher@example.com',
                username: 'teacher',
                fullName: 'Teacher User',
                role: UserRole.TEACHER,
                isActive: false,
                isBanned: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockUnbannedTeacher = {
                ...mockBannedTeacher,
                isBanned: false,
                isActive: true,
            };

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockBannedTeacher as any);
            mockUpdate.mockResolvedValue(mockUnbannedTeacher as any);

            // Execute
            const result = await adminService.unbanUser(userId);

            // Assert
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    isBanned: false,
                    isActive: true,
                },
            });
            expect(result.isBanned).toBe(false);
            expect(result.isActive).toBe(true);
            expect(result.role).toBe(UserRole.TEACHER);
        });
    });
});
