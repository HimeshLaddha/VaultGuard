import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { LoginSchema, MfaSchema, RegisterSchema } from '../utils/validation';
import { signPreAuthToken, signAccessToken, setPreAuthCookie, setAccessCookie, clearAuthCookies } from '../utils/auth';
import { store, UserRecord as User } from '../store/index';
import { withAuth, withPreAuth, withRole } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { sendVerificationEmail } from '../utils/mailer';
import { v4 as uuid } from 'uuid';

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
    const user = await store.findUserByEmail(email);

    /* 3. Generic error — never reveal whether email exists */
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        await store.addAuditLog({
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

    /* 3.5 Check Approval Status */
    if (user.status !== 'APPROVED') {
        res.status(403).json({
            error: 'Account pending approval. Please contact an administrator.',
            code: 'PENDING_APPROVAL'
        });
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

    /* 5. Generate and send MFA code */
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    const mfaExpires = Date.now() + 5 * 60 * 1000;

    // Store it (we'll use mfaCode field for consistency with registration)
    await store.setUserMfa(user.id, mfaCode, mfaExpires);

    // Send email (async)
    console.log(`[AUTH] Sending MFA code to: ${user.email} (User: ${user.name})`);
    await sendVerificationEmail(user.email, mfaCode);

    await store.addAuditLog({
        event: 'password_verified',
        userId: user.id,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });

    res.json({ message: 'Password verified. MFA code sent to your email.', email: user.email });
});

/* ─────────────────── POST /api/auth/register ───────────────── */
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
    const ip = getIp(req);

    /* 1. Validate input */
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
        return;
    }

    const { name, email, password } = parsed.data;

    /* 2. Check if user exists */
    const existing = await store.findUserByEmail(email);
    if (existing) {
        // Generic response to avoid email leakage
        res.status(201).json({ message: 'Verification code sent to your email.' });
        return;
    }

    /* 3. Create user (unverified) */
    const passwordHash = await bcrypt.hash(password, 10);
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    const mfaExpires = Date.now() + 5 * 60 * 1000; // 5 mins

    const newUser: User = {
        id: uuid(),
        email,
        passwordHash,
        name,
        role: 'user',
        mfaCode,
        mfaExpires,
        isVerified: false,
        status: 'PENDING',
        createdAt: new Date(),
    };

    await store.addUser(newUser);

    /* 4. Send email */
    await sendVerificationEmail(email, mfaCode);

    await store.addAuditLog({
        event: 'user_registered',
        userId: newUser.id,
        userEmail: email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });

    res.status(201).json({ message: 'Verification code sent to your email.', email });
});

/* ─────────────────── POST /api/auth/verify-email ─────────────── */
router.post('/verify-email', authLimiter, async (req: Request, res: Response): Promise<void> => {
    const ip = getIp(req);
    const { email, code } = req.body;

    if (!email || !code) {
        res.status(400).json({ error: 'Email and code are required' });
        return;
    }

    const user = await store.findUserByEmail(email);

    if (!user || user.isVerified || user.mfaCode !== code || (user.mfaExpires && Date.now() > user.mfaExpires)) {
        res.status(401).json({ error: 'Invalid or expired verification code' });
        return;
    }

    /* Verify user */
    await store.verifyUser(user.id);
    await store.clearUserMfa(user.id);

    /* Issue full access token */
    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
    });

    setAccessCookie(res, accessToken);

    await store.addAuditLog({
        event: 'email_verified',
        userId: user.id,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });

    res.json({
        message: 'Email verified successfully',
        user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status },
    });
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
    const user = await store.findUserById(preUser.sub);

    if (!user) {
        res.status(401).json({ error: 'Session invalid. Please log in again.' });
        return;
    }

    /* 2. Verify MFA code */
    const isValidCode = (code === user.mfaSecret) ||
        (code === user.mfaCode && user.mfaExpires && Date.now() < user.mfaExpires);

    if (!isValidCode) {
        await store.addAuditLog({
            event: 'mfa_failed',
            userId: user.id,
            userEmail: user.email,
            ip,
            location: 'Unknown',
            severity: 'warning',
        });
        res.status(401).json({ error: 'Invalid or expired MFA code' });
        return;
    }

    // Clear dynamic code after use
    await store.clearUserMfa(user.id);

    /* 3. Issue full access token, clear pre-auth */
    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
    });

    setAccessCookie(res, accessToken);
    res.clearCookie('preAuthToken', { path: '/' });

    await store.addAuditLog({
        event: 'mfa_verified',
        userId: user.id,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });

    await store.addAuditLog({
        event: 'user_login',
        userId: user.id,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });

    res.json({
        message: 'Authentication successful',
        user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status },
    });
});

/* ─────────────────── POST /api/auth/logout ─────────────────── */
router.post('/logout', withAuth, async (req: Request, res: Response): Promise<void> => {
    const ip = getIp(req);
    await store.addAuditLog({
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
    res.json({ id: u.sub, email: u.email, name: u.name, role: u.role, status: u.status });
});

/* ─────────────────── Admin Approval Routes ─────────────────── */

/**
 * GET /api/auth/pending-users
 * Returns a list of users whose account is still PENDING approval.
 */
router.get('/pending-users', withAuth, withRole('admin'), async (req: Request, res: Response): Promise<void> => {
    const pending = await store.getPendingUsers();
    res.json(pending.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        status: u.status,
        createdAt: u.createdAt
    })));
});

/**
 * POST /api/auth/approve-user
 * Approves a pending user.
 */
router.post('/approve-user', withAuth, withRole('admin'), async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.body;
    if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
    }

    const user = await store.findUserById(userId);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    await store.setUserStatus(userId, 'APPROVED');

    await store.addAuditLog({
        event: 'user_approved',
        userId: req.user!.sub,
        userEmail: req.user!.email,
        ip: getIp(req),
        location: 'Unknown',
        severity: 'info',
        meta: { approvedUserId: userId, approvedUserEmail: user.email }
    });

    res.json({ message: `User ${user.email} has been approved.` });
});

export default router;
