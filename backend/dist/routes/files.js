"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const index_1 = require("../store/index");
const validation_1 = require("../utils/validation");
const cloudinary_1 = require("../utils/cloudinary");
const router = (0, express_1.Router)();
/* ── Multer memory storage (buffer → Cloudinary, no local disk) ── */
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: validation_1.MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (validation_1.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            // multer v2: pass null + false, attach error message as a custom property
            cb(new Error(`File type '${file.mimetype}' is not allowed`), false);
        }
    },
});
const getIp = (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
const sizeLabel = (bytes) => bytes < 1048576
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1048576).toFixed(2)} MB`;
/* ─────────── GET /api/files ─────────── */
router.get('/', auth_1.withAuth, (_req, res) => {
    res.json(index_1.store.getFiles());
});
/* ─────────── POST /api/files/upload ─────────── */
router.post('/upload', auth_1.withAuth, (req, res) => {
    const ip = getIp(req);
    upload.single('file')(req, res, async (err) => {
        if (err) {
            const message = err instanceof multer_1.default.MulterError && err.code === 'LIMIT_FILE_SIZE'
                ? 'File size exceeds 10 MB limit'
                : err.message || 'Upload failed';
            res.status(400).json({ error: message });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }
        const user = req.user;
        const safeName = (0, validation_1.sanitizeFilename)(req.file.originalname);
        /* Check Cloudinary credentials are configured */
        const cloudConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
        let cloudUrl;
        let cloudinaryPublicId;
        if (cloudConfigured) {
            try {
                const result = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, safeName, req.file.mimetype);
                cloudUrl = result.url;
                cloudinaryPublicId = result.publicId;
            }
            catch (uploadErr) {
                console.error('[Cloudinary] Upload error:', uploadErr);
                res.status(502).json({ error: 'Cloud storage upload failed. Check Cloudinary credentials.' });
                return;
            }
        }
        const record = index_1.store.addFile({
            id: (0, uuid_1.v4)(),
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
        index_1.store.addAuditLog({
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
router.get('/:id/download', auth_1.withAuth, (req, res) => {
    const file = index_1.store.getFileById(req.params['id']);
    if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
    }
    if (file.cloudinaryPublicId) {
        /* Generate a 15-minute signed Cloudinary URL */
        const signedUrl = (0, cloudinary_1.getSignedUrl)(file.cloudinaryPublicId, file.mimeType);
        res.json({ url: signedUrl, fileName: file.originalName });
    }
    else {
        res.status(400).json({ error: 'File is a seed record and cannot be downloaded' });
    }
});
/* ─────────── DELETE /api/files/:id ─────────── */
router.delete('/:id', auth_1.withAuth, async (req, res) => {
    const ip = getIp(req);
    const file = index_1.store.getFileById(req.params['id']);
    if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
    }
    const user = req.user;
    if (file.uploadedBy !== user.sub && user.role !== 'admin') {
        res.status(403).json({ error: 'You do not have permission to delete this file' });
        return;
    }
    /* Delete from Cloudinary if stored there */
    if (file.cloudinaryPublicId) {
        try {
            await (0, cloudinary_1.deleteFromCloudinary)(file.cloudinaryPublicId, file.mimeType);
        }
        catch (e) {
            console.error('[Cloudinary] Delete error:', e);
        }
    }
    index_1.store.deleteFile(file.id);
    index_1.store.addAuditLog({
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
exports.default = router;
