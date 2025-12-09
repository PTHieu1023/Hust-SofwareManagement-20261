import React, {useState, useEffect} from 'react';
import {UserForAdmin, CourseForAdmin, View, AdminStatistics, Pagination, UserRole} from '../types';
import {api} from '../services/api';
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

    // Separate loading states
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [coursesLoading, setCoursesLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});

    // Search and filters
    const [userSearch, setUserSearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [usersPage, setUsersPage] = useState(1);
    const [coursesPage, setCoursesPage] = useState(1);

    const {user} = useAuth();

    // Fetch users only
    const fetchUsers = async (page: number = usersPage, search: string = userSearch, role: string = userRoleFilter) => {
        setUsersLoading(true);
        try {
            const usersResult = await api.getAllUsersForAdmin({
                page,
                limit: 10,
                search: search || undefined,
                role: role || undefined,
            });
            setUsers(usersResult.users);
            setUsersPagination(usersResult.pagination);
        } catch (error: any) {
            console.error("Failed to fetch users:", error);
        } finally {
            setUsersLoading(false);
        }
    };

    // Fetch courses only
    const fetchCourses = async (page: number = coursesPage, search: string = courseSearch) => {
        setCoursesLoading(true);
        try {
            const coursesResult = await api.getAllCoursesForAdmin({
                page,
                limit: 10,
                search: search || undefined,
            });
            setCourses(coursesResult.courses);
            setCoursesPagination(coursesResult.pagination);
        } catch (error: any) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setCoursesLoading(false);
        }
    };

    // Initial fetch all data
    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [usersResult, coursesResult, statsData] = await Promise.all([
                api.getAllUsersForAdmin({
                    page: usersPage,
                    limit: 10,
                    search: userSearch || undefined,
                    role: userRoleFilter || undefined,
                }),
                api.getAllCoursesForAdmin({
                    page: coursesPage,
                    limit: 10,
                    search: courseSearch || undefined,
                }),
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

    const refreshStatistics = async () => {
        try {
            const statsData = await api.getStatisticsForAdmin();
            setStatistics(statsData);
        } catch (error: any) {
            console.error("Failed to refresh statistics:", error);
        }
    };

    const handleUserSearch = () => {
        setUsersPage(1);
        fetchUsers(1, userSearch, userRoleFilter);
    };

    const handleCourseSearch = () => {
        setCoursesPage(1);
        fetchCourses(1, courseSearch);
    };

    const handleUserPageChange = (newPage: number) => {
        setUsersPage(newPage);
        fetchUsers(newPage, userSearch, userRoleFilter);
    };

    const handleCoursePageChange = (newPage: number) => {
        setCoursesPage(newPage);
        fetchCourses(newPage, courseSearch);
    };

    const handleClearUserFilters = () => {
        setUserSearch('');
        setUserRoleFilter('');
        setUsersPage(1);
        fetchUsers(1, '', '');
    };

    const handleClearCourseSearch = () => {
        setCourseSearch('');
        setCoursesPage(1);
        fetchCourses(1, '');
    };

    useEffect(() => {
        if (user?.role !== UserRole.Admin) {
          setView({ page: 'home' });
        } else {
        fetchInitialData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleToggleBan = async (userId: string) => {
        const actionKey = `ban-${userId}`;
        setActionLoading(prev => ({...prev, [actionKey]: true}));

        try {
            const userToBan = users.find(u => u.id === userId);
            if (!userToBan) return;

            if (userToBan.isBanned) {
                await api.unbanUserForAdmin(userId);
                // Update local state
                setUsers(prev => prev.map(u =>
                    u.id === userId
                        ? { ...u, isBanned: false, isActive: true }
                        : u
                ));
            } else {
                await api.banUserForAdmin(userId);
                // Update local state
                setUsers(prev => prev.map(u =>
                    u.id === userId
                        ? { ...u, isBanned: true, isActive: false }
                        : u
                ));
            }
        } catch (error: any) {
            alert(error.message || "Failed to toggle ban status");
        } finally {
            setActionLoading(prev => ({...prev, [actionKey]: false}));
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            const actionKey = `delete-user-${userId}`;
            setActionLoading(prev => ({...prev, [actionKey]: true}));

            try {
                await api.deleteUserForAdmin(userId);

                // Remove user from local state (bảng users không bị reload)
                setUsers(prev => prev.filter(u => u.id !== userId));

                // Update pagination count
                setUsersPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);

                // Refresh statistics from server để có số liệu chính xác
                await refreshStatistics();
            } catch (error: any) {
                alert(error.message || "Failed to delete user");
            } finally {
                setActionLoading(prev => ({...prev, [actionKey]: false}));
            }
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            const actionKey = `delete-course-${courseId}`;
            setActionLoading(prev => ({...prev, [actionKey]: true}));

            try {
                await api.deleteCourseForAdmin(courseId);

                // Remove course from local state (bảng courses không bị reload)
                setCourses(prev => prev.filter(c => c.id !== courseId));

                // Update pagination count
                setCoursesPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);

                // Refresh statistics from server để có số liệu chính xác
                await refreshStatistics();
            } catch (error: any) {
                alert(error.message || "Failed to delete course");
            } finally {
                setActionLoading(prev => ({...prev, [actionKey]: false}));
            }
        }
    };

    if (loading) return <div className="text-center py-10">Loading admin dashboard...</div>;

    if (error) return (
        <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <button
                onClick={fetchInitialData}
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

                {/* Search and Filter */}
                <div className="mb-4 flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search by name, email, or username..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <select
                            value={userRoleFilter}
                            onChange={(e) => setUserRoleFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            <option value="">All Roles</option>
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <button
                        onClick={handleUserSearch}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                    >
                        Search
                    </button>
                    {(userSearch || userRoleFilter) && (
                        <button
                            onClick={handleClearUserFilters}
                            className="px-4 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {usersPagination && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Showing {users.length} of {usersPagination.total} users
                        (Page {usersPagination.page}/{usersPagination.totalPages})
                    </p>
                )}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md overflow-x-auto relative">
                    {/* Loading overlay for users table */}
                    {usersLoading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Loading users...</p>
                            </div>
                        </div>
                    )}
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
                                            disabled={actionLoading[`ban-${u.id}`] || actionLoading[`delete-user-${u.id}`]}
                                            className={`px-2 py-1 text-xs rounded ${u.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                                        >
                                            {actionLoading[`ban-${u.id}`] ? (
                                                <>
                                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>{u.isBanned ? 'Unbanning...' : 'Banning...'}</span>
                                                </>
                                            ) : (
                                                u.isBanned ? 'Unban' : 'Ban'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            disabled={actionLoading[`delete-user-${u.id}`] || actionLoading[`ban-${u.id}`]}
                                            className="px-2 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            {actionLoading[`delete-user-${u.id}`] ? (
                                                <>
                                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Deleting...</span>
                                                </>
                                            ) : (
                                                'Delete'
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Users Pagination */}
                {usersPagination && usersPagination.totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                        <button
                            onClick={() => handleUserPageChange(usersPage - 1)}
                            disabled={usersPage === 1}
                            className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 bg-indigo-500 text-white rounded-md">
                            {usersPage} / {usersPagination.totalPages}
                        </span>
                        <button
                            onClick={() => handleUserPageChange(usersPage + 1)}
                            disabled={usersPage === usersPagination.totalPages}
                            className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Manage Courses */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Manage Courses</h2>

                {/* Search */}
                <div className="mb-4 flex gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by title, description, or category..."
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCourseSearch()}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={handleCourseSearch}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                    >
                        Search
                    </button>
                    {courseSearch && (
                        <button
                            onClick={handleClearCourseSearch}
                            className="px-4 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {coursesPagination && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Showing {courses.length} of {coursesPagination.total} courses
                        (Page {coursesPagination.page}/{coursesPagination.totalPages})
                    </p>
                )}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md overflow-x-auto relative">
                    {/* Loading overlay for courses table */}
                    {coursesLoading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Loading courses...</p>
                            </div>
                        </div>
                    )}
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
                                        disabled={actionLoading[`delete-course-${c.id}`]}
                                        className="px-2 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        {actionLoading[`delete-course-${c.id}`] ? (
                                            <>
                                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Deleting...</span>
                                            </>
                                        ) : (
                                            'Delete'
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Courses Pagination */}
                {coursesPagination && coursesPagination.totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                        <button
                            onClick={() => handleCoursePageChange(coursesPage - 1)}
                            disabled={coursesPage === 1}
                            className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 bg-indigo-500 text-white rounded-md">
                            {coursesPage} / {coursesPagination.totalPages}
                        </span>
                        <button
                            onClick={() => handleCoursePageChange(coursesPage + 1)}
                            disabled={coursesPage === coursesPagination.totalPages}
                            className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;