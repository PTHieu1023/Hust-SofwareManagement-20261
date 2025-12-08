import axios from "axios";
import { User, UserRole, Course, Enrollment } from "../types";

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

const getUserById = async (id: string): Promise<Course> => {
  const res = await client.get(`/user/${id}`);
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

const getEnrollment = async (userId: string, courseId: string): Promise<Enrollment | null> => {
    try {
        const res = await client.get(`/enrollments/${userId}/${courseId}`);
        return res.data;
    } catch (err: any) {
        // Server trả về 404 nếu chưa đăng ký
        if (err.response?.status === 404) {
            return null;
        }
        throw err;
    }
};

const enrollStudent = async (userId: string, courseId: string): Promise<Enrollment> => {
    const res = await client.post('/enrollments', { userId, courseId });
    return res.data;
};

const completeLesson = async (userId: string, courseId: string, lessonId: string): Promise<Enrollment> => {
    const res = await client.post(`/enrollments/${courseId}/lessons/${lessonId}/complete`, { userId });
    return res.data;
};

// HÀM HỦY ĐĂNG KÝ MỚI
const unenrollStudent = async (userId: string, courseId: string): Promise<void> => {
    // Sử dụng phương thức DELETE tới endpoint liên quan đến Enrollment
    const res = await client.delete(`/enrollments/${userId}/${courseId}`);
    
    if (res.status !== 200 && res.status !== 204) {
        throw new Error(`Failed to unenroll student with status: ${res.status}`);
    }
};

export const api = {
  login,
  signup,
  logout,
  getAllUsers,
  getUserById,
  getCourses,
  getCourseById,
  getEnrollment,
  enrollStudent,
  completeLesson,
  unenrollStudent,
};
