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
  
  // Modal State
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [unenrollLoading, setUnenrollLoading] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // 1. Lấy thông tin khóa học (Backend đã include teacher và lessons)
        const courseData = await api.getCourseById(courseId);
        setCourse(courseData);

        // 2. CourseData trả về teacher object bên trong -> set
        if(courseData.teacher) {

        } else if (courseData.teacherId) {
             // Fallback: Backend chưa include teacher -> gọi API rời
             const teacherData = await api.getUserById(courseData.teacherId);
             setTeacher(teacherData);
        }

        // 3. Nếu là Student, kiểm tra enrollment
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
  }, [courseId, user]);

  // Tính toán phần trăm tiến độ
  const progressPercentage = useMemo(() => {
    if (!enrollment || !course || !course.lessons || course.lessons.length === 0) return 0;
    // Đếm số lesson đã hoàn thành có nằm trong danh sách lesson hiện tại không
    const validCompleted = enrollment.completedLessons.filter(id => 
        course.lessons!.some(l => l.id === id)
    );
    return (validCompleted.length / course.lessons.length) * 100;
  }, [enrollment, course]);

  const handleEnroll = async () => {
    if (!user) {
        setView({ page: 'login' });
        return;
    }
    if (course) {
      try {
        const newEnrollment = await api.enrollStudent(user.id, course.id);
        setEnrollment(newEnrollment);
        alert("Enrolled successfully!");
      } catch (error) {
        console.error("Failed to enroll:", error);
        alert("Failed to enroll. Please try again.");
      }
    }
  };
  
  const handleUnenroll = async () => {
    if (!user || !course) return;
    setUnenrollLoading(true);
    try {
        await api.unenrollStudent(user.id, course.id);
        setEnrollment(null);
        setShowUnenrollModal(false);
        alert(`Successfully unenrolled from "${course.title}".`);
    } catch (error) {
        console.error("Failed to unenroll:", error);
        alert("Error: Unable to unenroll.");
    } finally {
        setUnenrollLoading(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    // Teacher/Admin luôn xem được
    // Student phải enroll mới xem được
    const canView = isTeacher || isAdmin || isEnrolled;

    if (!canView) {
        alert("Please enroll in this course to view content.");
        return;
    }

    // Mock logic hoàn thành bài học
    if(user && user.role === UserRole.Student && enrollment && !enrollment.completedLessons.includes(lesson.id)) {
        api.completeLesson(user.id, courseId, lesson.id)
           .then((updated) => setEnrollment(updated))
           .catch(err => console.error(err));
    }
    
    // Tạm thời alert, chuyển view sang trang xem video sau
    alert(`Playing lesson: ${lesson.title}\n(Content URL: ${lesson.contentUrl || 'N/A'})`);
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading course details...</div>;
  if (!course) return <div className="text-center py-20 text-red-500">Course not found or Access Denied.</div>;

  const isEnrolled = !!enrollment;
  const isTeacher = user?.id === course.teacherId;
  const isAdmin = user?.role === UserRole.Admin;
  
  // Lấy thông tin teacher từ course include, nếu không thì lấy từ state teacher
  const displayTeacherName = course.teacher?.fullName || teacher?.name || 'Unknown Instructor';

  // URL ảnh an toàn
  const imageUrl = course.thumbnail 
  ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:3000${course.thumbnail}`)
  : 'https://via.placeholder.com/800x400';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Modal Hủy Đăng Ký */}
        {showUnenrollModal && (
            <UnenrollModal
                courseTitle={course.title}
                onClose={() => setShowUnenrollModal(false)}
                onConfirm={handleUnenroll}
                isLoading={unenrollLoading}
            />
        )}

        {/* HEADER SECTION */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
                <div className="md:w-5/12 relative">
                    <img className="h-64 md:h-full w-full object-cover" src={imageUrl} alt={course.title} />
                    {/* Badge cho Teacher/Admin */}
                    {(isTeacher || isAdmin) && (
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white ${course.isPublished ? 'bg-green-500' : 'bg-gray-500'}`}>
                            {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </div>
                    )}
                </div>
                <div className="p-8 md:w-7/12 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        <span className="bg-indigo-50 dark:bg-indigo-900 px-2 py-1 rounded uppercase">{course.category || 'General'}</span>
                        <span>•</span>
                        <span>{course.level || 'All Levels'}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Created by <span className="font-semibold text-slate-800 dark:text-slate-200">{displayTeacherName}</span>
                    </p>
                    
                    <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-3 mb-6 whitespace-pre-line">
                        {course.description}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="mt-auto">
                        {isAuthenticated && user?.role === UserRole.Student ? (
                            <div className="flex items-center gap-4">
                                {isEnrolled ? (
                                    <div className="flex-grow flex items-center gap-4">
                                        <div className="flex-grow max-w-xs">
                                            <p className="text-xs text-slate-500 mb-1">Your Progress</p>
                                            <ProgressBar value={progressPercentage} />
                                        </div>
                                        <button 
                                            onClick={() => setShowUnenrollModal(true)} 
                                            className="px-4 py-2 border border-red-500 text-red-500 text-sm font-medium rounded hover:bg-red-50 transition-colors"
                                            disabled={unenrollLoading}
                                        >
                                            Unenroll
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={handleEnroll} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all">
                                        Enroll Now
                                    </button>
                                )}
                            </div>
                        ) : (isTeacher || isAdmin) ? (
                            <div className="flex gap-4">
                                <button 
                                    // Chuyển sang trang Edit
                                    onClick={() => setView({ page: 'edit-course', id: course.id })}
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                                >
                                    Edit Course
                                </button>
                            </div>
                        ) : (
                             // Guest
                             <button onClick={() => setView({ page: 'login' })} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow hover:bg-indigo-700 transition-colors">
                                Login to Enroll
                             </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Course Content</h2>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    {course.lessons && course.lessons.length > 0 ? (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                            {course.lessons.map((lesson, index) => {
                                const isCompleted = enrollment?.completedLessons.includes(lesson.id) ?? false;
                                // Lock bài học nếu là Student chưa enroll. Teacher/Admin xem được hết.
                                const isLocked = user?.role === UserRole.Student && !isEnrolled;

                                return (
                                    <li key={lesson.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${isLocked ? 'opacity-70' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="text-slate-400 font-mono text-sm w-6">#{index + 1}</span>
                                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                                                    {lesson.type === 'VIDEO' ? <PlayIcon className="h-5 w-5" /> : <DocumentTextIcon className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <h4 className={`font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {lesson.title}
                                                    </h4>
                                                    <span className="text-xs text-slate-500 uppercase">{lesson.type}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {isCompleted && <CheckCircleIcon className="h-6 w-6 text-green-500" />}
                                                
                                                {/* Nút Quiz (nếu có) */}
                                                {lesson.quiz && isEnrolled && (
                                                   <button
                                                     onClick={() => setView({ page: 'quiz', courseId: course.id, lessonId: lesson.id, quizId: lesson.quiz!.id })}
                                                     className="px-3 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200"
                                                   >
                                                     Quiz
                                                   </button>
                                                )}

                                                {/* Nút View / Locked */}
                                                {isLocked ? (
                                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Locked</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleLessonClick(lesson)}
                                                        className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 font-medium rounded hover:bg-indigo-100 dark:bg-slate-700 dark:text-indigo-300 dark:hover:bg-slate-600 transition"
                                                    >
                                                        Watch
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            No lessons available yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar info */}
            <div className="md:col-span-1">
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700 sticky top-4">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Course Features</h3>
                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                        <li className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                            <span className="flex items-center gap-2"><BookOpenIcon className="h-4 w-4"/> Lectures</span>
                            <span className="font-medium">{course._count?.lessons || course.lessons?.length || 0}</span>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                            <span>Skill level</span>
                            <span className="font-medium">{course.level || 'All Levels'}</span>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                            <span>Language</span>
                            <span className="font-medium">English</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span>Students</span>
                            <span className="font-medium">{course._count?.enrollments || 0}</span>
                        </li>
                    </ul>
                 </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unenroll Course?</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
                Are you sure you want to unenroll from <span className="font-semibold text-indigo-600">{courseTitle}</span>? 
                <br/><span className="text-red-500 text-sm mt-1 block">Warning: All your progress will be lost.</span>
            </p>
            
            <div className="flex justify-end gap-3">
                <button
                    className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center gap-2"
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Confirm Unenroll'}
                </button>
            </div>
        </div>
    </div>
);

export default CourseDetailPage;