"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const rateLimit_1 = require("./middleware/rateLimit");
const auth_1 = __importDefault(require("./routes/auth"));
const files_1 = __importDefault(require("./routes/files"));
const audit_1 = __importDefault(require("./routes/audit"));
const app = (0, express_1.default)();
/* ── Security headers (Helmet) ───────────────────────────────────────────── */
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
app.use((0, helmet_1.default)({
    /* Content-Security-Policy — restricts resource origins */
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // inline styles required by some browsers
            imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
            connectSrc: ["'self'", ...allowedOrigins],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
        },
    },
    /* HTTP Strict Transport Security — force HTTPS for 1 year in production */
    hsts: process.env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    /* Clickjacking protection */
    frameguard: { action: 'deny' },
    /* Prevent MIME-type sniffing */
    noSniff: true,
    /* Don't leak referrer info across origins */
    referrerPolicy: { policy: 'no-referrer' },
    /* Hide X-Powered-By */
    hidePoweredBy: true,
}));
/* ── CORS ────────────────────────────────────────────────────────────────── */
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin))
            cb(null, true);
        else
            cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
/* ── Body parsers ────────────────────────────────────────────────────────── */
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: false, limit: '1mb' }));
app.use((0, cookie_parser_1.default)());
/* ── Request logging ─────────────────────────────────────────────────────── */
app.use((0, morgan_1.default)('combined'));
/* ── Rate limiters ───────────────────────────────────────────────────────── */
app.use('/api/', rateLimit_1.globalLimiter);
/* ── Routes ──────────────────────────────────────────────────────────────── */
app.use('/api/auth', auth_1.default);
app.use('/api/files/upload', rateLimit_1.uploadLimiter); // apply upload limit before the router
app.use('/api/files', files_1.default);
app.use('/api/audit', audit_1.default);
/* ── Health check ────────────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
/* ── 404 handler ─────────────────────────────────────────────────────────── */
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
/* ── Global error handler ────────────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
});
exports.default = app;
