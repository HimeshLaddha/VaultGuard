"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLimiter = exports.uploadLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Auth limiter: max 10 attempts per 15 minutes per IP.
 * Prevents brute-force attacks on the login + MFA endpoints.
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
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
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Upload limit reached. You can upload up to 20 files per hour.' },
});
/**
 * Global API limiter: max 200 requests per 15 minutes per IP.
 * Broad DoS protection across all endpoints.
 */
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' },
});
