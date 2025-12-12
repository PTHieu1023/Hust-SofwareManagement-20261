import { Quiz, Question, QuizAttempt, QuestionType } from '@prisma/client';
import prisma from '@/config/prisma.config';

/**
 * - Filter by published status
 * - Include question count
 * @param courseId - Course ID
 * @returns Promise<Quiz[]>
 */
const getQuizzesByCourse = async (courseId: string): Promise<Quiz[]> => {
    const quizzes = await prisma.quiz.findMany({
        where: { courseId, isPublished: true },
        include: {
            _count: { select: { questions: true } }
        },
        orderBy: { order: 'asc' }
    });

    return quizzes;
}

/**
 * - Include questions and answers
 * - Hide correct answers for students
 * @param quizId - Quiz ID
 * @param userRole - User role (to determine if show answers)
 * @returns Promise<Quiz | null>
 */
const getQuizById = async (quizId: string, userRole: string): Promise<Quiz | null> => {
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
            questions: { include: { answers: true } }
        }
    });

    if (!quiz) return null;

    // If quiz is unpublished and user is not teacher/admin, hide
    if (!quiz.isPublished && userRole !== 'TEACHER' && userRole !== 'ADMIN') return null;

    // If user is student, hide correct flags on answers
    if (userRole === 'STUDENT') {
        const safeQuestions = (quiz as any).questions.map((q: any) => ({
            ...q,
            answers: q.answers.map((a: any) => ({ id: a.id, answerText: a.answerText, order: a.order }))
        }));

        return { ...quiz, questions: safeQuestions } as any;
    }

    return quiz;
}

/**
 * - Verify teacher owns the course
 * - Create quiz with settings
 * @param teacherId - Teacher user ID
 * @param data - Quiz data
 * @returns Promise<Quiz>
 */
const createQuiz = async (
    teacherId: string,
    data: {
        title: string;
        description?: string;
        courseId: string;
        passingScore: number;
        timeLimit?: number;
        order: number;
    }
): Promise<Quiz> => {
    // Verify teacher owns the course
    const course = await prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) throw new Error('Course not found');
    if (course.teacherId !== teacherId) throw new Error('Unauthorized');

    const quiz = await prisma.quiz.create({
        data: {
            title: data.title,
            description: data.description ?? null,
            courseId: data.courseId,
            passingScore: data.passingScore,
            timeLimit: data.timeLimit ?? null,
            order: data.order,
            isPublished: false
        }
    });

    return quiz;
}

/**
 * - Verify teacher owns the course
 * - Update quiz data
 * @param quizId - Quiz ID
 * @param teacherId - Teacher user ID
 * @param data - Update data
 * @returns Promise<Quiz>
 */
const updateQuiz = async (
    quizId: string,
    teacherId: string,
    data: Partial<Quiz>
): Promise<Quiz> => {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { course: true } });
    if (!quiz) throw new Error('Quiz not found');
    if ((quiz as any).course.teacherId !== teacherId) throw new Error('Unauthorized');

    const updated = await prisma.quiz.update({ where: { id: quizId }, data: { ...(data as any) } });
    return updated;
}

/**
 * - Verify teacher owns the course
 * - Delete quiz and questions (cascading)
 * @param quizId - Quiz ID
 * @param teacherId - Teacher user ID
 * @returns Promise<void>
 */
const deleteQuiz = async (quizId: string, teacherId: string): Promise<void> => {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { course: true } });
    if (!quiz) throw new Error('Quiz not found');
    if ((quiz as any).course.teacherId !== teacherId) throw new Error('Unauthorized');

    await prisma.quiz.delete({ where: { id: quizId } });
}

/**
 * - Verify teacher owns the course
 * - Create question with answers
 * @param quizId - Quiz ID
 * @param teacherId - Teacher user ID
 * @param data - Question data with answers
 * @returns Promise<Question>
 */
const addQuestion = async (
    quizId: string,
    teacherId: string,
    data: {
        question: string;
        type: string;
        points: number;
        order: number;
        answers: Array<{ answerText: string; isCorrect: boolean }>;
    }
): Promise<Question> => {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { course: true } });
    if (!quiz) throw new Error('Quiz not found');
    if ((quiz as any).course.teacherId !== teacherId) throw new Error('Unauthorized');

    const question = await prisma.question.create({
        data: {
            quizId,
            question: data.question,
            type: data.type as QuestionType,
            points: data.points,
            order: data.order,
            answers: {
                create: data.answers.map((a, idx) => ({ answerText: a.answerText, isCorrect: a.isCorrect, order: idx }))
            }
        },
        include: { answers: true }
    });

    return question;
}

/**
 * - Validate student is enrolled
 * - Calculate score based on correct answers
 * - Determine if passed
 * - Save attempt
 * @param quizId - Quiz ID
 * @param studentId - Student user ID
 * @param data - Submission data (answers, timeSpent)
 * @returns Promise<QuizAttempt>
 */
const submitQuiz = async (
    quizId: string,
    studentId: string,
    data: { answers: Record<string, string>; timeSpent?: number }
): Promise<QuizAttempt> => {
    // Verify enrollment
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new Error('Quiz not found');

    const enrollment = await prisma.enrollment.findFirst({ where: { studentId, courseId: quiz.courseId } });
    if (!enrollment) throw new Error('Student not enrolled in course');

    // Load questions and correct answers
    const questions = await prisma.question.findMany({ where: { quizId }, include: { answers: true } });

    let totalPoints = 0;
    let earned = 0;

    for (const q of questions) {
        totalPoints += q.points;
        const provided = data.answers[q.id];
        if (!provided) continue;

        // Find the chosen answer and check correctness
        const chosen = (q as any).answers.find((a: any) => a.id === provided || a.answerText === provided);
        if (chosen && chosen.isCorrect) {
            earned += q.points;
        }
    }

    const score = totalPoints === 0 ? 0 : Math.round((earned / totalPoints) * 100);
    const isPassed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
        data: {
            quizId,
            studentId,
            score,
            isPassed,
            answers: JSON.stringify(data.answers),
            timeSpent: data.timeSpent ?? null,
            completedAt: new Date()
        }
    });

    return attempt;
}

/**
 * - Get all attempts for a quiz by student
 * - Order by completion date
 * @param quizId - Quiz ID
 * @param studentId - Student user ID
 * @returns Promise<QuizAttempt[]>
 */
const getQuizAttempts = async (quizId: string, studentId: string): Promise<QuizAttempt[]> => {
    const attempts = await prisma.quizAttempt.findMany({
        where: { quizId, studentId },
        orderBy: { completedAt: 'desc' }
    });

    return attempts;
}

export default {
    getQuizzesByCourse,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    submitQuiz,
    getQuizAttempts,
};