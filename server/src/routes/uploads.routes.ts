import { Router, Request, Response } from 'express';
import { upload } from '@/middleware/storage.middleware';


const router: Router = Router();

// Test route
router.get('/test', (_, res) => {
    res.send("Upload route OK");
});

router.post('/', upload.any(), (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const file = files[0];

        // Build URL: HOST/uploads/{fieldname}/{filename}
        const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${file.fieldname}/${file.filename}`;

        return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            url: fullUrl,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size
        });

    } catch (error) {
        console.error("Upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error during upload",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

export default router;
