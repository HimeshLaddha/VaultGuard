"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRole = exports.withPreAuth = exports.withAuth = void 0;
const auth_1 = require("../utils/auth");
/* ── withAuth: validates full access token ── */
const withAuth = (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    try {
        const payload = (0, auth_1.verifyAccessToken)(token);
        if (payload.type !== 'access')
            throw new Error('Invalid token type');
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }
};
exports.withAuth = withAuth;
/* ── withPreAuth: validates pre-auth token (after password, before MFA) ── */
const withPreAuth = (req, res, next) => {
    const token = req.cookies?.preAuthToken;
    if (!token) {
        res.status(401).json({ error: 'Password verification required' });
        return;
    }
    try {
        const payload = (0, auth_1.verifyPreAuthToken)(token);
        if (payload.type !== 'pre-auth')
            throw new Error('Invalid token type');
        req.preAuthUser = payload;
        next();
    }
    catch {
        res.status(401).json({ error: 'MFA session expired. Please log in again.' });
    }
};
exports.withPreAuth = withPreAuth;
/* ── withRole: RBAC — call AFTER withAuth ── */
const withRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions. Admin access required.' });
        return;
    }
    next();
};
exports.withRole = withRole;
