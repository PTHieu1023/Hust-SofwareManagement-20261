// # Run all tests
// npm test

// # Run only this test file
// npm test deleteUser.test.ts

// # Run tests with coverage
// npm test -- --coverage

// # Run tests in watch mode
// npm test -- --watch

import { UserRole } from '@prisma/client';

// Mock Prisma client before importing
const mockFindUnique = jest.fn();
const mockDelete = jest.fn();
const mockUpdate = jest.fn();
const mockCount = jest.fn();
const mockFindMany = jest.fn();

jest.mock('@/config/prisma.config', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: mockFindUnique,
            delete: mockDelete,
            update: mockUpdate,
            count: mockCount,
            findMany: mockFindMany,
        },
    },
}));

// Import service after mocking
import adminService from '@/services/admin.service';

describe('Admin Service - Delete User', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('deleteUser', () => {
        const userId = 'test-user-id-123';

        it('should successfully delete a regular student user', async () => {
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

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockUser as any);
            mockDelete.mockResolvedValue(mockUser as any);

            // Execute
            await adminService.deleteUser(userId);

            // Assert
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockDelete).toHaveBeenCalledWith({
                where: { id: userId },
            });
        });

        it('should throw error when user not found', async () => {
            // Setup mock
            mockFindUnique.mockResolvedValue(null);

            // Execute & Assert
            await expect(adminService.deleteUser(userId)).rejects.toThrow('User not found');
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockDelete).not.toHaveBeenCalled();
        });

        it('should throw error when trying to delete an admin user', async () => {
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
            await expect(adminService.deleteUser(userId)).rejects.toThrow('Cannot delete admin user');
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockDelete).not.toHaveBeenCalled();
        });

        it('should successfully delete a teacher user', async () => {
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

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockTeacher as any);
            mockDelete.mockResolvedValue(mockTeacher as any);

            // Execute
            await adminService.deleteUser(userId);

            // Assert
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockDelete).toHaveBeenCalledWith({
                where: { id: userId },
            });
        });

        it('should successfully delete a banned user', async () => {
            // Mock banned user
            const mockBannedUser = {
                id: userId,
                email: 'banned@example.com',
                username: 'banneduser',
                fullName: 'Banned User',
                role: UserRole.STUDENT,
                isActive: false,
                isBanned: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockBannedUser as any);
            mockDelete.mockResolvedValue(mockBannedUser as any);

            // Execute
            await adminService.deleteUser(userId);

            // Assert
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockDelete).toHaveBeenCalledWith({
                where: { id: userId },
            });
        });
    });
});
