import React, { useState, useEffect } from 'react';
import { Course, User, View, UserRole } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  setView: (view: View) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalStudents: 0, totalTeachers: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersData = await api.getAllUsers();
      const coursesData = await api.getCourses();
      setUsers(usersData);
      setCourses(coursesData);
      setStats({
        totalUsers: usersData.length,
        totalCourses: coursesData.length,
        totalStudents: usersData.filter(u => u.role === UserRole.Student).length,
        totalTeachers: usersData.filter(u => u.role === UserRole.Teacher).length,
      });
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== UserRole.Admin) {
      setView({ page: 'home' });
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  const handleToggleBan = async (userId: string) => {
      await api.toggleUserBan(userId);
      await fetchData();
  };
  
  const handleDeleteCourse = async (courseId: string) => {
    if(window.confirm("Are you sure you want to delete this course?")){
        await api.deleteCourse(courseId);
        await fetchData();
    }
  };

  if (loading) return <div className="text-center py-10">Loading admin dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"><h3 className="text-slate-500 dark:text-slate-400">Total Users</h3><p className="text-3xl font-bold">{stats.totalUsers}</p></div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"><h3 className="text-slate-500 dark:text-slate-400">Total Courses</h3><p className="text-3xl font-bold">{stats.totalCourses}</p></div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"><h3 className="text-slate-500 dark:text-slate-400">Total Students</h3><p className="text-3xl font-bold">{stats.totalStudents}</p></div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"><h3 className="text-slate-500 dark:text-slate-400">Total Teachers</h3><p className="text-3xl font-bold">{stats.totalTeachers}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b dark:border-slate-700 last:border-b-0">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3">
                      <button onClick={() => handleToggleBan(u.id)} className={`px-3 py-1 text-sm rounded ${u.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}>
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Manage Courses</h2>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="p-3">Title</th><th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id} className="border-b dark:border-slate-700 last:border-b-0">
                    <td className="p-3">{c.title}</td>
                    <td className="p-3">
                      <button onClick={() => handleDeleteCourse(c.id)} className="px-3 py-1 text-sm rounded bg-red-500 hover:bg-red-600 text-white">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;