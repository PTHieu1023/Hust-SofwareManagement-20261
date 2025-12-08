// # Run all tests
// npm test

// # Run only this test file
// npm test banUser.test.ts

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

describe('Admin Service - Ban User', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('banUser', () => {
        const userId = 'test-user-id-123';

        it('should successfully ban a regular user', async () => {
            // Mock user data
            const mockUser = {
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

            const mockBannedUser = {
                ...mockUser,
                isBanned: true,
                isActive: false,
            };

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockUser as any);
            mockUpdate.mockResolvedValue(mockBannedUser as any);

            // Execute
            const result = await adminService.banUser(userId);

            // Assert
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    isBanned: true,
                    isActive: false,
                },
            });
            expect(result).toEqual(mockBannedUser);
            expect(result.isBanned).toBe(true);
            expect(result.isActive).toBe(false);
        });

        it('should throw error when user not found', async () => {
            // Setup mock
            mockFindUnique.mockResolvedValue(null);

            // Execute & Assert
            await expect(adminService.banUser(userId)).rejects.toThrow('User not found');
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('should throw error when trying to ban an admin user', async () => {
            // Mock admin user
            const mockAdminUser = {
                id: userId,
                email: 'admin@example.com',
                username: 'admin',
                fullName: 'Admin User',
                role: UserRole.ADMIN,
                isActive: true,
                isBanned: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Setup mock
            mockFindUnique.mockResolvedValue(mockAdminUser as any);

            // Execute & Assert
            await expect(adminService.banUser(userId)).rejects.toThrow('Cannot ban admin user');
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('should throw error when user is already banned', async () => {
            // Mock already banned user
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

            // Setup mock
            mockFindUnique.mockResolvedValue(mockBannedUser as any);

            // Execute & Assert
            await expect(adminService.banUser(userId)).rejects.toThrow('User is already banned');
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('should successfully ban a teacher user', async () => {
            // Mock teacher user
            const mockTeacher = {
                id: userId,
                email: 'teacher@example.com',
                username: 'teacher',
                fullName: 'Teacher User',
                role: UserRole.TEACHER,
                isActive: true,
                isBanned: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockBannedTeacher = {
                ...mockTeacher,
                isBanned: true,
                isActive: false,
            };

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockTeacher as any);
            mockUpdate.mockResolvedValue(mockBannedTeacher as any);

            // Execute
            const result = await adminService.banUser(userId);

            // Assert
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    isBanned: true,
                    isActive: false,
                },
            });
            expect(result.isBanned).toBe(true);
            expect(result.isActive).toBe(false);
            expect(result.role).toBe(UserRole.TEACHER);
        });
    });
});
