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
 * Teacher watches the list of lessons for a course they created
 * - Do not filter isPublished (see both published and draft)
 * - Only allowed if course.teacherId === teacherId
 */
const getLessonsForTeacherByCourse = async (
  courseId: string,
  teacherId: string,
): Promise<Lesson[]> => {
  // 1. Check course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error('COURSE_NOT_FOUND');
  }

  // 2. Check permission: only the teacher who created the course can view
  if (course.teacherId !== teacherId) {
    throw new Error('FORBIDDEN_COURSE');
  }

  // 3. Take all lessons for the course (no isPublished filter)
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  });

  return lessons;
};

/**
 * - Verify teacher owns the course
 * - Handle file upload (video/PDF)
 * - Create lesson with ordering
 * @param teacherId - Teacher user ID
 * @param data - Lesson data
 * @returns Promise<Lesson>
 */

const validateLessonOwnership = async (lessonId: string, teacherId: string) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { course: true }
    });
    if (!lesson) throw new Error('Lesson not found');
    if (lesson.course.teacherId !== teacherId) {
        throw new Error('You do not have permission to modify this lesson');
    }
    return lesson;
};

// 1. Service: Create Lesson
export const createLesson = async (
    teacherId: string,
    data: {
        courseId: string;
        title: string;
        description?: string;
        type: 'VIDEO' | 'PDF' | 'TEXT';
        contentUrl: string;
        duration?: number;
        order?: number;
        isPublished?: boolean;
    }
): Promise<Lesson> => {
    // Check Course Owner
    const course = await prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) throw new Error('Course not found');
    if (course.teacherId !== teacherId) throw new Error('You are not the owner of this course');

    let newOrder: number;
    if (data.order !== undefined) {

        newOrder = data.order;
        await prisma.lesson.updateMany({
            where: {
                courseId: data.courseId,
                order: { gte: newOrder },
            },
            data: { order: { increment: 1 } },
        });
    } else {

        const maxOrderLesson = await prisma.lesson.findFirst({
            where: { courseId: data.courseId },
            orderBy: { order: 'desc' },
        });
        newOrder = maxOrderLesson ? maxOrderLesson.order + 1 : 1;
    }

    return await prisma.lesson.create({
        data: {
            courseId: data.courseId,
            title: data.title,
            description: data.description || '',
            type: data.type,
            contentUrl: data.contentUrl,
            duration: data.duration || 0,
            order: newOrder,
            isPublished: data.isPublished ?? false,
        },
    });
};

// 2. Service: Update Content
export const updateLessonContent = async (
    lessonId: string,
    teacherId: string,
    data: {
        title?: string;
        description?: string;
        type?: 'VIDEO' | 'PDF' | 'TEXT';
        contentUrl?: string;
        duration?: number;
    }
): Promise<Lesson> => {
    // Verify Owner
    await validateLessonOwnership(lessonId, teacherId);

    // Filter undefined values để không update null
    const updateData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    return await prisma.lesson.update({
        where: { id: lessonId },
        data: updateData,
    });
};

// 3. Service: Update Publish Status
export const updateLessonPublishStatus = async (
    lessonId: string,
    teacherId: string,
    isPublished: boolean
): Promise<Lesson> => {
    // Verify Owner
    await validateLessonOwnership(lessonId, teacherId);

    return await prisma.lesson.update({
        where: { id: lessonId },
        data: { isPublished },
    });
};

/**
 * - Verify teacher owns the course
 * - Delete lesson
 * @param lessonId - Lesson ID
 * @param teacherId - Teacher user ID
 * @returns Promise<void>
 */
const deleteLesson = async (lessonId: string, teacherId: string): Promise<void> => {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId},
      include: { course: true}
    });

    if (!lesson) throw new Error('Lesson not found');
    if (lesson.course.teacherId !== teacherId){
      throw new Error('You have no permission to delete this lesson');
    }

    await prisma.lesson.delete({
      where: {id: lessonId}
    });
}

export default {
    getLessonsByCourse,
    getLessonDetailForStudent,
    getLessonsForTeacherByCourse,
    createLesson,
    updateLessonContent,
    updateLessonPublishStatus,
    deleteLesson,
};
