import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { View, UserRole } from '../types.ts';

interface SignupPageProps {
  setView: (view: View) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ setView }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email is required.');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Valid email is required.');
      return;
    }
  
    if (!password) {
      setError('Password is required.');
      return;
    }
  
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
  
    if (!name || name.length < 3) {
      setError('Full name must be at least 3 characters long.');
      return;
    }
  
    if (![UserRole.Student, UserRole.Teacher].includes(role)) {
      setError('Role must be Student or Teacher.');
      return;
    }
  
    try {
      const user = await signup({ name, email, password, role });
      setSuccess('Create account successfully! Redirecting to login...');
      
      // Delay and jump to login page
      setTimeout(() => setView({ page: 'login' }), 1500);
    } catch (err: any) {
      if (err.message != "Cannot read properties of undefined (reading 'role')") {
      setError(err.message || 'An unknown error occurred.');
    }
    }
  };
  
  

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white">Create an Account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div>
            <label htmlFor="name"  className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Full Name</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600"/>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Email address</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600"/>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">I am a...</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="radio" name="role" value={UserRole.Student} checked={role === UserRole.Student} onChange={() => setRole(UserRole.Student)} className="form-radio text-indigo-600"/>
                <span className="ml-2 text-slate-700 dark:text-slate-300">Student</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="role" value={UserRole.Teacher} checked={role === UserRole.Teacher} onChange={() => setRole(UserRole.Teacher)} className="form-radio text-indigo-600"/>
                <span className="ml-2 text-slate-700 dark:text-slate-300">Teacher</span>
              </label>
            </div>
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign Up
            </button>
          </div>
        </form>
         <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <button onClick={() => setView({ page: 'login' })} className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;