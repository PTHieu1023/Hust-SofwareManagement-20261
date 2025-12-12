import httpClient from "../config/api";
import {
  User,
  UserRole,
  Course,
  Enrollment,
  UserForAdmin,
  CourseForAdmin,
  Pagination,
  AdminStatistics,
} from "../types";

export interface Credentials {
  email: string;
  password: string;
}

const login = async ({ email, password }: Credentials): Promise<User> => {
  try {
    const res = await httpClient.post("/auth/login", { email, password });
    const { user, accessToken, refreshToken } = res.data.data; 

    if (!user || !accessToken || !refreshToken) {
      throw new Error("Internal server error.");
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user)); 

    return user;
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
  try {
      await httpClient.post("/auth/logout");
  } catch (e) { console.log(e) }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const getAllUsers = async (): Promise<User[]> => {
  const res = await httpClient.get("/user");
  return res.data;
};

const getUserById = async (id: string): Promise<User> => { 
  const res = await httpClient.get(`/user/${id}`);
  return res.data;
};

// 1. Get All (Public + Search/Filter)
const getCourses = async (params?: { search?: string; level?: string; category?: string }): Promise<Course[]> => {
  const res = await httpClient.get("/course", { params }); 
  return res.data;
};

// 2. Get Detail
const getCourseById = async (id: string): Promise<Course> => {
  const res = await httpClient.get(`/course/${id}`);
  return res.data;
};

// 3. Get My Courses (Teacher)
const getMyCourses = async (): Promise<Course[]> => {
    const res = await httpClient.get("/course/teacher/my-courses");
    return res.data;
};

// 4. Create Course (FormData for Image)
const createCourse = async (formData: FormData): Promise<Course> => {
    const res = await httpClient.post("/course", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// 5. Update Course
const updateCourse = async (id: string, formData: FormData): Promise<Course> => {
    const res = await httpClient.put(`/course/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// 6. Delete Course
const deleteCourse = async (id: string): Promise<void> => {
    await httpClient.delete(`/course/${id}`);
};

// 7. Publish/Unpublish
const togglePublish = async (id: string, isPublished: boolean): Promise<Course> => {
    const res = await httpClient.patch(`/course/${id}/publish`, { isPublished });
    return res.data.course || res.data;
};

const getEnrollment = async (userId: string, courseId: string): Promise<Enrollment | null> => {
    try {
        const res = await httpClient.get(`/enrollments/${userId}/${courseId}`);
        return res.data;
    } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
    }
};

const enrollStudent = async (userId: string, courseId: string): Promise<Enrollment> => {
    const res = await httpClient.post('/enrollments', { userId, courseId });
    return res.data;
};

const completeLesson = async (userId: string, courseId: string, lessonId: string): Promise<Enrollment> => {
    const res = await httpClient.post(`/enrollments/${courseId}/lessons/${lessonId}/complete`, { userId });
    return res.data;
};

const unenrollStudent = async (userId: string, courseId: string): Promise<void> => {
    const res = await httpClient.delete(`/enrollments/${userId}/${courseId}`);
    if (res.status !== 200 && res.status !== 204) {
        throw new Error(`Failed to unenroll student with status: ${res.status}`);
    }
};

const getAllUsersForAdmin = async (params?: { page?: number; limit?: number; search?: string; role?: string; }): Promise<{ users: UserForAdmin[]; pagination: Pagination }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    const url = `/admin/users${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    const res = await httpClient.get(url);
    return { users: res.data.data || [], pagination: res.data.pagination };
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch users");
  }
};

const getAllCoursesForAdmin = async (params?: { page?: number; limit?: number; search?: string; }): Promise<{ courses: CourseForAdmin[]; pagination: Pagination }> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.search) queryParams.append("search", params.search);
        const url = `/admin/courses${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
        const res = await httpClient.get(url);
        return { courses: res.data.data || [], pagination: res.data.pagination };
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
  getUserById,
  getCourses,
  getCourseById,
  getMyCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  togglePublish, 
  getEnrollment,
  enrollStudent,
  completeLesson,
  unenrollStudent,
  getAllUsersForAdmin,
  getAllCoursesForAdmin,
  getStatisticsForAdmin,
  banUserForAdmin,
  unbanUserForAdmin,
  deleteUserForAdmin,
  deleteCourseForAdmin,
};