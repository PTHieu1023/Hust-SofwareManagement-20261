import { Router, Request, Response, RouterOptions } from 'express';
import { upload } from '../middleware/storage.middleware'; 
import Env from '../utils/env.utils';
import path from 'path';

const router : Router = Router();

/**
  POST /api/uploads
  Upload file (Video, PDF, Image...) trước khi tạo bài học
  Sử dụng upload.any() để chấp nhận mọi field name (linh hoạt cho FE)
 */
router.post('/', upload.any(), (req: Request, res: Response) => {
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'No file uploaded' 
            });
        }

        const file = (req.files as Express.Multer.File[])[0];

       
        const rootFolder = path.basename(Env.UPLOAD_DIR); 

        const relativePath = path.posix.join(rootFolder, file.fieldname, file.filename);
        
        const fullUrl = `${req.protocol}://${req.get('host')}/${relativePath}`;

        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            url: fullUrl,          
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error during upload',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;