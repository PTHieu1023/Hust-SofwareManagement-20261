import httpClient from "../config/api";
import {
  User,
  UserRole,
  Course,
  UserForAdmin,
  CourseForAdmin,
  Pagination,
  AdminStatistics,
} from "../types";

export interface Credentials {
  email: string;
  password: string;
}

// --- AUTH ---
const login = async ({ email, password }: Credentials): Promise<User> => {
  try {
    const res = await httpClient.post("/auth/login", { email, password });

    const { user, token } = res.data.data;

    if (
      !res.data?.data?.user ||
      !res.data?.data?.accessToken ||
      !res.data?.data?.refreshToken
    ) {
      throw new Error("Internal server error.");
    }

    localStorage.setItem("accessToken", res.data.data.accessToken);
    localStorage.setItem("refreshToken", res.data.data.refreshToken);
    localStorage.setItem("user", res.data.data.user);

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
  const res = await httpClient.post("/auth/register", {
    email: userData.email,
    username: userData.email,
    password: userData.password,
    fullName: userData.name,
    role: userData.role.toUpperCase(),
  });

  return res.data.data.user;
};

const logout = async () => {
  await httpClient.post("/auth/logout");

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// --- USERS ---
const getAllUsers = async (): Promise<User[]> => {
  const res = await httpClient.get("/user");
  return res.data;
};

// --- COURSES ---
const getCourses = async (): Promise<Course[]> => {
  const res = await httpClient.get("/course");
  return res.data;
};

const getCourseById = async (id: string): Promise<Course> => {
  const res = await httpClient.get(`/course/${id}`);
  return res.data;
};

// --- ADMIN ---
const getAllUsersForAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<{ users: UserForAdmin[]; pagination: Pagination }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);

    const url = `/admin/users${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;

    const res = await httpClient.get(url);

    const users = res.data.data || [];
    const pagination = res.data.pagination;

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
    throw new Error(err.response?.data?.message || "Failed to fetch users");
  }
};

const getAllCoursesForAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ courses: CourseForAdmin[]; pagination: Pagination }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `/admin/courses${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;

    const res = await httpClient.get(url);

    const courses = res.data.data || [];
    const pagination = res.data.pagination;

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
    throw new Error(err.response?.data?.message || "Failed to fetch courses");
  }
};

const getStatisticsForAdmin = async (): Promise<AdminStatistics> => {
  const res = await httpClient.get("/admin/stats");
  return res.data.data;
};

const banUserForAdmin = async (userId: string): Promise<void> => {
  await httpClient.patch(`/admin/users/${userId}/ban`);
};

const unbanUserForAdmin = async (userId: string): Promise<void> => {
  await httpClient.patch(`/admin/users/${userId}/unban`);
};

const deleteUserForAdmin = async (userId: string): Promise<void> => {
  await httpClient.delete(`/admin/users/${userId}`);
};

const deleteCourseForAdmin = async (courseId: string): Promise<void> => {
  await httpClient.delete(`/admin/courses/${courseId}`);
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
