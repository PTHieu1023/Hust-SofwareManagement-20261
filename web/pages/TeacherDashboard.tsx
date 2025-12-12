import React, { useState, useEffect } from 'react';
import { Course, View } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

interface TeacherDashboardProps {
  setView: (view: View) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ setView }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTeacherCourses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // GỌI API GET MY COURSES CỦA TEACHER (Feature 2)
      const myCourses = await api.getMyCourses();
      setCourses(myCourses);
    } catch (error) {
      console.error("Failed to fetch teacher courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherCourses();
  }, [user]);

  if (loading) return <div className="text-center py-10">Loading your dashboard...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Courses</h1>
           <p className="text-slate-600 dark:text-slate-400">Manage your content</p>
        </div>
        
        <button 
          onClick={() => setView({ page: 'create-course' })} // Chuyển view sang tạo mới
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
        >
          <span>+</span> Create New Course
        </button>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <CourseCard 
                key={course.id} 
                course={course} 
                setView={setView} 
                isTeacherView={true} // Bật chế độ Teacher
                onRefresh={fetchTeacherCourses} // Reload khi có thay đổi
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">You haven't created any courses yet.</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 mb-6">Start teaching by creating your first course!</p>
          <button 
             onClick={() => setView({ page: 'create-course' })}
             className="text-indigo-600 font-semibold hover:underline"
          >
            Create now &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;