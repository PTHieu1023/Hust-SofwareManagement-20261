import React, { useState, useEffect } from 'react';
import { Lesson, LessonPayload, LessonType } from '../types';
import { api } from '../services/api';

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId: string;
  lessonToEdit?: Lesson | null;
}

const LessonFormModal: React.FC<LessonFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  lessonToEdit,
}) => {
  // State Management
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<LessonType>('VIDEO');
  const [duration, setDuration] = useState<string>('');
  const [contentUrl, setContentUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load data khi Edit
  useEffect(() => {
    if (lessonToEdit) {
      setTitle(lessonToEdit.title);
      setDescription(lessonToEdit.description || '');
      setType(lessonToEdit.type);
      // Backend cần Int, convert sang string để hiện lên input
      setDuration(lessonToEdit.duration ? lessonToEdit.duration.toString() : ''); 
      setContentUrl(lessonToEdit.contentUrl);
      setIsPublished(lessonToEdit.isPublished);
    } else {
      // Reset form khi Create
      setTitle('');
      setDescription('');
      setType('VIDEO');
      setDuration('');
      setContentUrl('');
      setIsPublished(false);
      setSelectedFile(null);
    }
  }, [lessonToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalUrl = contentUrl;

      // 1. Upload File (Nếu có chọn file mới)
      if (selectedFile) {
        // Hàm này trả về URL (ví dụ: "http://localhost:3000/uploads/...")
        finalUrl = await api.uploadFile(selectedFile);
      }

      // Validate URL bắt buộc nếu không phải TEXT
      if (!finalUrl && type !== 'TEXT') {
        alert("Please upload a file or enter a content URL.");
        setIsLoading(false);
        return;
      }

      // 2. Chuẩn bị dữ liệu chung
      // Backend yêu cầu duration là INT, ta dùng parseInt để chắc chắn không bị float
      const safeDuration = duration ? parseInt(duration) : 0; 

      // Object cơ bản (dùng cho cả Create và Update)
      const basePayload = {
        title,
        description,
        type,
        contentUrl: finalUrl,
        duration: safeDuration,
        isPublished: isPublished, // Đảm bảo là boolean
      };

      console.log("Submitting Payload:", basePayload);

      if (lessonToEdit) {
        // === LOGIC UPDATE ===
        // Backend router.put('/:id') CHỈ validate các field trên.
        // TUYỆT ĐỐI KHÔNG GỬI courseId VÀO ĐÂY để tránh lỗi 400
        await api.updateLesson(lessonToEdit.id, basePayload);
      } else {
        // === LOGIC CREATE ===
        // Backend create cần biết lesson thuộc course nào
        await api.createLesson({ ...basePayload, courseId });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving lesson:", error);
      // Hiển thị lỗi chi tiết từ backend trả về (nếu có)
      const message = error.response?.data?.message || error.message || "Failed to save lesson";
      alert(`Error: ${Array.isArray(message) ? message.join(', ') : message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">
          {lessonToEdit ? 'Edit Lesson' : 'Add New Lesson'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Title *</label>
            <input 
              required
              type="text" 
              className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>

          <div className="flex gap-4">
            {/* Type */}
            <div className="flex-1">
               <label className="block text-sm font-medium mb-1 dark:text-slate-300">Type</label>
               <select 
                 className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                 value={type} 
                 onChange={(e) => setType(e.target.value as LessonType)}
               >
                 <option value="VIDEO">Video</option>
                 <option value="PDF">PDF</option>
                 <option value="TEXT">Text</option>
               </select>
            </div>
            
            {/* Duration */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Duration (min)</label>
              <input 
                type="number" 
                min="0"
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={duration} 
                onChange={e => setDuration(e.target.value)} 
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Description</label>
            <textarea 
              rows={3}
              className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>

          {/* File Upload / Content URL */}
          <div className="border border-dashed border-slate-300 dark:border-slate-600 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
             <label className="block text-sm font-medium mb-2 dark:text-slate-300">
               {type === 'TEXT' ? 'Content (Text/HTML)' : 'Upload File Content'}
             </label>
             
             {type !== 'TEXT' && (
               <input 
                 type="file" 
                 onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                 className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
               />
             )}
             
             {/* Show current URL/Text input fallback */}
             <div className="mt-2">
                <input 
                    type="text"
                    placeholder={type === 'TEXT' ? "Enter text content" : "Or enter direct URL..."}
                    className="w-full p-2 text-sm border rounded dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                    value={contentUrl}
                    onChange={e => setContentUrl(e.target.value)}
                    // Nếu đang upload file thì disable ô này để tránh nhầm lẫn
                    disabled={!!selectedFile && type !== 'TEXT'}
                />
             </div>
          </div>

          {/* Published Checkbox */}
          <div className="flex items-center gap-2 pt-2">
             <input 
               id="isPublished"
               type="checkbox" 
               className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
               checked={isPublished} 
               onChange={e => setIsPublished(e.target.checked)} 
             />
             <label htmlFor="isPublished" className="text-sm font-medium dark:text-slate-300 cursor-pointer select-none">
                Publish immediately?
             </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700 mt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isLoading ? 'Saving...' : (lessonToEdit ? 'Update Lesson' : 'Create Lesson')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LessonFormModal;