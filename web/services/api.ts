import axios from "axios";
import {
  User,
  UserRole,
  Course,
  UserForAdmin,
  CourseForAdmin,
  Pagination,
  AdminStatistics
} from "../types";

export interface Credentials {
  email: string;
  password: string;
}

// ✅ Your backend base URL
const API_URL = "http://localhost:3000/api";

// ✅ Axios instance
const client = axios.create({
  baseURL: API_URL,
  withCredentials: true, // important if backend uses cookies
});

// --- AUTH ---
const login = async ({ email, password }: Credentials): Promise<User> => {
  try {
    const res = await client.post("/auth/login", { email, password });

    if (!res.data?.data?.user) {
      throw new Error("Invalid login response from server.");
    }

    return res.data.data.user;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Login failed";

    throw new Error(message);
  }
};

const signup = async (userData: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<User> => {
  // Log the payload
  // console.log('Signing up with payload:', {
  //   email: userData.email,
  //   username: userData.email,
  //   password: userData.password,
  //   fullName: userData.name,
  //   role: userData.role.toUpperCase(),
  // });

  const res = await client.post("/auth/register", {
    email: userData.email,
    username: userData.email,
    password: userData.password,
    fullName: userData.name,
    role: userData.role.toUpperCase(),
  });

  return res.data.data.user;
};

const logout = async () => {
  await client.post("/auth/logout");
};

// --- USERS ---
const getAllUsers = async (): Promise<User[]> => {
  const res = await client.get("/user");
  return res.data;
};

// --- COURSES ---
const getCourses = async (): Promise<Course[]> => {
  const res = await client.get("/course");
  return res.data;
};

const getCourseById = async (id: string): Promise<Course> => {
  const res = await client.get(`/course/${id}`);
  return res.data;
};

// --- ADMIN ---
/**
 * Get all users for admin with pagination, search, and role filter
 */
const getAllUsersForAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<{ users: UserForAdmin[]; pagination: Pagination }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);

    const url = `/admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const res = await client.get(url);

    // Server returns: { success: true, data: [...], pagination: {...} }
    const users = res.data.data || [];
    const pagination = res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 };

    // Map server response to frontend UserForAdmin type
    const mappedUsers = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role as UserRole,
      isActive: u.isActive,
      isBanned: u.isBanned,
      createdAt: u.createdAt,
      _count: {
        coursesCreated: u._count?.coursesCreated || 0,
        enrollments: u._count?.enrollments || 0,
      },
    }));

    return { users: mappedUsers, pagination };
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Failed to fetch users";
    throw new Error(message);
  }
};

const getAllCoursesForAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ courses: CourseForAdmin[]; pagination: Pagination }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `/admin/courses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const res = await client.get(url);

    // Server returns: { success: true, data: [...], pagination: {...} }
    const courses = res.data.data || [];
    const pagination = res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 };

    // Map server response to frontend CourseForAdmin type
    const mappedCourses = courses.map((c: any) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      level: c.level,
      isPublished: c.isPublished,
      createdAt: c.createdAt,
      teacher: {
        id: c.teacher.id,
        fullName: c.teacher.fullName,
      },
      _count: {
        lessons: c._count?.lessons || 0,
        quizzes: c._count?.quizzes || 0,
        enrollments: c._count?.enrollments || 0,
      },
    }));

    return { courses: mappedCourses, pagination };
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Failed to fetch courses";
    throw new Error(message);
  }
};

const getStatisticsForAdmin = async (): Promise<AdminStatistics> => {
  try {
    const res = await client.get("/admin/stats");
    // Server returns: { success: true, data: { overview, recentEnrollments, popularCourses } }
    return res.data.data;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Failed to fetch statistics";
    throw new Error(message);
  }
};

const banUserForAdmin = async (userId: string): Promise<void> => {
  try {
    await client.patch(`/admin/users/${userId}/ban`);
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Failed to ban user";
    throw new Error(message);
  }
};

const unbanUserForAdmin = async (userId: string): Promise<void> => {
  try {
    await client.patch(`/admin/users/${userId}/unban`);
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Failed to unban user";
    throw new Error(message);
  }
};

const deleteUserForAdmin = async (userId: string): Promise<void> => {
  try {
    await client.delete(`/admin/users/${userId}`);
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Failed to delete user";
    throw new Error(message);
  }
};

const deleteCourseForAdmin = async (courseId: string): Promise<void> => {
  try {
    await client.delete(`/admin/courses/${courseId}`);
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Failed to delete course";
    throw new Error(message);
  }
};

export const api = {
  login,
  signup,
  logout,
  getAllUsers,
  getCourses,
  getCourseById,
  getAllUsersForAdmin,
  getAllCoursesForAdmin,
  getStatisticsForAdmin,
  banUserForAdmin,
  unbanUserForAdmin,
  deleteUserForAdmin,
  deleteCourseForAdmin,
};
