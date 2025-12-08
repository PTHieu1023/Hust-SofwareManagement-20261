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

const getLessonsForTeacherByCourse = async (courseId: string, teacherId: string): Promise<Lesson[]> => {
  // 1. Kiểm tra Course tồn tại và Teacher là owner [cite: 43, 44]
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error('Course not found')
  }

  if (course.teacherId !== teacherId) {
    throw new Error('You are not allowed to manage this course');
  }

  // 2. Query lessons
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: 'asc' }, // [cite: 49]
  });

  return lessons;
};
const createLesson = async (
  teacherId: string,
  data: {
    title: string;
    description: string;
    type: 'VIDEO' | 'PDF'
    courseId: string;
    order ?: number;
    contentUrl ?: string;
    duration?: number;
    isPublished: boolean;
  }
): Promise<Lesson> => {
  const course = await prisma.course.findUnique({
    where: { id: data.courseId}
  });
  if (!course) throw new Error('Course not found');
  if (course.teacherId !== teacherId){
    throw new Error('You have not permission to access');
  }
  let newOrder: number;
  if (data.order !== undefined && data.order !== null){
    newOrder = data.order;
    await prisma.lesson.updateMany({
      where:{
        courseId: data.courseId,
        order:{
          gte: newOrder,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });

  }
   else{
    const maxOrderLesson = await prisma.lesson.findFirst({
      where: {
        courseId: data.courseId
      },
      orderBy:{
        order: 'desc'
      },
    });
    newOrder = maxOrderLesson ? maxOrderLesson.order + 1 : 1;
  }

  return await prisma.lesson.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      contentUrl: data.contentUrl || '',
      duration: data.duration || 0,
      courseId: data.courseId,
      order: newOrder, 
      isPublished: data.isPublished,
    }
  })
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
    getLessonsForTeacherByCourse,
    createLesson,
    updateLesson,
    deleteLesson,

};
