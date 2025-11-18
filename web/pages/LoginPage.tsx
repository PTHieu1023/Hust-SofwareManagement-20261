import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { View, UserRole } from '../types.ts';

interface LoginPageProps {
  setView: (view: View) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login({ email, password });
      if (user.role === UserRole.Admin) {
        setView({ page: 'admin-dashboard' });
      } else if (user.role === UserRole.Teacher) {
        setView({ page: 'teacher-dashboard' });
      } else {
        setView({ page: 'student-dashboard' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white">Login to Your Account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <button onClick={() => setView({ page: 'signup' })} className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;