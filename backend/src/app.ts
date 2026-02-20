import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import auditRoutes from './routes/audit';

const app = express();

/* ── Security headers ── */
app.use(helmet());

/* ── CORS: allow frontend origin with credentials ── */
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

/* ── Body parsers ── */
app.use(express.json({ limit: '1mb' }));        // limit JSON body size
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());

/* ── Request logging ── */
app.use(morgan('combined'));

/* ── Routes ── */
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/audit', auditRoutes);

/* ── Health check ── */
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── 404 handler ── */
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

/* ── Global error handler ── */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[ERROR]', err.message);
    // Never expose internal details to the client
    res.status(500).json({ error: 'An unexpected error occurred' });
});

export default app;
