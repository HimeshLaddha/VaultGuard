"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validation_1 = require("../utils/validation");
const auth_1 = require("../utils/auth");
const index_1 = require("../store/index");
const auth_2 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const mailer_1 = require("../utils/mailer");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
/* Helper to get client IP */
const getIp = (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
router.get('/ping', (req, res) => { res.json({ message: 'pong' }); });
/* ─────────────────── POST /api/auth/login ─────────────────── */
router.post('/login', rateLimit_1.authLimiter, async (req, res) => {
    const ip = getIp(req);
    /* 1. Validate input */
    const parsed = validation_1.LoginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
        return;
    }
    const { email, password } = parsed.data;
    /* 2. Find user */
    const user = index_1.store.findUserByEmail(email);
    /* 3. Generic error — never reveal whether email exists */
    if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
        index_1.store.addAuditLog({
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
    const preAuthToken = (0, auth_1.signPreAuthToken)({ sub: user.id, email: user.email });
    (0, auth_1.setPreAuthCookie)(res, preAuthToken);
    index_1.store.addAuditLog({
        event: 'password_verified',
        userId: user.id,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });
    res.json({ message: 'Password verified. Proceed to MFA.', email: user.email });
});
/* ─────────────────── POST /api/auth/register ───────────────── */
router.post('/register', rateLimit_1.authLimiter, async (req, res) => {
    const ip = getIp(req);
    /* 1. Validate input */
    const parsed = validation_1.RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
        return;
    }
    const { name, email, password } = parsed.data;
    /* 2. Check if user exists */
    const existing = index_1.store.findUserByEmail(email);
    if (existing) {
        // Generic response to avoid email leakage
        res.status(201).json({ message: 'Verification code sent to your email.' });
        return;
    }
    /* 3. Create user (unverified) */
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    const mfaExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    const newUser = {
        id: (0, uuid_1.v4)(),
        email,
        passwordHash,
        name,
        role: 'user',
        mfaCode,
        mfaExpires,
        isVerified: false,
        createdAt: new Date().toISOString(),
    };
    index_1.store.addUser(newUser);
    /* 4. Send email */
    await (0, mailer_1.sendVerificationEmail)(email, mfaCode);
    index_1.store.addAuditLog({
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
router.post('/verify-email', rateLimit_1.authLimiter, async (req, res) => {
    const ip = getIp(req);
    const { email, code } = req.body;
    if (!email || !code) {
        res.status(400).json({ error: 'Email and code are required' });
        return;
    }
    const user = index_1.store.findUserByEmail(email);
    if (!user || user.isVerified || user.mfaCode !== code || (user.mfaExpires && Date.now() > user.mfaExpires)) {
        res.status(401).json({ error: 'Invalid or expired verification code' });
        return;
    }
    /* Verify user */
    index_1.store.verifyUser(user.id);
    index_1.store.clearUserMfa(user.id);
    /* Issue full access token */
    const accessToken = (0, auth_1.signAccessToken)({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    });
    (0, auth_1.setAccessCookie)(res, accessToken);
    index_1.store.addAuditLog({
        event: 'email_verified',
        userId: user.id,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });
    res.json({
        message: 'Email verified successfully',
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
});
/* ─────────────────── POST /api/auth/mfa ─────────────────── */
router.post('/mfa', rateLimit_1.authLimiter, auth_2.withPreAuth, async (req, res) => {
    const ip = getIp(req);
    const preUser = req.preAuthUser;
    /* 1. Validate code */
    const parsed = validation_1.MfaSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
        return;
    }
    const { code } = parsed.data;
    const user = index_1.store.findUserById(preUser.sub);
    if (!user) {
        res.status(401).json({ error: 'Session invalid. Please log in again.' });
        return;
    }
    /* 2. Verify MFA code (mock: compare against stored secret) */
    if (code !== user.mfaSecret) {
        index_1.store.addAuditLog({
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
    const accessToken = (0, auth_1.signAccessToken)({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    });
    (0, auth_1.setAccessCookie)(res, accessToken);
    res.clearCookie('preAuthToken', { path: '/' });
    index_1.store.addAuditLog({
        event: 'mfa_verified',
        userId: user.id,
        userEmail: user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });
    index_1.store.addAuditLog({
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
router.post('/logout', auth_2.withAuth, (req, res) => {
    const ip = getIp(req);
    index_1.store.addAuditLog({
        event: 'user_logout',
        userId: req.user.sub,
        userEmail: req.user.email,
        ip,
        location: 'Unknown',
        severity: 'info',
    });
    (0, auth_1.clearAuthCookies)(res);
    res.json({ message: 'Logged out successfully' });
});
/* ─────────────────── GET /api/auth/me ─────────────────── */
router.get('/me', auth_2.withAuth, (req, res) => {
    const u = req.user;
    res.json({ id: u.sub, email: u.email, name: u.name, role: u.role });
});
exports.default = router;
