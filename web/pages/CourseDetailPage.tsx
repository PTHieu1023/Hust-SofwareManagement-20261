import React, { useState, useEffect, useMemo } from 'react';
import { Course, Enrollment, Lesson, User, UserRole, View } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext';
import { BookOpenIcon, PlayIcon, DocumentTextIcon, CheckCircleIcon } from '../components/icons';
import ProgressBar from '../components/ProgressBar';

interface CourseDetailPageProps {
  courseId: string;
  setView: (view: View) => void;
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId, setView }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [teacher, setTeacher] = useState<User | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [unenrollLoading, setUnenrollLoading] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const courseData = await api.getCourseById(courseId);
        setCourse(courseData);
        if(courseData) {
          const teacherData = await api.getUserById(courseData.teacherId);
          setTeacher(teacherData);
        }
        if (user && user.role === UserRole.Student) {
          const enrollmentData = await api.getEnrollment(user.id, courseId);
          setEnrollment(enrollmentData);
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user]);

  const progressPercentage = useMemo(() => {
    if (!enrollment || !course || course.lessons.length === 0) return 0;
    return (enrollment.completedLessons.length / course.lessons.length) * 100;
  }, [enrollment, course]);

  const handleEnroll = async () => {
    if (user && course) {
      try {
        const newEnrollment = await api.enrollStudent(user.id, course.id);
        setEnrollment(newEnrollment);
      } catch (error) {
        console.error("Failed to enroll:", error);
      }
    }
  };
  
  const handleUnenroll = async () => {
        if (!user || !course) return;

        setUnenrollLoading(true);
        try {
            // Gọi API hủy đăng ký
            await api.unenrollStudent(user.id, course.id);
            
            // Cập nhật state sau khi hủy thành công
            setEnrollment(null); // Không còn đăng ký
            setShowUnenrollModal(false); // Đóng modal

            alert(`Successfully unenrolled from the course "${course.title}".`);
            // Sau khi hủy, có thể chuyển hướng hoặc làm mới trang
        } catch (error) {
            console.error("Failed to unenroll:", error);
            alert("Error: Unable to unenroll. Please try again.");
        } finally {
            setUnenrollLoading(false);
        }
    };

  const handleLessonClick = (lesson: Lesson) => {
    // Mock lesson completion on click
    if(user && user.role === UserRole.Student && enrollment && !enrollment.completedLessons.includes(lesson.id)) {
        api.completeLesson(user.id, courseId, lesson.id).then(setEnrollment);
    }
    // For now, we'll just log it. A real app would navigate to a lesson view page.
    console.log(`Viewing lesson: ${lesson.title}`);
  };

  if (loading) return <div className="text-center py-10">Loading course details...</div>;
  if (!course) return <div className="text-center py-10 text-red-500">Course not found.</div>;

  const isEnrolled = !!enrollment;
  const isTeacher = user?.id === course.teacherId;
  const isAdmin = user?.role === UserRole.Admin;

  return (
        <div className="max-w-6xl mx-auto">
            {/* ... Modal Hủy Đăng Ký ... */}
            {showUnenrollModal && course && (
                <UnenrollModal
                    courseTitle={course.title}
                    onClose={() => setShowUnenrollModal(false)}
                    onConfirm={handleUnenroll}
                    isLoading={unenrollLoading}
                />
            )}

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/3">
                        <img className="h-full w-full object-cover" src={course.thumbnail} alt={course.title} />
                    </div>
                    <div className="p-8 md:w-2/3">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">Created by {teacher?.name || 'Unknown'}</p>
                        <p className="mt-4 text-slate-700 dark:text-slate-300">{course.description}</p>
                        
                        {isAuthenticated && user?.role === UserRole.Student && (
                            <div className="mt-6 flex items-center space-x-4">
                                {isEnrolled ? (
                                    <>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold mb-2">Your Progress</h3>
                                            <ProgressBar value={progressPercentage} />
                                        </div>
                                        {/* Nút Hủy Đăng Ký */}
                                        <button 
                                            onClick={() => setShowUnenrollModal(true)} 
                                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors unenroll-button"
                                            disabled={unenrollLoading}
                                        >
                                            Unenroll
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={handleEnroll} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                                        Enroll Now
                                    </button>
                                )}
                            </div>
                        )}
                        {/* ... Edit Course Button ... */}
                        {(isTeacher || isAdmin) && (
                            <div className="mt-6">
                                <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                                    Edit Course
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Course Content</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6">
          <ul className="space-y-4">
            {course.lessons.map((lesson) => {
              const isCompleted = enrollment?.completedLessons.includes(lesson.id) ?? false;
              const isLocked = user?.role === UserRole.Student && !isEnrolled;
              return (
                <li key={lesson.id} className={`p-4 rounded-lg flex items-center justify-between transition-colors ${isLocked ? 'bg-slate-100 dark:bg-slate-700 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <div className="flex items-center">
                    {lesson.type === 'video' ? <PlayIcon className="h-6 w-6 text-indigo-500 mr-4" /> : <DocumentTextIcon className="h-6 w-6 text-indigo-500 mr-4" />}
                    <span className={`font-medium ${isLocked ? 'text-slate-400 dark:text-slate-500' : ''}`}>{lesson.title}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {isCompleted && <CheckCircleIcon className="h-6 w-6 text-green-500" />}
                    
                    {lesson.quiz && isEnrolled && (
                       <button
                         onClick={() => setView({ page: 'quiz', courseId: course.id, lessonId: lesson.id, quizId: lesson.quiz.id })}
                         className="px-3 py-1 text-sm bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                       >
                         Take Quiz
                       </button>
                    )}
                     {!isLocked && (
                        <button
                          onClick={() => handleLessonClick(lesson)}
                          className="px-3 py-1 text-sm bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                        >
                          View
                        </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

interface UnenrollModalProps {
    courseTitle: string;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

const UnenrollModal: React.FC<UnenrollModalProps> = ({ courseTitle, onClose, onConfirm, isLoading }) => (
    <div className="modal" style={{ display: 'block' }}>
        <div className="modal-content bg-slate-800 p-8 rounded-lg shadow-2xl">
            <span className="close-button text-white float-right text-3xl cursor-pointer" onClick={onClose}>&times;</span>
            <h2 className="text-2xl font-bold text-white mb-4">Confirm Unenrollment</h2>
            <p className="text-slate-300">Are you sure you want to unenroll from the course {courseTitle}?</p>
            <p className="text-red-400 mt-2 font-semibold">Your learning progress will be lost.</p>
            <div className="modal-actions mt-6 text-right">
                <button
                    className="modal-cancel-button px-4 py-2 mr-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    className="modal-confirm-button px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
);

export default CourseDetailPage;