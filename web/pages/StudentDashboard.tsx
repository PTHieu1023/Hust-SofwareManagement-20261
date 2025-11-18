import React, { useState, useEffect } from 'react';
import { Course, Enrollment, View } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import ProgressBar from '../components/ProgressBar';

interface StudentDashboardProps {
  setView: (view: View) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ setView }) => {
  const [enrolledCourses, setEnrolledCourses] = useState<{ course: Course; enrollment: Enrollment }[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return;
      try {
        const data = await api.getEnrolledCourses(user.id);
        setEnrolledCourses(data);
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledCourses();
  }, [user]);

  if (loading) return <div className="text-center py-10">Loading your courses...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>
      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map(({ course, enrollment }) => {
            const progress = (enrollment.completedLessons.length / course.lessons.length) * 100;
            return (
              <div key={course.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div 
                  className="cursor-pointer"
                  onClick={() => setView({ page: 'course', id: course.id })}
                >
                  <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover"/>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{course.title}</h3>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <ProgressBar value={progress} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold">You are not enrolled in any courses yet.</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Explore our courses and start learning!</p>
          <button 
            onClick={() => setView({ page: 'home' })}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;