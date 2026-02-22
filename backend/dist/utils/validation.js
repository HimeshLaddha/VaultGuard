"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_FILE_SIZE = exports.ALLOWED_MIME_TYPES = exports.MfaSchema = exports.RegisterSchema = exports.LoginSchema = void 0;
exports.sanitizeFilename = sanitizeFilename;
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
/* ── Login ── */
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: 'Email is required' })
        .email({ message: 'Invalid email address' })
        .max(254)
        .transform((v) => v.toLowerCase().trim()),
    password: zod_1.z
        .string({ message: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(128),
});
/* ── Register ── */
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z
        .string({ message: 'Name is required' })
        .min(2, { message: 'Name must be at least 2 characters' })
        .max(50),
    email: zod_1.z
        .string({ message: 'Email is required' })
        .email({ message: 'Invalid email address' })
        .max(254)
        .transform((v) => v.toLowerCase().trim()),
    password: zod_1.z
        .string({ message: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(128)
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});
/* ── MFA ── */
exports.MfaSchema = zod_1.z.object({
    code: zod_1.z
        .string({ message: 'MFA code is required' })
        .regex(/^\d{6}$/, { message: 'MFA code must be exactly 6 digits' }),
});
/* ── File upload (metadata) ── */
exports.ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/plain',
];
exports.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
/**
 * Sanitize a filename:
 * - Strip directory traversal sequences
 * - Keep only safe characters
 * - Lowercase
 */
function sanitizeFilename(name) {
    const base = path_1.default.basename(name); // strip any directory parts
    return base
        .replace(/[^a-zA-Z0-9._\-]/g, '_') // replace unsafe chars
        .replace(/\.{2,}/g, '.') // collapse multiple dots
        .toLowerCase()
        .slice(0, 255); // max filename length
}
