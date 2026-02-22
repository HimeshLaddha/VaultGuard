"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAccessCookie = exports.setPreAuthCookie = exports.verifyAccessToken = exports.verifyPreAuthToken = exports.signAccessToken = exports.signPreAuthToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME';
const JWT_PRE_AUTH_SECRET = process.env.JWT_PRE_AUTH_SECRET || 'CHANGE_ME_PRE';
/* ─── Sign ─── */
const signPreAuthToken = (payload) => jsonwebtoken_1.default.sign({ ...payload, type: 'pre-auth' }, JWT_PRE_AUTH_SECRET, { expiresIn: '5m' });
exports.signPreAuthToken = signPreAuthToken;
const signAccessToken = (payload) => jsonwebtoken_1.default.sign({ ...payload, type: 'access' }, JWT_SECRET, { expiresIn: '8h' });
exports.signAccessToken = signAccessToken;
/* ─── Verify ─── */
const verifyPreAuthToken = (token) => jsonwebtoken_1.default.verify(token, JWT_PRE_AUTH_SECRET);
exports.verifyPreAuthToken = verifyPreAuthToken;
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, JWT_SECRET);
exports.verifyAccessToken = verifyAccessToken;
/* ─── Cookie helpers ─── */
const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
};
const setPreAuthCookie = (res, token) => res.cookie('preAuthToken', token, { ...COOKIE_OPTS, maxAge: 5 * 60 * 1000 });
exports.setPreAuthCookie = setPreAuthCookie;
const setAccessCookie = (res, token) => res.cookie('accessToken', token, { ...COOKIE_OPTS, maxAge: 8 * 60 * 60 * 1000 });
exports.setAccessCookie = setAccessCookie;
const clearAuthCookies = (res) => {
    res.clearCookie('preAuthToken', { path: '/' });
    res.clearCookie('accessToken', { path: '/' });
};
exports.clearAuthCookies = clearAuthCookies;
