import React, {useState, useEffect} from 'react';
import {UserForAdmin, CourseForAdmin, View, AdminStatistics, Pagination, UserRole} from '../types.ts';
import {api} from '../services/api.ts';
import {useAuth} from '../context/AuthContext';

interface AdminDashboardProps {
    setView: (view: View) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({setView}) => {
    const [users, setUsers] = useState<UserForAdmin[]>([]);
    const [courses, setCourses] = useState<CourseForAdmin[]>([]);
    const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
    const [usersPagination, setUsersPagination] = useState<Pagination | null>(null);
    const [coursesPagination, setCoursesPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {user} = useAuth();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [usersResult, coursesResult, statsData] = await Promise.all([
                api.getAllUsersForAdmin(),
                api.getAllCoursesForAdmin(),
                api.getStatisticsForAdmin(),
            ]);

            setUsers(usersResult.users);
            setUsersPagination(usersResult.pagination);
            setCourses(coursesResult.courses);
            setCoursesPagination(coursesResult.pagination);
            setStatistics(statsData);
        } catch (error: any) {
            setError(error.message || "Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role !== UserRole.Admin) {
          setView({ page: 'home' });
        } else {
        fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleToggleBan = async (userId: string) => {
        try {
            const userToBan = users.find(u => u.id === userId);
            if (!userToBan) return;

            if (userToBan.isBanned) {
                await api.unbanUserForAdmin(userId);
            } else {
                await api.banUserForAdmin(userId);
            }

            // Refresh data after action
            await fetchData();
        } catch (error: any) {
            alert(error.message || "Failed to toggle ban status");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await api.deleteUserForAdmin(userId);
                // Refresh data after deletion
                await fetchData();
            } catch (error: any) {
                alert(error.message || "Failed to delete user");
            }
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                await api.deleteCourseForAdmin(courseId);
                // Refresh data after deletion
                await fetchData();
            } catch (error: any) {
                alert(error.message || "Failed to delete course");
            }
        }
    };

    if (loading) return <div className="text-center py-10">Loading admin dashboard...</div>;

    if (error) return (
        <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <button
                onClick={fetchData}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Statistics Overview */}
            {statistics?.overview && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm">Total Users</h3>
                        <p className="text-2xl font-bold">{statistics.overview.totalUsers}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm">Students</h3>
                        <p className="text-2xl font-bold text-blue-600">{statistics.overview.totalStudents}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm">Teachers</h3>
                        <p className="text-2xl font-bold text-green-600">{statistics.overview.totalTeachers}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm">Admins</h3>
                        <p className="text-2xl font-bold text-purple-600">{statistics.overview.totalAdmins}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm">Courses</h3>
                        <p className="text-2xl font-bold text-indigo-600">{statistics.overview.totalCourses}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm">Enrollments</h3>
                        <p className="text-2xl font-bold text-orange-600">{statistics.overview.totalEnrollments}</p>
                    </div>
                </div>
            )}

            {/* Popular Courses */}
            {statistics?.popularCourses && statistics.popularCourses.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Popular Courses</h2>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                            <tr className="border-b dark:border-slate-700">
                                <th className="p-3">Title</th>
                                <th className="p-3">Teacher</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Lessons</th>
                                <th className="p-3">Quizzes</th>
                                <th className="p-3">Students</th>
                                <th className="p-3">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {statistics.popularCourses.map((c: any) => (
                                <tr key={c.id} className="border-b dark:border-slate-700 last:border-b-0">
                                    <td className="p-3">{c.title}</td>
                                    <td className="p-3">{c.teacher?.fullName || '-'}</td>
                                    <td className="p-3">{c.category || '-'}</td>
                                    <td className="p-3">{c._count?.lessons || 0}</td>
                                    <td className="p-3">{c._count?.quizzes || 0}</td>
                                    <td className="p-3">{c._count?.enrollments || 0}</td>
                                    <td className="p-3">
                      <span
                          className={`px-2 py-1 text-xs rounded ${c.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Enrollments */}
            {statistics?.recentEnrollments && statistics.recentEnrollments.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Recent Enrollments</h2>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                            <tr className="border-b dark:border-slate-700">
                                <th className="p-3">Student</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Course</th>
                                <th className="p-3">Enrolled At</th>
                            </tr>
                            </thead>
                            <tbody>
                            {statistics.recentEnrollments.map((e: any) => (
                                <tr key={e.id} className="border-b dark:border-slate-700 last:border-b-0">
                                    <td className="p-3">{e.student?.fullName || '-'}</td>
                                    <td className="p-3">{e.student?.email}</td>
                                    <td className="p-3">{e.course?.title}</td>
                                    <td className="p-3">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Manage Users */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
                {usersPagination && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Showing {users.length} of {usersPagination.total} users
                        (Page {usersPagination.page}/{usersPagination.totalPages})
                    </p>
                )}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                        <tr className="border-b dark:border-slate-700">
                            <th className="p-2">Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Courses</th>
                            <th className="p-2">Enrollments</th>
                            <th className="p-2">Joined</th>
                            <th className="p-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-b dark:border-slate-700 last:border-b-0">
                                <td className="p-2">{u.fullName}</td>
                                <td className="p-2 text-xs">{u.email}</td>
                                <td className="p-2">
                    <span
                        className="px-2 py-1 text-xs rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                      {u.role}
                    </span>
                                </td>
                                <td className="p-2">
                                    <div className="flex flex-col gap-1">
                      <span
                          className={`px-2 py-1 text-xs rounded ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                                        {u.isBanned && (
                                            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                          Banned
                        </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-2 text-center">{u._count?.coursesCreated || 0}</td>
                                <td className="p-2 text-center">{u._count?.enrollments || 0}</td>
                                <td className="p-2 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                                <td className="p-2">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleToggleBan(u.id)}
                                            className={`px-2 py-1 text-xs rounded ${u.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
                                        >
                                            {u.isBanned ? 'Unban' : 'Ban'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="px-2 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manage Courses */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Manage Courses</h2>
                {coursesPagination && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Showing {courses.length} of {coursesPagination.total} courses
                        (Page {coursesPagination.page}/{coursesPagination.totalPages})
                    </p>
                )}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                        <tr className="border-b dark:border-slate-700">
                            <th className="p-2">Title</th>
                            <th className="p-2">Teacher</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Level</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Lessons</th>
                            <th className="p-2">Quizzes</th>
                            <th className="p-2">Students</th>
                            <th className="p-2">Created</th>
                            <th className="p-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {courses.map(c => (
                            <tr key={c.id} className="border-b dark:border-slate-700 last:border-b-0">
                                <td className="p-2 font-medium">{c.title}</td>
                                <td className="p-2 text-xs">{c.teacher?.fullName || '-'}</td>
                                <td className="p-2">
                                    {c.category ? (
                                        <span
                                            className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {c.category}
                      </span>
                                    ) : '-'}
                                </td>
                                <td className="p-2 text-xs capitalize">{c.level || '-'}</td>
                                <td className="p-2">
                    <span
                        className={`px-2 py-1 text-xs rounded ${c.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                                </td>
                                <td className="p-2 text-center">{c._count?.lessons || 0}</td>
                                <td className="p-2 text-center">{c._count?.quizzes || 0}</td>
                                <td className="p-2 text-center font-semibold">{c._count?.enrollments || 0}</td>
                                <td className="p-2 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                                <td className="p-2">
                                    <button
                                        onClick={() => handleDeleteCourse(c.id)}
                                        className="px-2 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;