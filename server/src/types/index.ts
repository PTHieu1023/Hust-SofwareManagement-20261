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
