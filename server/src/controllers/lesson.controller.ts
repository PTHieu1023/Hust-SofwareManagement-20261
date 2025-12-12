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

/**
 * Teacher watches the list of lessons for a course they created
 */
export const getLessonsForTeacherByCourse = async (req: AuthRequest, res: Response, _next: NextFunction ) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const lessons = await lessonService.getLessonsForTeacherByCourse(
      courseId,
      user.id,       // teacherId
    );

    return res.status(200).json(lessons);
  } catch (error) {
    console.error('getLessonsForTeacherByCourse error:', error);

    if (error instanceof Error) {
      if (error.message === 'COURSE_NOT_FOUND') {
        return res.status(404).json({ message: 'Course not found' });
      }

      if (error.message === 'FORBIDDEN_COURSE') {
        return res
          .status(403)
          .json({ message: 'You are not allowed to manage lessons of this course' });
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
export const createLesson = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        // Lấy contentUrl trực tiếp từ body (do FE đã upload trước và gửi xuống)
        const { title, description, type, courseId, duration, order, contentUrl, isPublished } = req.body;

        const newLesson = await lessonService.createLesson(teacherId, {
            courseId,
            title,
            description,
            type,
            contentUrl,
            duration: duration ? parseInt(duration) : 0,
            order: order ? parseInt(order) : undefined,
            isPublished: isPublished
        });

        return res.status(201).json(newLesson);
    } catch (error) {
        return next(error);
    }
};

// 2. Update Lesson Content
export const updateLessonContent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const teacherId = req.user!.id;
        const { title, description, type, duration, contentUrl } = req.body;

        const updatedLesson = await lessonService.updateLessonContent(id, teacherId, {
            title,
            description,
            type,
            contentUrl, // URL mới hoặc undefined
            duration: duration ? parseInt(duration) : undefined
            
        });

        return res.status(200).json(updatedLesson);
    } catch (error) {
        return next(error);
    }
};

// 3. Toggle Publish
export const toggleLessonPublish = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const teacherId = req.user!.id;
        const { isPublished } = req.body;

        const result = await lessonService.updateLessonPublishStatus(id, teacherId, isPublished);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
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

