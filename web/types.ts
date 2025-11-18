
export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
  Admin = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBanned?: boolean;
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
  content: string; // URL for video/pdf or markdown content
  quiz?: Quiz;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  teacherId: string;
  lessons: Lesson[];
}

export interface Enrollment {
  userId: string;
  courseId: string;
  completedLessons: string[]; // array of lesson ids
}

export interface QuizAttempt {
  userId: string;
  quizId: string;
  score: number;
  answers: number[];
}

export type View = 
  | { page: 'home' }
  | { page: 'login' }
  | { page: 'signup' }
  | { page: 'course'; id: string }
  | { page: 'lesson'; courseId: string; lessonId: string }
  | { page: 'quiz'; courseId: string; lessonId: string; quizId: string }
  | { page: 'student-dashboard' }
  | { page: 'teacher-dashboard' }
  | { page: 'admin-dashboard' };
