import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { LoginSchema, MfaSchema } from '../utils/validation';
import { signPreAuthToken, signAccessToken, setPreAuthCookie, setAccessCookie, clearAuthCookies } from '../utils/auth';
import { store } from '../store/index';
import { withAuth, withPreAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

/* Helper to get client IP */
const getIp = (req: Request): string =>
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';

/* ─────────────────── POST /api/auth/login ─────────────────── */
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
    const ip = getIp(req);

    /* 1. Validate input */
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
        return;
    }

    const { email, password } = parsed.data;

    /* 2. Find user */
    const user = store.findUserByEmail(email);

    /* 3. Generic error — never reveal whether email exists */
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        store.addAuditLog({
            event: 'failed_auth',
            userId: 'unknown',
            userEmail: email,
            ip,
            location: 'Unknown',
            severity: 'critical',
        });
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    /* 4. Issue pre-auth token (valid 5 min, MFA still pending) */
    const preAuthToken = signPreAuthToken({ sub: user.id, email: user.email });
    setPreAuthCookie(res, preAuthToken);

    store.addAuditLog({
        event: 'password_verified',
        userId: user.id,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });

    res.json({ message: 'Password verified. Proceed to MFA.', email: user.email });
});

/* ─────────────────── POST /api/auth/mfa ─────────────────── */
router.post('/mfa', authLimiter, withPreAuth, async (req: Request, res: Response): Promise<void> => {
    const ip = getIp(req);
    const preUser = req.preAuthUser!;

    /* 1. Validate code */
    const parsed = MfaSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
        return;
    }

    const { code } = parsed.data;
    const user = store.findUserById(preUser.sub);

    if (!user) {
        res.status(401).json({ error: 'Session invalid. Please log in again.' });
        return;
    }

    /* 2. Verify MFA code (mock: compare against stored secret) */
    if (code !== user.mfaSecret) {
        store.addAuditLog({
            event: 'mfa_failed',
            userId: user.id,
            userEmail: user.email,
            ip,
            location: 'Unknown',
            severity: 'warning',
        });
        res.status(401).json({ error: 'Invalid MFA code' });
        return;
    }

    /* 3. Issue full access token, clear pre-auth */
    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    });

    setAccessCookie(res, accessToken);
    res.clearCookie('preAuthToken', { path: '/' });

    store.addAuditLog({
        event: 'mfa_verified',
        userId: user.id,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });

    store.addAuditLog({
        event: 'user_login',
        userId: user.id,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });

    res.json({
        message: 'Authentication successful',
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
});

/* ─────────────────── POST /api/auth/logout ─────────────────── */
router.post('/logout', withAuth, (req: Request, res: Response): void => {
    const ip = getIp(req);
    store.addAuditLog({
        event: 'user_logout',
        userId: req.user!.sub,
        userEmail: req.user!.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });
    clearAuthCookies(res);
    res.json({ message: 'Logged out successfully' });
});

/* ─────────────────── GET /api/auth/me ─────────────────── */
router.get('/me', withAuth, (req: Request, res: Response): void => {
    const u = req.user!;
    res.json({ id: u.sub, email: u.email, name: u.name, role: u.role });
});

export default router;
