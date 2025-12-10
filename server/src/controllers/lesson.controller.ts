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
    
export const createLesson = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement createLesson controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const updateLesson = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement updateLesson controller
    return res.status(501).json({ message: 'Not implemented' });
};
    
export const deleteLesson = async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // TODO: Implement deleteLesson controller
    return res.status(501).json({ message: 'Not implemented' });
};
