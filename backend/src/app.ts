import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { globalLimiter, uploadLimiter } from './middleware/rateLimit';

import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import auditRoutes from './routes/audit';

const app = express();

/* ── Security headers (Helmet) ───────────────────────────────────────────── */
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');

app.use(
    helmet({
        /* Content-Security-Policy — restricts resource origins */
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],   // inline styles required by some browsers
                imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
                connectSrc: ["'self'", ...allowedOrigins],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"],
            },
        },
        /* HTTP Strict Transport Security — force HTTPS for 1 year in production */
        hsts: process.env.NODE_ENV === 'production'
            ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
            : false,
        /* Clickjacking protection */
        frameguard: { action: 'deny' },
        /* Prevent MIME-type sniffing */
        noSniff: true,
        /* Don't leak referrer info across origins */
        referrerPolicy: { policy: 'no-referrer' },
        /* Hide X-Powered-By */
        hidePoweredBy: true,
    })
);

/* ── CORS ────────────────────────────────────────────────────────────────── */
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

/* ── Body parsers ────────────────────────────────────────────────────────── */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());

/* ── Request logging ─────────────────────────────────────────────────────── */
app.use(morgan('combined'));

/* ── Rate limiters ───────────────────────────────────────────────────────── */
app.use('/api/', globalLimiter);

/* ── Routes ──────────────────────────────────────────────────────────────── */
app.use('/api/auth', authRoutes);
app.use('/api/files/upload', uploadLimiter);  // apply upload limit before the router
app.use('/api/files', fileRoutes);
app.use('/api/audit', auditRoutes);

/* ── Health check ────────────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── 404 handler ─────────────────────────────────────────────────────────── */
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

/* ── Global error handler ────────────────────────────────────────────────── */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
});

export default app;
