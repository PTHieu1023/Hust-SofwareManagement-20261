import React, { useState, useEffect } from 'react';
import { Lesson, View, LessonType } from '../types';
import { api } from '../services/api';
import { PlayIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '../components/icons'; // Giả sử icon đã có
import LessonFormModal from '../components/LessonFormModal'; 

interface ManageLessonsPageProps {
  courseId: string;
  setView: (view: View) => void;
}

const ManageLessonsPage: React.FC<ManageLessonsPageProps> = ({ courseId, setView }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal Control State
  const [showModal, setShowModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // 1. Fetch Data
  const fetchLessons = async () => {
    try {
      setLoading(true);
      // Gọi API lấy lesson teacher (bao gồm draft)
      const data = await api.getLessonsForTeacherByCourse(courseId);
      
      // Sắp xếp theo order
      const sorted = data.sort((a, b) => a.order - b.order);
      setLessons(sorted);

      // Lấy thêm thông tin Course để hiển thị tên
      const courseData = await api.getCourseById(courseId);
      setCourseTitle(courseData.title);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  // 2. Handle Publish Toggle
  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      const updatedLesson = await api.toggleLessonPublish(lesson.id, !lesson.isPublished);
      // Cập nhật State Local
      setLessons(prev => prev.map(l => l.id === lesson.id ? updatedLesson : l));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (lessonId: string) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.deleteLesson(lessonId);
      // Reload lại danh sách sau khi xóa thành công
      fetchLessons();
    } catch (error) {
      alert("Failed to delete lesson");
    }
  };

  // Mở modal Create
  const handleCreate = () => {
    setSelectedLesson(null);
    setShowModal(true);
  };

  // Mở modal Edit
  const handleEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowModal(true);
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading content...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header & Nav */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button 
            onClick={() => setView({ page: 'teacher-dashboard' })}
            className="text-sm text-slate-500 hover:text-indigo-600 mb-2 flex items-center gap-1 transition"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Course Content</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Managing: <span className="font-semibold">{courseTitle}</span></p>
        </div>
        
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-lg font-medium transition flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Add Lesson
        </button>
      </div>

      {/* Lesson List */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        {lessons.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">No lessons created yet.</p>
            <button onClick={handleCreate} className="text-indigo-600 hover:underline font-medium">Create your first lesson</button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-16 text-center">Order</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4 w-32">Type</th>
                <th className="px-6 py-4 w-32">Status</th>
                <th className="px-6 py-4 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition duration-150">
                  <td className="px-6 py-4 text-center text-slate-400 font-mono">#{lesson.order}</td>
                  
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{lesson.title}</div>
                    {lesson.duration && lesson.duration > 0 && (
                      <div className="text-xs text-slate-500 mt-0.5">{lesson.duration} min</div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      lesson.type === LessonType.VIDEO 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                        : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                    }`}>
                      {lesson.type === LessonType.VIDEO ? <PlayIcon className="w-3 h-3"/> : <DocumentTextIcon className="w-3 h-3"/>}
                      {lesson.type}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleTogglePublish(lesson)}
                      className={`group flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        lesson.isPublished 
                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lesson.isPublished ? <CheckCircleIcon className="w-3.5 h-3.5"/> : <XCircleIcon className="w-3.5 h-3.5"/>}
                      {lesson.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <button 
                        onClick={() => handleEdit(lesson)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(lesson.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Render Modal */}
      {showModal && (
        <LessonFormModal 
          isOpen={true}
          courseId={courseId}
          lessonToEdit={selectedLesson}
          onClose={() => setShowModal(false)}
          onSuccess={fetchLessons}
        />
      )}
    </div>
  );
};

export default ManageLessonsPage;