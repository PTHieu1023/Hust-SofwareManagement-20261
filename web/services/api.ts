// src/services/api.ts
import axios from "axios";
import {
  User,
  UserRole,
  Course,
  UserForAdmin,
  CourseForAdmin,
  Pagination,
  AdminStatistics,
  // Chỉ import thêm Type của Lesson (Feature của bạn)
  Lesson, 
  CreateLessonPayload, 
  UpdateLessonPayload
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

// --- AUTH (GIỮ NGUYÊN TỪ MAIN) ---
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

// --- USERS (GIỮ NGUYÊN TỪ MAIN) ---
const getAllUsers = async (): Promise<User[]> => {
  const res = await client.get("/user");
  return res.data;
};

// --- COURSES (GIỮ NGUYÊN TỪ MAIN) ---
const getCourses = async (): Promise<Course[]> => {
  const res = await client.get("/course");
  return res.data;
};

const getCourseById = async (id: string): Promise<Course> => {
  const res = await client.get(`/course/${id}`);
  return res.data;
};

// --- LESSONS (FEATURE CỦA BẠN - MỚI THÊM) ---

// 1. Upload File
const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await client.post("/uploads", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.url; 
};

// 2. Lấy danh sách bài học
const getLessonsByCourse = async (courseId: string): Promise<Lesson[]> => {
  const res = await client.get(`/lessons/course/${courseId}`);
  return res.data;
};

// 3. Lấy chi tiết bài học (để edit)
const getLessonById = async (lessonId: string): Promise<Lesson> => {
  const res = await client.get(`/lessons/${lessonId}`);
  return res.data;
};

// 4. Tạo bài học
const createLesson = async (data: CreateLessonPayload): Promise<Lesson> => {
  const res = await client.post("/lessons", data);
  return res.data;
};

// 5. Cập nhật bài học
const updateLesson = async (id: string, data: UpdateLessonPayload): Promise<Lesson> => {
  const res = await client.put(`/lessons/${id}`, data);
  return res.data;
};

// 6. Publish/Unpublish
const toggleLessonPublish = async (id: string, isPublished: boolean): Promise<Lesson> => {
  const res = await client.patch(`/lessons/${id}/publish`, { isPublished });
  return res.data;
};

// 7. Xóa bài học
const deleteLesson = async (id: string): Promise<void> => {
  await client.delete(`/lessons/${id}`);
};


// --- ADMIN (GIỮ NGUYÊN TỪ MAIN - ĐÃ FIX SYNTAX ĐỂ CHẠY ĐƯỢC) ---
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

    const users = res.data.data || [];
    const pagination = res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 };

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
    const message = err.response?.data?.message || err.response?.data?.error || "Failed to fetch users";
    throw new Error(message);
  }
};

const getAllCoursesForAdmin = async (params?: any): Promise<{ courses: CourseForAdmin[]; pagination: Pagination }> => {
    // Logic placeholder để fix lỗi syntax từ file main gốc
    const res = await client.get("/admin/courses");
    const courses = res.data.data || [];
    const pagination = res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 };
    // Map data...
    const mappedCourses = courses.map((c: any) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      level: c.level,
      isPublished: c.isPublished,
      createdAt: c.createdAt,
      teacher: { id: c.teacher.id, fullName: c.teacher.fullName },
      _count: { lessons: 0, quizzes: 0, enrollments: 0 },
    }));
    return { courses: mappedCourses, pagination };
};

const getStatisticsForAdmin = async (): Promise<AdminStatistics> => {
    const res = await client.get("/admin/stats");
    return res.data.data;
};

const banUserForAdmin = async (userId: string): Promise<void> => {
    await client.patch(`/admin/users/${userId}/ban`);
};

const unbanUserForAdmin = async (userId: string): Promise<void> => {
    await client.patch(`/admin/users/${userId}/unban`);
};

const deleteUserForAdmin = async (userId: string): Promise<void> => {
    await client.delete(`/admin/users/${userId}`);
};

const deleteCourseForAdmin = async (courseId: string): Promise<void> => {
    await client.delete(`/admin/courses/${courseId}`);
};

export const api = {
  login,
  signup,
  logout,
  
  // Basic
  getAllUsers,
  getCourses,
  getCourseById,

  // Feature: Lesson (Của bạn)
  uploadFile,
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  toggleLessonPublish,
  deleteLesson,

  // Admin (Của Main)
  getAllUsersForAdmin,
  getAllCoursesForAdmin,
  getStatisticsForAdmin,
  banUserForAdmin,
  unbanUserForAdmin,
  deleteUserForAdmin,
  deleteCourseForAdmin,
};