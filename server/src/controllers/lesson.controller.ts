import { AuthRequest } from '@/middleware/auth.middleware';
import { NextFunction, Response } from 'express';
import lessonService from '@/services/lesson.service';

/**
 * Get lessons of a course for student (public)
 * Used on course detail page to show lesson list.
 */
export const getLessonsForStudentByCourse = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
    const { courseId } = req.params;

    // Gọi service lấy danh sách lesson đã publish
    const lessons = await lessonService.getLessonsByCourse(courseId);

    return res.status(200).json(lessons);
  } catch (error) {
    console.error('getLessonsForStudentByCourse error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get lesson detail (view content)
 * Requires authentication. Students must be enrolled in the course.
 */
export const getLessonDetailForStudent  = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await lessonService.getLessonDetailForStudent (id, user.id);

    // result is expected to contain: { lesson, prevLessonId, nextLessonId }
    return res.status(200).json(result);
  } catch (error) {
    console.error('getLessonDetail error:', error);

    if (error instanceof Error) {
      if (error.message === 'LESSON_NOT_FOUND') {
        return res
          .status(404)
          .json({ message: 'Lesson not found or not published' });
      }

      if (error.message === 'NOT_ENROLLED') {
        return res
          .status(403)
          .json({ message: 'You are not allowed to view this lesson' });
      }
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
};
    


export const getLessonsForTeacher = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
        const { courseId } = req.params;
        const teacherId = req.user!.id; // AuthRequest đảm bảo user tồn tại

        const lessons = await lessonService.getLessonsForTeacherByCourse(courseId, teacherId);
        return res.status(200).json(lessons);
    } catch (error) {
        return _next(error);
    }
};
export const createLesson = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement createLesson controller
    try {
        const teacherId = req.user!.id;
        const { title, description, type, courseId, duration, order, isPublished } = req.body;
        
        // Xử lý file upload (nếu có)
        // Note: Trong thực tế, req.file.path hoặc req.file.location (nếu dùng S3) sẽ là contentUrl
        let contentUrl = '';
        if (req.file) {
            contentUrl = req.file.path.replace(/\\/g, "/"); // Giả sử middleware storage lưu path vào đây
        } else if (req.body.contentUrl) {
            // Trường hợp client upload file trước (Flow 2 bước trong spec )
            contentUrl = req.body.contentUrl;
        }

        const newLesson = await lessonService.createLesson(teacherId, {
            title,
            description,
            type: type as 'VIDEO' | 'PDF',
            courseId,
            order,
            contentUrl,
            duration: duration ? parseInt(duration) : undefined,
            isPublished
        });

        return res.status(201).json(newLesson);
    } catch (error) {
        return _next(error);
    }
};
    
export const updateLesson = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement updateLesson controller
    try {
        const { id } = req.params;
        const teacherId = req.user!.id;
        const { title, description, type, duration, isPublished } = req.body;

        // Chuẩn bị data update
        const updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (type) updateData.type = type;
        if (duration) updateData.duration = parseInt(duration);
        
        // Xử lý file mới nếu có upload
        if (req.file) {
            updateData.contentUrl = req.file.path;
        } else if (req.body.contentUrl) {
            updateData.contentUrl = req.body.contentUrl;
        }

        // Xử lý Publish/Unpublish (UC-L07) [cite: 161]
        // Lưu ý: client gửi string "true"/"false" hoặc boolean, cần parse cẩn thận
        if (isPublished !== undefined) {
             updateData.isPublished = isPublished === 'true' || isPublished === true;
        }

        const updatedLesson = await lessonService.updateLesson(id, teacherId, updateData);
        return res.status(200).json(updatedLesson);
    } catch (error) {
        return _next(error);
    }
};
    
export const deleteLesson = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement deleteLesson controller
    try {
        const { id } = req.params;
        const teacherId = req.user!.id;

        await lessonService.deleteLesson(id, teacherId);

        return res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        return _next(error);
    }
};
