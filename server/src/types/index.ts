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

export interface CourseFilters {
    category?: string;
    level?: string;
    search?: string;
}

// Admin User Management
export interface UserFilters {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
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

export interface PaginatedUsers {
    users: UserWithStats[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

