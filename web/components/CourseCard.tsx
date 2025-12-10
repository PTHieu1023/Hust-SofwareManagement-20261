// src/components/CourseCard.tsx
import React from 'react';
import { Course, View, UserRole } from '../types.ts'; // Thêm UserRole
import { useAuth } from '../context/AuthContext';    // Thêm hook useAuth

interface CourseCardProps {
  course: Course;
  setView: (view: View) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, setView }) => {
  const { user } = useAuth(); 

  const isOwner = user?.role === UserRole.Teacher && user?.id === course.teacherId;

  const handleCardClick = () => {
    setView({ page: 'course', id: course.id });
  };

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full"
    >
      
      <div 
        className="cursor-pointer relative"
        onClick={handleCardClick}
      >
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full h-48 object-cover"
        />
        
        {/* MỚI: Hiển thị nhãn trạng thái cho Teacher dễ quản lý */}
        {isOwner && (
          <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded ${
            course.isPublished ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
          }`}>
            {course.isPublished ? 'Published' : 'Draft'}
          </span>
        )}
      </div>

      {/* 2. Phần Nội dung */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 
          className="text-xl font-bold text-slate-800 dark:text-white mb-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
          onClick={handleCardClick}
        >
          {course.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-1">
          {course.description}
        </p>
        
        {/* MỚI: Render có điều kiện dựa trên quyền sở hữu */}
        {isOwner ? (
          <button
            onClick={(e) => {
              e.stopPropagation(); // QUAN TRỌNG: Ngăn không cho click lan ra ngoài div cha
              setView({ page: 'manage-lessons', courseId: course.id }); // Chuyển sang trang Quản lý
            }}
            className="w-full mt-auto py-2 bg-indigo-100 text-indigo-700 font-semibold rounded hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 transition-colors flex justify-center items-center"
          >
            {/* Icon bánh răng settings */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Quản lý bài học
          </button>
        ) : (
          // Nếu là Student hoặc người khác: Hiện nút "Xem ngay" hoặc ẩn đi
          <button
             onClick={handleCardClick}
             className="w-full mt-auto py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition-colors"
          >
            Xem chi tiết
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;