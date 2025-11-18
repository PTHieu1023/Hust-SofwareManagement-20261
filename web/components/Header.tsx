import React from 'react';
import { useAuth } from '../context/AuthContext';
import { View, UserRole } from '../types.ts';
import { AcademicCapIcon } from './icons';

interface HeaderProps {
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ setView }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setView({ page: 'home' });
  };

  const handleDashboardClick = () => {
    if (user?.role === UserRole.Admin) {
      setView({ page: 'admin-dashboard' });
    } else if (user?.role === UserRole.Teacher) {
      setView({ page: 'teacher-dashboard' });
    } else {
      setView({ page: 'student-dashboard' });
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setView({ page: 'home' })}
        >
          <AcademicCapIcon className="h-8 w-8 text-indigo-500" />
          <span className="text-2xl font-bold text-slate-800 dark:text-white">Learnify</span>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={handleDashboardClick}
                className="font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setView({ page: 'login' })}
                className="font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400"
              >
                Login
              </button>
              <button
                onClick={() => setView({ page: 'signup' })}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;