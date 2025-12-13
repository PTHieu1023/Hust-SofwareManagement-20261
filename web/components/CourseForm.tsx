import React, { useState } from 'react';
import { Course } from '../types';

interface CourseFormProps {
  initialData?: Course;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [level, setLevel] = useState(initialData?.level || 'Beginner');
  const [category, setCategory] = useState(initialData?.category || '');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  
  // Xử lý URL ảnh preview
  const getInitialPreview = () => {
    if (initialData?.thumbnail) {
        return initialData.thumbnail.startsWith('http') 
          ? initialData.thumbnail 
          : `http://localhost:3000${initialData.thumbnail}`;
    }
    return null;
  };
  const [previewUrl, setPreviewUrl] = useState<string | null>(getInitialPreview());

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('level', level);
    formData.append('category', category);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        {initialData ? 'Edit Course' : 'Create New Course'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input 
            type="text" required
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Complete React Guide"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea 
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="What will students learn?"
          />
        </div>

        {/* Level & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Level</label>
             <select 
               className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
               value={level} onChange={e => setLevel(e.target.value)}
             >
               <option value="Beginner">Beginner</option>
               <option value="Intermediate">Intermediate</option>
               <option value="Advanced">Advanced</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
             <input 
               type="text"
               className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
               value={category} onChange={e => setCategory(e.target.value)}
               placeholder="e.g. IT, Business"
             />
           </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Course Thumbnail</label>
          <div className="flex items-center space-x-4">
             {previewUrl && (
               <img src={previewUrl} alt="Preview" className="h-24 w-40 object-cover rounded-lg border border-slate-200" />
             )}
             <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition">
               <span>Choose File</span>
               <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
             </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
           <button 
             type="button" onClick={onCancel}
             className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 font-medium transition"
           >
             Cancel
           </button>
           <button 
             type="submit" disabled={isLoading}
             className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
           >
             {isLoading ? 'Saving...' : 'Save Course'}
           </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;