import { Lesson } from '@prisma/client';
import prisma from '@/config/prisma.config';

export interface LessonDetailForStudent {
  lesson: Lesson;
  prevLessonId: string | null;
  nextLessonId: string | null;
}

/** ID
 * - Filter by published status
 * - Order by lesson order
 * @param courseId - Course ID
 * @returns Promise<Lesson[]>
 */
// List lessons of a course (public, only published)
const getLessonsByCourse = async (courseId: string): Promise<Lesson[]> => {
  const lessons = await prisma.lesson.findMany({
    where: {
      courseId,
      isPublished: true,      // only get lessons that are published for students
    },
    orderBy: {
      order: 'asc',           // order by lesson order
    },
  });

  return lessons;
};

/**
 * For students to view lesson content (with prev/next).
 * - Lesson must exist & isPublished = true.
 * - Student must be enrolled in the course containing the lesson.
 * - Returns lesson + prevLessonId + nextLessonId.
 */
const getLessonDetailForStudent = async (
  lessonId: string,
  userId: string,
): Promise<LessonDetailForStudent> => {
  // Take lesson by id
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  // If lesson does not exist or is not published -> not found
  if (!lesson || !lesson.isPublished) {
    throw new Error('LESSON_NOT_FOUND');
  }

  // Check if student has enrolled in the course containing this lesson
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      courseId: lesson.courseId,
      studentId: userId,
    },
  });

  if (!enrollment) {
    // Student can see lesson list but not view content
    throw new Error('NOT_ENROLLED');
  }

  // Find previous (prev) and next lessons in the same course, only published lessons
  const [prevLesson, nextLesson] = await Promise.all([
    prisma.lesson.findFirst({
      where: {
        courseId: lesson.courseId,
        isPublished: true,
        order: { lt: lesson.order }, // smaller than current order
      },
      orderBy: {
        order: 'desc', // largest among the previous lessons
      },
    }),
    prisma.lesson.findFirst({
      where: {
        courseId: lesson.courseId,
        isPublished: true,
        order: { gt: lesson.order }, // greater than current order
      },
      orderBy: {
        order: 'asc', // smallest among the next lessons
      },
    }),
  ]);

  // progress here if needed

  return {
    lesson,
    prevLessonId: prevLesson?.id ?? null,
    nextLessonId: nextLesson?.id ?? null,
  };
};

/**
 * - Verify teacher owns the course
 * - Handle file upload (video/PDF)
 * - Create lesson with ordering
 * @param teacherId - Teacher user ID
 * @param data - Lesson data
 * @returns Promise<Lesson>
 */
const createLesson = async (
    _teacherId: string,
    _data: {
        title: string;
        description?: string;
        type: string;
        courseId: string;
        order: number;
        content?: string;
        contentUrl?: string;
        duration?: number;
    }
): Promise<Lesson> => {
    // TODO: Implement lesson creation
    throw new Error('Not implemented');
}

/**
 * - Verify teacher owns the course
 * - Update lesson data
 * @param lessonId - Lesson ID
 * @param teacherId - Teacher user ID
 * @param data - Update data
 * @returns Promise<Lesson>
 */
const updateLesson = async (
    _lessonId: string,
    _teacherId: string,
    _data: Partial<Lesson>
): Promise<Lesson> => {
    // TODO: Implement lesson update
    throw new Error('Not implemented');
}

/**
 * - Verify teacher owns the course
 * - Delete lesson
 * @param lessonId - Lesson ID
 * @param teacherId - Teacher user ID
 * @returns Promise<void>
 */
const deleteLesson = async (_lessonId: string, _teacherId: string): Promise<void> => {
    // TODO: Implement lesson deletion
    throw new Error('Not implemented');
}

export default {
    getLessonsByCourse,
    getLessonDetailForStudent,
    createLesson,
    updateLesson,
    deleteLesson,
};
