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

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!user) return;
      try {
        const allCourses = await api.getCourses();
        setCourses(allCourses.filter(c => c.teacherId === user.id));
      } catch (error) {
        console.error("Failed to fetch teacher courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherCourses();
  }, [user]);

  // Mock create course functionality
  const handleCreateCourse = () => {
      alert("Feature to create course is not implemented in this mock version.");
  }

  if (loading) return <div className="text-center py-10">Loading your courses...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <button 
          onClick={handleCreateCourse}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
        >
          Create New Course
        </button>
      </div>
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} setView={setView} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold">You haven't created any courses yet.</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Start teaching by creating your first course!</p>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;