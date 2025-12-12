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

  // States for Search/Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Gọi API với params search/filter
      const data = await api.getCourses({
          search: searchTerm || undefined,
          level: selectedLevel || undefined,
          category: selectedCategory || undefined
      });
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchCourses();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedLevel, selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Welcome to Learnify</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our catalog of courses and start your learning journey today.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search by title..." 
            className="flex-grow px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select 
            className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="IT">IT & Software</option>
            <option value="Business">Business</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="text-center py-10">Loading courses...</div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} setView={setView} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
           <p className="text-xl">No courses found matching your criteria.</p>
           <button 
             onClick={() => {setSearchTerm(''); setSelectedLevel(''); setSelectedCategory('');}}
             className="mt-4 text-indigo-600 hover:underline"
           >
             Clear Filters
           </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;