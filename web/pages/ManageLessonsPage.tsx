// src/pages/ManageLessonsPage.tsx
import React, { useEffect, useState } from 'react';
import { Lesson, View } from '../types';
import { api } from '../services/api';
import { PlayIcon, DocumentTextIcon, CheckCircleIcon } from '../components/icons'; // Dùng icon có sẵn
import LessonModal from '../components/LessonModal';

interface ManageLessonsPageProps {
  courseId: string;
  setView: (view: View) => void;
}

const ManageLessonsPage: React.FC<ManageLessonsPageProps> = ({ courseId, setView }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState(''); // Để hiển thị tên khóa học cho đẹp
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // 1. Hàm load dữ liệu (UC-L04)
  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy danh sách bài học
      const data = await api.getLessonsByCourse(courseId);
      // Sắp xếp theo order tăng dần
      const sorted = data.sort((a, b) => a.order - b.order);
      setLessons(sorted);

      // Lấy thêm thông tin course để hiện tên (nếu muốn)
      const course = await api.getCourseById(courseId);
      setCourseTitle(course.title);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // 2. Xử lý Publish/Unpublish (UC-L07)
  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      // Gọi API đảo ngược trạng thái hiện tại
      const updatedLesson = await api.toggleLessonPublish(lesson.id, !lesson.isPublished);
      
      // Cập nhật lại UI ngay lập tức
      setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, isPublished: updatedLesson.isPublished } : l));
    } catch (error) {
      alert("Lỗi: Không thể thay đổi trạng thái Publish.");
    }
  };

  // 3. Xử lý Xóa (UC-L09)
  const handleDelete = async (id: string) => {
    if (!window.confirm("Cảnh báo: Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      await api.deleteLesson(id);
      // Xóa khỏi danh sách trên UI
      setLessons(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      alert("Lỗi: Xóa bài học thất bại.");
    }
  };

  // 4. Mở Modal Thêm mới (UC-L05)
  const handleCreateClick = () => {
    setSelectedLesson(null); // Reset để Modal biết là đang tạo mới
    setIsModalOpen(true);
  };

  // 5. Mở Modal Sửa (UC-L06)
  const handleEditClick = (lesson: Lesson) => {
    setSelectedLesson(lesson); // Truyền bài học cần sửa vào
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button 
            onClick={() => setView({ page: 'teacher-dashboard' })}
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center mb-2"
          >
            ← Quay lại Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Quản lý nội dung: {courseTitle}
          </h1>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-indigo-700 transition flex items-center"
        >
          <span className="text-xl mr-2">+</span> Thêm bài học mới
        </button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="text-center py-10 dark:text-white">Đang tải dữ liệu...</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          {lessons.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <p className="text-lg">Khóa học này chưa có bài học nào.</p>
              <button onClick={handleCreateClick} className="text-indigo-600 underline mt-2">
                Tạo bài học đầu tiên ngay
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {lessons.map((lesson) => (
                <li key={lesson.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Info */}
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4 mt-1">
                        {/* Icon based on type */}
                        {lesson.type === 'VIDEO' ? (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <PlayIcon className="h-6 w-6" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <DocumentTextIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded dark:bg-slate-600 dark:text-slate-300">
                            #{lesson.order}
                          </span>
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white line-clamp-1">
                            {lesson.title}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {lesson.description || 'Không có mô tả'}
                        </p>
                        <div className="text-xs text-slate-400 mt-1">
                           {lesson.duration ? `${lesson.duration} phút` : 'Tài liệu'} • {lesson.type}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {/* Publish Toggle */}
                      <button
                        onClick={() => handleTogglePublish(lesson)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                          lesson.isPublished
                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                        }`}
                        title={lesson.isPublished ? 'Click để ẩn bài học' : 'Click để công khai bài học'}
                      >
                         {lesson.isPublished ? (
                           <><CheckCircleIcon className="h-4 w-4" /> Published</>
                         ) : (
                           <>Draft</>
                         )}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditClick(lesson)}
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/50 transition"
                      >
                        Sửa
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50 transition"
                      >
                        Xóa
                      </button>
                    </div>

                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal Create/Edit */}
      <LessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData} // Load lại danh sách sau khi thêm/sửa xong
        courseId={courseId}
        lessonToEdit={selectedLesson}
      />
    </div>
  );
};

export default ManageLessonsPage;