import React, { useState, useEffect } from 'react';
import { Course, View } from '../types';
import { api } from '../services/api';
import CourseForm from '../components/CourseForm';

interface EditCoursePageProps {
  courseId: string;
  setView: (view: View) => void;
}

const EditCoursePage: React.FC<EditCoursePageProps> = ({ courseId, setView }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await api.getCourseById(courseId);
        setCourse(data);
      } catch (error) {
        alert('Could not load course data');
        setView({ page: 'teacher-dashboard' });
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, setView]);

  const handleUpdate = async (formData: FormData) => {
    try {
      setSaving(true);
      await api.updateCourse(courseId, formData);
      alert('Course updated successfully!');
      setView({ page: 'teacher-dashboard' });
    } catch (error) {
      alert('Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!course) return <div className="text-center py-20 text-red-500">Course not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseForm 
        initialData={course}
        isLoading={saving}
        onSubmit={handleUpdate}
        onCancel={() => setView({ page: 'teacher-dashboard' })}
      />
    </div>
  );
};

export default EditCoursePage;