import React from 'react';
import { Course, View } from '../types.ts';
import { api } from '../services/api.ts';

interface CourseCardProps {
  course: Course;
  setView: (view: View) => void;
  isTeacherView?: boolean; // Nhận prop để biết là Teacher hay Student xem
  onRefresh?: () => void;  // Callback load lại trang sau khi xóa
}

const CourseCard: React.FC<CourseCardProps> = ({ course, setView, isTeacherView, onRefresh }) => {
  
  // Xử lý ảnh 
  const imageUrl = course.thumbnail 
    ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:3000${course.thumbnail}`)
    : 'https://via.placeholder.com/300?text=Course';

  // Xử lý xóa
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      try {
        await api.deleteCourse(course.id);
        if (onRefresh) onRefresh();
      } catch (err) {
        alert('Failed to delete course');
      }
    }
  };

  // Xử lý Publish
  const handleTogglePublish = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
          await api.togglePublish(course.id, !course.isPublished);
          if (onRefresh) onRefresh();
      } catch (err) {
          alert("Failed to update status");
      }
  }

  // Xử lý Edit
  const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setView({ page: 'edit-course', id: course.id });
  }

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => setView({ page: 'course', id: course.id })}
    >
      <div className="relative">
        <img src={imageUrl} alt={course.title} className="w-full h-48 object-cover"/>
        {/* Badge cho Teacher */}
        {isTeacherView && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${course.isPublished ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
            </div>
        )}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{course.title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
            {course.description || "No description provided."}
        </p>
        
        {/* Info row */}
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-4">
             <span>📚 {course._count?.lessons || 0} Lessons</span>
             <span>🎓 {course.level || 'General'}</span>
        </div>

        {/* Nút bấm cho Teacher */}
        {isTeacherView && (
            <div className="flex gap-2 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={handleEdit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition">
                    Edit
                </button>
                <button 
                    onClick={handleTogglePublish} 
                    className={`flex-1 text-white text-xs py-2 rounded transition ${course.isPublished ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 rounded transition">
                    Delete
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;