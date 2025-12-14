import { NextFunction, Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import progressService from '@/services/progress.service';
type MarkLessonCompleteDto = { lessonId: string, courseId: string };

export const markLessonComplete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Lấy studentId từ token đã xác thực
        const studentId = req.user?.id; 
        const lessonId = req.params.lessonId;
        const { courseId } = req.body as { courseId: string };
        if (!studentId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Gọi service để xử lý logic: cập nhật progress, kiểm tra hoàn thành, v.v.
        const result = await progressService.markLessonComplete(studentId, lessonId, courseId);        
        return res.status(200).json({ 
            message: 'Lesson marked as completed successfully', 
            data: result 
        });
    } catch (error) {
        next(error); // Chuyển lỗi đến Error Handler Middleware
    }
};
    
export const getCourseProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user?.id;
        // Giả sử courseId được truyền qua URL params: /progress/course/:courseId
        const courseId = req.params.courseId;

        if (!studentId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Gọi service để tính toán hoặc lấy tiến độ khóa học
        const progress = await progressService.getCourseProgress(studentId, courseId);

        return res.status(200).json({ 
            message: 'Course progress retrieved successfully', 
            data: progress 
        });
    } catch (error) {
        next(error);
    }
};
    
export const getMyProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user?.id;
        
        if (!studentId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        // Gọi service để lấy danh sách các khóa học đã đăng ký cùng với tiến độ của từng khóa
        const overallProgress = await progressService.getStudentProgress(studentId);

        return res.status(200).json({ 
            message: 'Overall progress retrieved successfully', 
            data: overallProgress 
        });
    } catch (error) {
        next(error);
    }
};