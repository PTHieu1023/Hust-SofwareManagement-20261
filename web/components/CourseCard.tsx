import React from 'react';
import { Course, View } from '../types.ts';

interface CourseCardProps {
  course: Course;
  setView: (view: View) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, setView }) => {
  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
      onClick={() => setView({ page: 'course', id: course.id })}
    >
      <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover"/>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{course.title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">{course.description}</p>
      </div>
    </div>
  );
};

export default CourseCard;