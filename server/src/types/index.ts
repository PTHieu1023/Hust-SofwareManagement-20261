export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export interface PaginationQuery {
    page?: string;
    limit?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface CourseFilters {
    category?: string;
    level?: string;
    search?: string;
}

// Generic Pagination Types
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface Paginated<T> {
    data: T[];
    pagination: PaginationMeta;
}

// -----ADMIN------

// Admin User Management
export interface UserFilters extends PaginationParams {
    role?: string;
    search?: string;
}

export interface UserWithStats {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
    role: string;
    isActive: boolean;
    isBanned: boolean;
    createdAt: Date;
    _count: {
        coursesCreated: number;
        enrollments: number;
    };
}

export type PaginatedUsers = Paginated<UserWithStats>;

// Admin Course Management
export interface CourseFiltersAdmin extends PaginationParams {
    search?: string;
}

export interface CourseWithStats {
    id: string;
    title: string;
    category: string | null;
    level: string | null;
    isPublished: boolean;
    createdAt: Date;
    teacher: {
        id: string;
        fullName: string | null;
    };
    _count: {
        lessons: number;
        quizzes: number;
        enrollments: number;
    };
}

export type PaginatedCourses = Paginated<CourseWithStats>;

// Admin Statistics
export interface AdminStatistics {
    overview: {
        totalUsers: number;
        totalStudents: number;
        totalTeachers: number;
        totalAdmins: number;
        totalCourses: number;
        totalEnrollments: number;
    };
    recentEnrollments: Array<{
        id: string;
        enrolledAt: Date;
        student: {
            id: string;
            fullName: string | null;
            email: string;
        };
        course: {
            id: string;
            title: string;
        };
    }>;
    popularCourses: Array<{
        id: string;
        title: string;
        category: string | null;
        isPublished: boolean;
        teacher: {
            id: string;
            fullName: string | null;
        };
        _count: {
            enrollments: number;
            lessons: number;
            quizzes: number;
        };
    }>;
}

