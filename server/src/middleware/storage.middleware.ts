import Env from '@/utils/env.utils';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

export const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, file, cb) => {
            const uploadPath = path.join(Env.UPLOAD_DIR, file.fieldname);
            cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = randomUUID();
            const normalizedOriginalName = file.fieldname.toLowerCase().replace(/\s+/g, '-');
            const filename = normalizedOriginalName + '-' + uniqueSuffix + path.extname(file.originalname);
            cb(null, filename);
        },
    }),
    limits: { fileSize: Env.MAX_FILE_SIZE },
});