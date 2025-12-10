// src/components/LessonModal.tsx
import React, { useState, useEffect } from 'react';
import { Lesson, CreateLessonPayload, UpdateLessonPayload, LessonType } from '../types';
import { api } from '../services/api';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;      // Hàm callback để refresh danh sách bên ngoài sau khi thành công
  courseId: string;
  lessonToEdit?: Lesson | null; // Nếu có bài học truyền vào thì là chế độ Sửa (Edit)
}

const LessonModal: React.FC<LessonModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  courseId, 
  lessonToEdit 
}) => {
  // State quản lý form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<LessonType>('VIDEO');
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  
  // State trạng thái
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form hoặc điền dữ liệu cũ khi mở Modal
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (lessonToEdit) {
        // --- CHẾ ĐỘ EDIT: Fill dữ liệu cũ ---
        setTitle(lessonToEdit.title);
        setDescription(lessonToEdit.description || '');
        setType(lessonToEdit.type);
        setDuration(lessonToEdit.duration || 0);
        setFile(null); // Reset file input (người dùng chưa chọn file mới)
      } else {
        // --- CHẾ ĐỘ CREATE: Reset trắng ---
        setTitle('');
        setDescription('');
        setType('VIDEO');
        setDuration(0);
        setFile(null);
      }
    }
  }, [isOpen, lessonToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let contentUrl = lessonToEdit?.contentUrl || '';

      // 1. XỬ LÝ UPLOAD FILE
      // Nếu có file mới được chọn (Bắt buộc khi Tạo mới, Tùy chọn khi Edit)
      if (file) {
        try {
          // Gọi API upload file trước để lấy URL
          contentUrl = await api.uploadFile(file); 
        } catch (err) {
          throw new Error('Upload file thất bại. Kiểm tra lại kết nối hoặc kích thước file.');
        }
      } else if (!lessonToEdit && !contentUrl) {
        // Nếu đang tạo mới mà không chọn file -> Lỗi
        throw new Error('Vui lòng chọn file nội dung (Video/PDF).');
      }

      // 2. GỌI API LƯU BÀI HỌC
      if (lessonToEdit) {
        // --- Logic Update (UC-L06) ---
        const updateData: UpdateLessonPayload = {
          title,
          description,
          type,
          duration,
          // Chỉ gửi contentUrl nếu có upload file mới, nếu không thì undefined (BE sẽ giữ nguyên cũ)
          contentUrl: file ? contentUrl : undefined, 
        };
        await api.updateLesson(lessonToEdit.id, updateData);
      } else {
        // --- Logic Create (UC-L05) ---
        const createData: CreateLessonPayload = {
          courseId,
          title,
          description,
          type,
          contentUrl, // URL vừa upload xong
          duration,
        };
        await api.createLesson(createData);
      }

      // 3. THÀNH CÔNG
      onSuccess(); // Báo cho trang cha load lại danh sách
      onClose();   // Đóng modal
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra khi lưu bài học.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">
            {lessonToEdit ? 'Cập nhật bài học' : 'Thêm bài học mới'}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Nhập tên bài học"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            {/* Type & Duration Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Loại
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as LessonType)}
                  className="w-full p-2 border border-slate-300 rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="VIDEO">Video</option>
                  <option value="PDF">PDF</option>
                  <option value="TEXT">Text</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {lessonToEdit ? 'Thay đổi File (nếu cần)' : 'Upload File nội dung'} <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept={type === 'VIDEO' ? 'video/*' : type === 'PDF' ? 'application/pdf' : '*/*'}
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:text-slate-300 dark:file:bg-slate-600 dark:file:text-white"
              />
              {lessonToEdit && (
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                  Hiện tại: <a href={lessonToEdit.contentUrl} target="_blank" rel="noreferrer" className="text-indigo-500 underline truncate max-w-xs inline-block align-bottom">Link file cũ</a>
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-700 bg-slate-100 rounded hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {lessonToEdit ? 'Lưu thay đổi' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;