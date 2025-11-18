import { User, UserRole, Course, Lesson, Quiz, Question, Enrollment, QuizAttempt } from '../types.ts';

export interface Credentials {
  email: string;
  password: string;
}

// --- MOCK DATABASE (using localStorage) ---

const DB_KEYS = {
  users: 'learnify_users',
  courses: 'learnify_courses',
  enrollments: 'learnify_enrollments',
  attempts: 'learnify_quiz_attempts',
};

const getData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setData = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// --- INITIAL MOCK DATA ---

const initialData = () => {
  const initialUsers: User[] = [
    { id: 'u1', name: 'Alice Student', email: 'alice@example.com', role: UserRole.Student },
    { id: 'u2', name: 'Bob Teacher', email: 'bob@example.com', role: UserRole.Teacher },
    { id: 'u3', name: 'Charlie Admin', email: 'charlie@example.com', role: UserRole.Admin },
  ];
  // Note: In a real app, passwords would be hashed and not stored.
  // We store them here for mock authentication purposes.
  const initialPasswords = {
    'alice@example.com': 'password123',
    'bob@example.com': 'password123',
    'charlie@example.com': 'password123',
  };

  const quiz1Questions: Question[] = [
    { id: 'q1', text: 'What is 2 + 2?', options: ['3', '4', '5'], correctAnswerIndex: 1 },
    { id: 'q2', text: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris'], correctAnswerIndex: 2 },
  ];

  const quiz2Questions: Question[] = [
      { id: 'q3', text: 'Which of these is a JavaScript framework?', options: ['React', 'Laravel', 'Django'], correctAnswerIndex: 0 },
      { id: 'q4', text: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Creative Style Sheets', 'Computer Style Sheets'], correctAnswerIndex: 0 },
  ];

  const initialCourses: Course[] = [
    {
      id: 'c1',
      title: 'Introduction to Mathematics',
      description: 'Learn the basics of mathematics, from arithmetic to basic algebra. This course is perfect for beginners.',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800',
      teacherId: 'u2',
      lessons: [
        { id: 'l1-1', title: 'Chapter 1: Addition', type: 'video', content: 'URL' },
        { id: 'l1-2', title: 'Chapter 2: Subtraction', type: 'pdf', content: 'URL' },
        { id: 'l1-3', title: 'Final Quiz', type: 'video', content: 'URL', quiz: { id: 'qz1', lessonId: 'l1-3', title: 'Math Basics Quiz', questions: quiz1Questions }},
      ],
    },
    {
      id: 'c2',
      title: 'Web Development Fundamentals',
      description: 'An introduction to the world of web development. Covers HTML, CSS, and JavaScript from the ground up.',
      thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800',
      teacherId: 'u2',
      lessons: [
        { id: 'l2-1', title: 'HTML Basics', type: 'video', content: 'URL' },
        { id: 'l2-2', title: 'CSS Styling', type: 'video', content: 'URL' },
        { id: 'l2-3', title: 'JavaScript Introduction', type: 'pdf', content: 'URL' },
        { id: 'l2-4', title: 'Web Dev Quiz', type: 'video', content: 'URL', quiz: { id: 'qz2', lessonId: 'l2-4', title: 'Web Dev Basics Quiz', questions: quiz2Questions } },
      ],
    },
    {
        id: 'c3',
        title: 'The World of Art History',
        description: 'Explore the major art movements throughout history, from Renaissance to Modernism.',
        thumbnail: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=800',
        teacherId: 'u2',
        lessons: [
          { id: 'l3-1', title: 'The Renaissance', type: 'pdf', content: 'URL' },
          { id: 'l3-2', title: 'Impressionism', type: 'video', content: 'URL' },
          { id: 'l3-3', title: 'Modern Art', type: 'pdf', content: 'URL' },
        ],
      },
  ];

  setData(DB_KEYS.users, { users: initialUsers, passwords: initialPasswords });
  setData(DB_KEYS.courses, initialCourses);
  setData(DB_KEYS.enrollments, []);
  setData(DB_KEYS.attempts, []);
};

// Initialize DB if it's empty
if (!localStorage.getItem(DB_KEYS.users)) {
  initialData();
}

// --- API FUNCTIONS ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const apiFunctions = {
  // --- AUTH ---
  login: async ({ email, password }: Credentials): Promise<User> => {
    await delay(500);
    const { users, passwords } = getData(DB_KEYS.users, { users: [], passwords: {} });
    const user = users.find((u: User) => u.email === email);
    if (!user) throw new Error('User not found.');
    if (passwords[email] !== password) throw new Error('Invalid password.');
    if (user.isBanned) throw new Error('This account has been banned.');
    return user;
  },

  signup: async (userData: { name: string; email: string; password: string, role: UserRole }): Promise<User> => {
    await delay(500);
    const { users, passwords } = getData(DB_KEYS.users, { users: [], passwords: {} });
    if (users.some((u: User) => u.email === userData.email)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };
    const newUsers = [...users, newUser];
    const newPasswords = { ...passwords, [userData.email]: userData.password };
    setData(DB_KEYS.users, { users: newUsers, passwords: newPasswords });
    return newUser;
  },

  logout: () => {
    // In a real app, this would invalidate a token on the server.
    // For this mock API, no action is needed as state is managed client-side.
  },

  // --- USERS ---
  getAllUsers: async (): Promise<User[]> => {
    await delay(300);
    return getData(DB_KEYS.users, { users: [] }).users;
  },

  getUserById: async (userId: string): Promise<User | null> => {
    await delay(100);
    const { users } = getData(DB_KEYS.users, { users: [] });
    return users.find((u: User) => u.id === userId) || null;
  },
  
  toggleUserBan: async (userId: string): Promise<User> => {
    await delay(300);
    const { users, passwords } = getData(DB_KEYS.users, { users: [], passwords: {} });
    const userIndex = users.findIndex((u: User) => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    users[userIndex].isBanned = !users[userIndex].isBanned;
    setData(DB_KEYS.users, { users, passwords });
    return users[userIndex];
  },

  // --- COURSES ---
  getCourses: async (): Promise<Course[]> => {
    await delay(500);
    return getData(DB_KEYS.courses, []);
  },

  getCourseById: async (courseId: string): Promise<Course | null> => {
    await delay(300);
    const courses: Course[] = getData(DB_KEYS.courses, []);
    return courses.find(c => c.id === courseId) || null;
  },
  
  deleteCourse: async(courseId: string): Promise<void> => {
    await delay(500);
    let courses: Course[] = getData(DB_KEYS.courses, []);
    courses = courses.filter(c => c.id !== courseId);
    setData(DB_KEYS.courses, courses);
  },

  // --- ENROLLMENTS & PROGRESS ---
  getEnrollment: async (userId: string, courseId: string): Promise<Enrollment | null> => {
    await delay(100);
    const enrollments: Enrollment[] = getData(DB_KEYS.enrollments, []);
    return enrollments.find(e => e.userId === userId && e.courseId === courseId) || null;
  },

  enrollStudent: async (userId: string, courseId: string): Promise<Enrollment> => {
    await delay(400);
    const enrollments: Enrollment[] = getData(DB_KEYS.enrollments, []);
    if (enrollments.some(e => e.userId === userId && e.courseId === courseId)) {
      throw new Error("Already enrolled.");
    }
    const newEnrollment: Enrollment = { userId, courseId, completedLessons: [] };
    setData(DB_KEYS.enrollments, [...enrollments, newEnrollment]);
    return newEnrollment;
  },
  
  completeLesson: async (userId: string, courseId: string, lessonId: string): Promise<Enrollment> => {
      await delay(200);
      const enrollments: Enrollment[] = getData(DB_KEYS.enrollments, []);
      const enrollmentIndex = enrollments.findIndex(e => e.userId === userId && e.courseId === courseId);
      if (enrollmentIndex === -1) throw new Error("Not enrolled in this course.");
      
      const enrollment = enrollments[enrollmentIndex];
      if (!enrollment.completedLessons.includes(lessonId)) {
          enrollment.completedLessons.push(lessonId);
      }
      
      setData(DB_KEYS.enrollments, enrollments);
      return enrollment;
  },
  
  getEnrolledCourses: async (userId: string): Promise<{ course: Course; enrollment: Enrollment }[]> => {
    await delay(500);
    const allCourses: Course[] = getData(DB_KEYS.courses, []);
    const allEnrollments: Enrollment[] = getData(DB_KEYS.enrollments, []);
    const userEnrollments = allEnrollments.filter(e => e.userId === userId);

    return userEnrollments.map(enrollment => {
        const course = allCourses.find(c => c.id === enrollment.courseId);
        return { course, enrollment };
    }).filter(item => item.course); // Filter out cases where course might be deleted
  },

  // --- QUIZZES ---
  getQuizById: async (quizId: string): Promise<Quiz | null> => {
    await delay(200);
    const courses: Course[] = getData(DB_KEYS.courses, []);
    for (const course of courses) {
      for (const lesson of course.lessons) {
        if (lesson.quiz && lesson.quiz.id === quizId) {
          return lesson.quiz;
        }
      }
    }
    return null;
  },
  
  submitQuiz: async (userId: string, quizId: string, score: number, answers: number[]): Promise<QuizAttempt> => {
    await delay(400);
    const attempts: QuizAttempt[] = getData(DB_KEYS.attempts, []);
    const newAttempt: QuizAttempt = { userId, quizId, score, answers };
    // In a real app, you might update an existing attempt or keep a history.
    // For simplicity, we just add a new one.
    setData(DB_KEYS.attempts, [...attempts, newAttempt]);
    return newAttempt;
  }
};

export const api = apiFunctions;