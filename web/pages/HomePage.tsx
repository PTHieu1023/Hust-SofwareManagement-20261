import React, { useState, useEffect } from 'react';
import { Course, View } from '../types.ts';
import { api } from '../services/api.ts';
import CourseCard from '../components/CourseCard';

interface HomePageProps {
  setView: (view: View) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setView }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading courses...</div>;
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Welcome to Learnify</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Explore our catalog of courses and start your learning journey today.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} setView={setView} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;