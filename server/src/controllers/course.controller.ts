import { NextFunction, Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import courseService from '@/services/course.service';

export const getAllCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { category, level, search } = req.query as any;

        const courses = await courseService.getAllCourses({
            category,
            level,
            search
        });

        return res.status(200).json({ message: 'Courses retrieved', data: courses });
    } catch (error) {
        return next(error);
    }
};

export const getCourseById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await courseService.getCourseById(id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        return res.status(200).json({ message: 'Course retrieved', data: course });
    } catch (error) {
        return next(error);
    }
};

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const { title, description, category, level } = req.body;
        const thumbnail = (req as any).file?.path ?? (req as any).file?.filename ?? undefined;

        const course = await courseService.createCourse(teacherId, {
            title,
            description,
            category,
            level,
            thumbnail
        });

        return res.status(201).json({ message: 'Course created', data: course });
    } catch (error) {
        return next(error);
    }
};

export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const { id } = req.params;
        const { title, description, category, level } = req.body;
        const thumbnail = (req as any).file?.path ?? (req as any).file?.filename ?? undefined;

        const updated = await courseService.updateCourse(id, teacherId, {
            title,
            description,
            category,
            level,
            thumbnail
        });

        return res.status(200).json({ message: 'Course updated', data: updated });
    } catch (error) {
        return next(error);
    }
};

export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const { id } = req.params;

        await courseService.deleteCourse(id, teacherId);

        return res.status(200).json({ message: 'Course deleted' });
    } catch (error) {
        return next(error);
    }
};

export const publishCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user!.id;
        const { id } = req.params;

        const updated = await courseService.togglePublish(id, teacherId);

        return res.status(200).json({ message: 'Course publish toggled', data: updated });
    } catch (error) {
        return next(error);
    }
};
