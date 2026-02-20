import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { withAuth } from '../middleware/auth';
import { store } from '../store/index';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, sanitizeFilename } from '../utils/validation';
import { uploadToCloudinary, getSignedUrl, deleteFromCloudinary } from '../utils/cloudinary';

const router = Router();

/* ── Multer memory storage (buffer → Cloudinary, no local disk) ── */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type '${file.mimetype}' is not allowed`));
        }
    },
});

const getIp = (req: Request): string =>
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';

const sizeLabel = (bytes: number) =>
    bytes < 1_048_576
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / 1_048_576).toFixed(2)} MB`;

/* ─────────── GET /api/files ─────────── */
router.get('/', withAuth, (_req: Request, res: Response): void => {
    res.json(store.getFiles());
});

/* ─────────── POST /api/files/upload ─────────── */
router.post('/upload', withAuth, (req: Request, res: Response): void => {
    const ip = getIp(req);

    upload.single('file')(req, res, async (err) => {
        if (err) {
            const message = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
                ? 'File size exceeds 10 MB limit'
                : err.message || 'Upload failed';
            res.status(400).json({ error: message });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }

        const user = req.user!;
        const safeName = sanitizeFilename(req.file.originalname);

        /* Check Cloudinary credentials are configured */
        const cloudConfigured =
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

        let cloudUrl: string | undefined;
        let cloudinaryPublicId: string | undefined;

        if (cloudConfigured) {
            try {
                const result = await uploadToCloudinary(
                    req.file.buffer,
                    safeName,
                    req.file.mimetype
                );
                cloudUrl = result.url;
                cloudinaryPublicId = result.publicId;
            } catch (uploadErr) {
                console.error('[Cloudinary] Upload error:', uploadErr);
                res.status(502).json({ error: 'Cloud storage upload failed. Check Cloudinary credentials.' });
                return;
            }
        }

        const record = store.addFile({
            id: uuid(),
            name: safeName,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            sizeLabel: sizeLabel(req.file.size),
            uploadedBy: user.sub,
            uploadedByEmail: user.email,
            uploadedAt: new Date().toISOString(),
            encryptedBy: 'AES-256',
            status: 'secure',
            path: cloudUrl || 'in-memory-only', // no local disk
            cloudinaryPublicId,
            cloudUrl,
        });

        store.addAuditLog({
            event: 'file_uploaded',
            userId: user.sub,
            userEmail: user.email,
            ip,
            location: 'Unknown',
            severity: 'info',
            meta: {
                fileName: req.file.originalname,
                size: req.file.size,
                storage: cloudConfigured ? 'cloudinary' : 'memory',
            },
        });

        res.status(201).json(record);
    });
});

/* ─────────── GET /api/files/:id/download ─────────── */
router.get('/:id/download', withAuth, (req: Request, res: Response): void => {
    const file = store.getFileById(req.params.id);
    if (!file) { res.status(404).json({ error: 'File not found' }); return; }

    if (file.cloudinaryPublicId) {
        /* Generate a 15-minute signed Cloudinary URL */
        const signedUrl = getSignedUrl(file.cloudinaryPublicId, file.mimeType);
        res.json({ url: signedUrl, fileName: file.originalName });
    } else {
        res.status(400).json({ error: 'File is a seed record and cannot be downloaded' });
    }
});

/* ─────────── DELETE /api/files/:id ─────────── */
router.delete('/:id', withAuth, async (req: Request, res: Response): Promise<void> => {
    const ip = getIp(req);
    const file = store.getFileById(req.params.id);

    if (!file) { res.status(404).json({ error: 'File not found' }); return; }

    const user = req.user!;
    if (file.uploadedBy !== user.sub && user.role !== 'admin') {
        res.status(403).json({ error: 'You do not have permission to delete this file' });
        return;
    }

    /* Delete from Cloudinary if stored there */
    if (file.cloudinaryPublicId) {
        try {
            await deleteFromCloudinary(file.cloudinaryPublicId, file.mimeType);
        } catch (e) {
            console.error('[Cloudinary] Delete error:', e);
        }
    }

    store.deleteFile(file.id);

    store.addAuditLog({
        event: 'file_deleted',
        userId: user.sub,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'warning',
        meta: { fileName: file.originalName },
    });

    res.json({ ok: true, message: `File '${file.originalName}' deleted` });
});

export default router;
