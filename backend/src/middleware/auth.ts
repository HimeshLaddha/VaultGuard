import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyPreAuthToken, AccessPayload, PreAuthPayload } from '../utils/auth';
import { Role } from '../store/index';

/* Extend Express Request to carry decoded JWT */
declare global {
    namespace Express {
        interface Request {
            user?: AccessPayload;
            preAuthUser?: PreAuthPayload;
        }
    }
}

/* ── withAuth: validates full access token ── */
export const withAuth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.accessToken as string | undefined;
    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    try {
        const payload = verifyAccessToken(token);
        if (payload.type !== 'access') throw new Error('Invalid token type');
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }
};

/* ── withPreAuth: validates pre-auth token (after password, before MFA) ── */
export const withPreAuth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.preAuthToken as string | undefined;
    if (!token) {
        res.status(401).json({ error: 'Password verification required' });
        return;
    }
    try {
        const payload = verifyPreAuthToken(token);
        if (payload.type !== 'pre-auth') throw new Error('Invalid token type');
        req.preAuthUser = payload;
        next();
    } catch {
        res.status(401).json({ error: 'MFA session expired. Please log in again.' });
    }
};

/* ── withRole: RBAC — call AFTER withAuth ── */
export const withRole = (...roles: Role[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions. Admin access required.' });
            return;
        }
        next();
    };
