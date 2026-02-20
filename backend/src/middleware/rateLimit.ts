import rateLimit from 'express-rate-limit';

/**
 * Auth limiter: max 10 attempts per 15 minutes per IP.
 * Prevents brute-force attacks on the login + MFA endpoints.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
    skipSuccessfulRequests: false,
});

/**
 * Upload limiter: max 20 uploads per hour per IP.
 * Prevents DoS via repeated large file uploads.
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,   // 1 hour
    max: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Upload limit reached. You can upload up to 20 files per hour.' },
});

/**
 * Global API limiter: max 200 requests per 15 minutes per IP.
 * Broad DoS protection across all endpoints.
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' },
});
