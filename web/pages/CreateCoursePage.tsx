import React, { useState } from 'react';
import { View } from '../types';
import { api } from '../services/api';
import CourseForm from '../components/CourseForm';

interface CreateCoursePageProps {
  setView: (view: View) => void;
}

const CreateCoursePage: React.FC<CreateCoursePageProps> = ({ setView }) => {
  const [loading, setLoading] = useState(false);

  const handleCreate = async (formData: FormData) => {
    try {
      setLoading(true);
      await api.createCourse(formData);
      alert('Course created successfully!');
      setView({ page: 'teacher-dashboard' });
    } catch (error) {
      console.error(error);
      alert('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseForm 
        isLoading={loading}
        onSubmit={handleCreate}
        onCancel={() => setView({ page: 'teacher-dashboard' })}
      />
    </div>
  );
};

export default CreateCoursePage;