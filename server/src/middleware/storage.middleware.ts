import Env from '@/utils/env.utils';
import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';

export const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, file, cb) => {
            const uploadDir = path.join(Env.UPLOAD_DIR, file.fieldname);

            // create dir if not exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            cb(null, uploadDir);
        },

        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname);
            const safeName = file.fieldname.toLowerCase().replace(/\s+/g, '-');
            const filename = `${safeName}-${randomUUID()}${ext}`;
            cb(null, filename);
        },
    }),

    limits: {
        fileSize: Env.MAX_FILE_SIZE, // 50MB mặc định
    }
});
