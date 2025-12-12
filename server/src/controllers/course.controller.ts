import { NextFunction, Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import courseService from '@/services/course.service';
import { verifyToken } from '@/utils/jwt.utils';

/**
 * Public: Get all courses with filters
 */
export const getAllCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters = {
            category: req.query.category as string,
            level: req.query.level as string,
            search: req.query.search as string,
        };
        const courses = await courseService.getAllCourses(filters);
        
        // SỬA: Xóa 'return' ở đầu dòng
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};

/**
 * UC-L04: Get logged-in teacher's courses
 */
export const getMyCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const courses = await courseService.getTeacherCourses(teacherId);
        
        // SỬA: Xóa 'return'
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};

export const getCourseById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Logic lấy viewerId cho Public Route
        let viewerId: string | undefined = undefined;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded: any = verifyToken(token);
                viewerId = decoded.id;
            } catch (error) {
                // Ignore invalid token
            }
        }

        const course = await courseService.getCourseById(id, viewerId);
        
        if (!course) {
            // SỬA: Thêm 'return' ở đây để dừng hàm (vì sau đó code còn chạy tiếp)
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        
        // SỬA: Xóa 'return' ở dòng success cuối cùng
        res.status(200).json(course);
    } catch (error) {
        next(error);
    }
};

/**
 * UC-L05: Create Course
 */
export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const { title, description, category, level } = req.body;
        
        const thumbnail = req.file ? `/uploads/${req.file.filename}` : undefined;

        const newCourse = await courseService.createCourse(teacherId, {
            title,
            description,
            category,
            level,
            thumbnail,
        });

        // SỬA: Xóa 'return'
        res.status(201).json(newCourse);
    } catch (error) {
        next(error);
    }
};

/**
 * UC-L06: Update Course
 */
export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const teacherId = req.user!.id;
        const { title, description, category, level } = req.body;
        
        const thumbnail = req.file ? `/uploads/${req.file.filename}` : undefined;

        const updatedCourse = await courseService.updateCourse(id, teacherId, {
            title,
            description,
            category,
            level,
            thumbnail,
        });

        // SỬA: Xóa 'return'
        res.status(200).json(updatedCourse);
    } catch (error) {
        next(error);
    }
};

/**
 * UC-L09: Delete Course
 */
export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const teacherId = req.user!.id;

        await courseService.deleteCourse(id, teacherId);

        // SỬA: Xóa 'return'
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * UC-L07: Publish/Unpublish Course
 */
export const toggleCoursePublish = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const teacherId = req.user!.id;
        // Lấy giá trị boolean cụ thể từ body thay vì tự động toggle
        const { isPublished } = req.body; 

        const result = await courseService.updateCoursePublishStatus(id, teacherId, isPublished);
        
        // Trả về kết quả trực tiếp giống như lesson controller
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};