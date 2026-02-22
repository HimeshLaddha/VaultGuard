import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { Role, UserStatus } from '../store/index';

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME';
const JWT_PRE_AUTH_SECRET = process.env.JWT_PRE_AUTH_SECRET || 'CHANGE_ME_PRE';

/* ─── Token Payloads ─── */
export interface PreAuthPayload {
    sub: string;    // user id
    email: string;
    type: 'pre-auth';
}

export interface AccessPayload {
    sub: string;
    email: string;
    name: string;
    role: Role;
    status: UserStatus;
    type: 'access';
}

/* ─── Sign ─── */
export const signPreAuthToken = (payload: Omit<PreAuthPayload, 'type'>): string =>
    jwt.sign({ ...payload, type: 'pre-auth' }, JWT_PRE_AUTH_SECRET, { expiresIn: '5m' });

export const signAccessToken = (payload: Omit<AccessPayload, 'type'>): string =>
    jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, { expiresIn: '8h' });

/* ─── Verify ─── */
export const verifyPreAuthToken = (token: string): PreAuthPayload =>
    jwt.verify(token, JWT_PRE_AUTH_SECRET) as PreAuthPayload;

export const verifyAccessToken = (token: string): AccessPayload =>
    jwt.verify(token, JWT_SECRET) as AccessPayload;

/* ─── Cookie helpers ─── */
const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
};

export const setPreAuthCookie = (res: Response, token: string) =>
    res.cookie('preAuthToken', token, { ...COOKIE_OPTS, maxAge: 5 * 60 * 1000 });

export const setAccessCookie = (res: Response, token: string) =>
    res.cookie('accessToken', token, { ...COOKIE_OPTS, maxAge: 8 * 60 * 60 * 1000 });

export const clearAuthCookies = (res: Response) => {
    res.clearCookie('preAuthToken', { path: '/' });
    res.clearCookie('accessToken', { path: '/' });
};
