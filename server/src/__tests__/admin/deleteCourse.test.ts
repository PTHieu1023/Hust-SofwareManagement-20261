// # Run all tests
// npm test

// # Run only this test file
// npm test deleteCourse.test.ts

// # Run tests with coverage
// npm test -- --coverage

// # Run tests in watch mode
// npm test -- --watch

// Mock Prisma client before importing
const mockFindUnique = jest.fn();
const mockDelete = jest.fn();
const mockCount = jest.fn();
const mockFindMany = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/config/prisma.config', () => ({
    __esModule: true,
    default: {
        course: {
            findUnique: mockFindUnique,
            delete: mockDelete,
            count: mockCount,
            findMany: mockFindMany,
            update: mockUpdate,
        },
    },
}));

// Import service after mocking
import adminService from '@/services/admin.service';

describe('Admin Service - Delete Course', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('deleteCourse', () => {
        const courseId = 'test-course-id-123';

        it('should throw error when course not found', async () => {
            // Setup mock
            mockFindUnique.mockResolvedValue(null);

            // Execute & Assert
            await expect(adminService.deleteCourse(courseId)).rejects.toThrow('Course not found');
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: courseId },
            });
            expect(mockDelete).not.toHaveBeenCalled();
        });

        it('should successfully delete a published course', async () => {
            // Mock published course
            const mockPublishedCourse = {
                id: courseId,
                title: 'Published Course',
                description: 'Published Description',
                category: 'Design',
                level: 'INTERMEDIATE',
                price: 149.99,
                thumbnail: 'https://example.com/published.jpg',
                isPublished: true,
                teacherId: 'teacher-id-456',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockPublishedCourse as any);
            mockDelete.mockResolvedValue(mockPublishedCourse as any);

            // Execute
            await adminService.deleteCourse(courseId);

            // Assert
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: courseId },
            });
            expect(mockDelete).toHaveBeenCalledWith({
                where: { id: courseId },
            });
        });

        it('should successfully delete an unpublished course', async () => {
            // Mock unpublished course
            const mockUnpublishedCourse = {
                id: courseId,
                title: 'Draft Course',
                description: 'Draft Description',
                category: 'Business',
                level: 'BEGINNER',
                price: 0,
                thumbnail: null,
                isPublished: false,
                teacherId: 'teacher-id-789',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockUnpublishedCourse as any);
            mockDelete.mockResolvedValue(mockUnpublishedCourse as any);

            // Execute
            await adminService.deleteCourse(courseId);

            // Assert
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: courseId },
            });
            expect(mockDelete).toHaveBeenCalledWith({
                where: { id: courseId },
            });
        });

        it('should successfully delete a free course', async () => {
            // Mock free course
            const mockFreeCourse = {
                id: courseId,
                title: 'Free Course',
                description: 'Free Course Description',
                category: 'Technology',
                level: 'BEGINNER',
                price: 0,
                thumbnail: 'https://example.com/free.jpg',
                isPublished: true,
                teacherId: 'teacher-id-000',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockFreeCourse as any);
            mockDelete.mockResolvedValue(mockFreeCourse as any);

            // Execute
            await adminService.deleteCourse(courseId);

            // Assert
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: courseId },
            });
            expect(mockDelete).toHaveBeenCalledWith({
                where: { id: courseId },
            });
        });

        it('should successfully delete a paid course', async () => {
            // Mock paid course
            const mockPaidCourse = {
                id: courseId,
                title: 'Premium Course',
                description: 'Premium Course Description',
                category: 'Marketing',
                level: 'ADVANCED',
                price: 299.99,
                thumbnail: 'https://example.com/premium.jpg',
                isPublished: true,
                teacherId: 'teacher-id-999',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockPaidCourse as any);
            mockDelete.mockResolvedValue(mockPaidCourse as any);

            // Execute
            await adminService.deleteCourse(courseId);

            // Assert
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: courseId },
            });
            expect(mockDelete).toHaveBeenCalledWith({
                where: { id: courseId },
            });
        });

        it('should delete course regardless of teacher ownership', async () => {
            // Mock course from different teachers
            const mockCourse1 = {
                id: 'course-1',
                title: 'Course by Teacher 1',
                description: 'Description',
                category: 'Programming',
                level: 'BEGINNER',
                price: 99.99,
                thumbnail: 'https://example.com/course1.jpg',
                isPublished: true,
                teacherId: 'teacher-id-001',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Setup mocks
            mockFindUnique.mockResolvedValue(mockCourse1 as any);
            mockDelete.mockResolvedValue(mockCourse1 as any);

            // Execute
            await adminService.deleteCourse('course-1');

            // Assert - admin can delete any course regardless of ownership
            expect(mockDelete).toHaveBeenCalledWith({
                where: { id: 'course-1' },
            });
        });
    });
});
