export enum UserRole {
  Student = 'STUDENT',
  Teacher = 'TEACHER',
  Admin = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBanned?: boolean;
  avatar?: string; // Thêm avatar nếu cần hiển thị
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf';
  contentUrl: string; 
  quiz?: Quiz;
  duration?: number;
  order?: number;
  isPublished?: boolean;
}

// --- CẬP NHẬT COURSE CHO FEATURE 2 ---
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  teacherId: string;
  level?: string;      // Thêm
  category?: string;   // Thêm
  isPublished: boolean; // Thêm
  createdAt?: string;
  updatedAt?: string;
  lessons?: Lesson[];
  teacher?: {          // Thêm thông tin teacher để hiển thị ở Home
    id: string;
    fullName: string;
    avatar?: string;
  };
  _count?: {           // Thêm count để hiển thị số bài học
    lessons: number;
    enrollments: number;
  };
}

export interface Enrollment {
  userId: string;
  courseId: string;
  completedLessons: string[]; 
}

export interface QuizAttempt {
  userId: string;
  quizId: string;
  score: number;
  answers: number[];
}

// ----Admin Interfaces (Giữ nguyên)----
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserForAdmin {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  _count: {
    coursesCreated: number;
    enrollments: number;
  };
}

export interface CourseForAdmin {
  id: string;
  title: string;
  category: string | null;
  level: string | null;
  isPublished: boolean;
  createdAt: string;
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

export interface StatisticsOverview {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalCourses: number;
  totalEnrollments: number;
}

export interface RecentEnrollment {
  id: string;
  enrolledAt: string;
  student: {
    id: string;
    fullName: string | null;
    email: string;
  };
  course: {
    id: string;
    title: string;
  };
}

export interface PopularCourse {
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
}

export interface AdminStatistics {
  overview: StatisticsOverview;
  recentEnrollments: RecentEnrollment[];
  popularCourses: PopularCourse[];
}

//----Views (Cập nhật thêm view tạo/sửa)----
export type View =
  | { page: 'home' }
  | { page: 'login' }
  | { page: 'signup' }
  | { page: 'course'; id: string }
  | { page: 'lesson'; courseId: string; lessonId: string }
  | { page: 'quiz'; courseId: string; lessonId: string; quizId: string }
  | { page: 'student-dashboard' }
  | { page: 'teacher-dashboard' }
  | { page: 'admin-dashboard' }
  | { page: 'create-course' }     // Mới
  | { page: 'edit-course'; id: string }; // Mới