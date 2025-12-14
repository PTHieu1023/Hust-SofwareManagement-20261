import { Lesson } from '@prisma/client';
import prisma from '@/config/prisma.config';

export interface LessonDetail {
  lesson: Lesson;
  prevLessonId: string | null;
  nextLessonId: string | null;
}

const findPrevNext = async (params: {
  courseId: string;
  order: number;
  onlyPublished: boolean;
}) => {
  const { courseId, order, onlyPublished } = params;

  const publishedFilter = onlyPublished ? { isPublished: true } : {};

  const [prevLesson, nextLesson] = await Promise.all([
    prisma.lesson.findFirst({
      where: { courseId, ...publishedFilter, order: { lt: order },},
      orderBy: { order: "desc" },
      select: { id: true },
    }),
    prisma.lesson.findFirst({
      where: { courseId, ...publishedFilter, order: { gt: order },},
      orderBy: { order: "asc" },
      select: { id: true },
    }),
  ]);

  return {
    prevLessonId: prevLesson?.id ?? null,
    nextLessonId: nextLesson?.id ?? null,
  };
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
): Promise<LessonDetail> => {
  // Take lesson by id
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  // If lesson does not exist or is not published -> not found
  if (!lesson || !lesson.isPublished) { throw new Error('LESSON_NOT_FOUND');}

  // Check if student has enrolled in the course containing this lesson
  const enrollment = await prisma.enrollment.findFirst({
    where: { courseId: lesson.courseId, studentId: userId},
    select: { id: true },
  });

  if (!enrollment) {
    // Student can see lesson list but not view content
    throw new Error('NOT_ENROLLED');
  }

  // Find previous (prev) and next lessons in the same course, only published lessons
  const nav = await findPrevNext({
    courseId: lesson.courseId,
    order: lesson.order,
    onlyPublished: true,
  });

  return { lesson, ...nav };
};

const getLessonDetailForTeacher = async (
  lessonId: string,
  userId: string,
  role: string
): Promise<LessonDetail> => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: true },
  });

  if (!lesson) throw new Error("LESSON_NOT_FOUND");

  // ADMIN xem mọi course, TEACHER chỉ xem course mình tạo
  const isAdmin = role === "ADMIN";
  const isOwnerTeacher = role === "TEACHER" && lesson.course.teacherId === userId;

  if (!isAdmin && !isOwnerTeacher) {
    throw new Error("FORBIDDEN_LESSON");
  }

  const nav = await findPrevNext({
    courseId: lesson.courseId,
    order: lesson.order,
    onlyPublished: false,
  });

  return { lesson, ...nav };
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
    order?: number;
    isPublished?: boolean;
  }
): Promise<Lesson> => {
  const lesson = await validateLessonOwnership(lessonId, teacherId);

  // ===== Handle Order Change =====
  if (data.order !== undefined && data.order !== lesson.order) {
    // Dịch các lesson khác
    await prisma.lesson.updateMany({
      where: {
        courseId: lesson.courseId,
        id: { not: lessonId },
        order: {
          gte: data.order,
        },
      },
      data: {
        order: { increment: 1 },
      },
    });
  }

  // Remove undefined fields
  const updateData = Object.fromEntries(
    Object.entries({
      title: data.title,
      description: data.description,
      type: data.type,
      contentUrl: data.contentUrl,
      duration: data.duration,
      order: data.order,
      isPublished: data.isPublished,
    }).filter(([_, v]) => v !== undefined)
  );

  return prisma.lesson.update({
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
  await prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) throw new Error("Lesson not found");
    if (lesson.course.teacherId !== teacherId) {
      throw new Error("You have no permission to delete this lesson");
    }

    // Xoá lesson
    await tx.lesson.delete({ where: { id: lessonId } });

    // Re-index order trong cùng course
    const remain = await tx.lesson.findMany({
      where: { courseId: lesson.courseId },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    // Gán lại order từ 1..n
    await Promise.all( remain.map((l, i) => tx.lesson.update({
          where: { id: l.id },
          data: { order: i + 1 },
        }),
      ),
    );
  });
};

const reorderLessons = async ( courseId: string, teacherId: string, orderedLessonIds: string[], ): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const course = await tx.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });

    if (!course) throw new Error('COURSE_NOT_FOUND');
    if (course.teacherId !== teacherId) throw new Error('FORBIDDEN');

    const existing = await tx.lesson.findMany({
      where: { courseId },
      select: { id: true },
      orderBy: { order: 'asc' },
    });

    // Validate: đủ số lượng + đúng id
    const dbIds = new Set(existing.map((l) => l.id));
    if (
      orderedLessonIds.length !== existing.length ||
      orderedLessonIds.some((id) => !dbIds.has(id))
    ) {
      throw new Error('INVALID_ORDER');
    }

    // Phase 1: đẩy order lên cao để tránh conflict unique
    await tx.lesson.updateMany({
      where: { courseId },
      data: { order: { increment: 1000 } },
    });

    // Phase 2: set lại 1..n theo thứ tự mới
    for (let i = 0; i < orderedLessonIds.length; i++) {
      await tx.lesson.update({
        where: { id: orderedLessonIds[i] },
        data: { order: i + 1 },
      });
    }
  });
};

export default {
    getLessonDetailForStudent,
    getLessonDetailForTeacher,
    getLessonsForTeacherByCourse,
    createLesson,
    updateLessonContent,
    updateLessonPublishStatus,
    deleteLesson,
    reorderLessons,
};
