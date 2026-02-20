import { z } from 'zod';
import path from 'path';

/* ── Login ── */
export const LoginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email address')
        .max(254)
        .transform((v) => v.toLowerCase().trim()),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .max(128),
});

/* ── MFA ── */
export const MfaSchema = z.object({
    code: z
        .string({ required_error: 'MFA code is required' })
        .regex(/^\d{6}$/, 'MFA code must be exactly 6 digits'),
});

/* ── File upload (metadata) ── */
export const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/plain',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Sanitize a filename:
 * - Strip directory traversal sequences
 * - Keep only safe characters
 * - Lowercase
 */
export function sanitizeFilename(name: string): string {
    const base = path.basename(name);           // strip any directory parts
    return base
        .replace(/[^a-zA-Z0-9._\-]/g, '_')        // replace unsafe chars
        .replace(/\.{2,}/g, '.')                   // collapse multiple dots
        .toLowerCase()
        .slice(0, 255);                            // max filename length
}

export type LoginInput = z.infer<typeof LoginSchema>;
export type MfaInput = z.infer<typeof MfaSchema>;
