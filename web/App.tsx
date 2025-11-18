import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { View } from './types.ts';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CourseDetailPage from './pages/CourseDetailPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuizPage from './pages/QuizPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const [view, setView] = useState<View>({ page: 'home' });
  const { user } = useAuth();

  const renderContent = () => {
    switch (view.page) {
      case 'home':
        return <HomePage setView={setView} />;
      case 'login':
        return <LoginPage setView={setView} />;
      case 'signup':
        return <SignupPage setView={setView} />;
      case 'course':
        return <CourseDetailPage setView={setView} courseId={view.id} />;
      case 'student-dashboard':
        return <StudentDashboard setView={setView} />;
      case 'teacher-dashboard':
        return <TeacherDashboard setView={setView} />;
      case 'admin-dashboard':
        return <AdminDashboard setView={setView} />;
      case 'quiz':
         return <QuizPage setView={setView} courseId={view.courseId} lessonId={view.lessonId} quizId={view.quizId} />;
      default:
        return <HomePage setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      <Header setView={setView} />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;