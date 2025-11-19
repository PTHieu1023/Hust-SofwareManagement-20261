import multer from 'multer';
import path from 'node:path';
import app from '@/config/app.config';

// Storage configuration
const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
        const uploadPath = path.join(app.ENV.UPLOAD_DIR, file.fieldname);
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|avi|mov|wmv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, and videos are allowed.'));
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: app.ENV.MAX_FILE_SIZE },
    fileFilter,
});
