import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

export const validate = async (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(createHttpError(400, 'invalid_data', { errors: errors.array() }));
    }
    return next();
};
