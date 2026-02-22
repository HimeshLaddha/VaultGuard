"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/* ─────────────────────────────── Seed Data ─────────────────────────── */
const adminHash = bcryptjs_1.default.hashSync('password123', 10);
const userHash = bcryptjs_1.default.hashSync('user1234', 10);
const ADMIN_ID = 'usr_admin_001';
const USER_ID = 'usr_user_002';
const users = [
    {
        id: ADMIN_ID,
        email: 'admin@vault.io',
        passwordHash: adminHash,
        name: 'Admin User',
        role: 'admin',
        mfaSecret: '247831', // fixed demo code
        isVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
    },
    {
        id: USER_ID,
        email: 'user@vault.io',
        passwordHash: userHash,
        name: 'Regular User',
        role: 'user',
        mfaSecret: '112233',
        isVerified: true,
        createdAt: '2025-06-01T00:00:00Z',
    },
];
const sizeLabel = (bytes) => bytes < 1048576
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1048576).toFixed(2)} MB`;
const files = [
    { id: (0, uuid_1.v4)(), name: 'q4_financial_report.pdf', originalName: 'Q4_Financial_Report.pdf', mimeType: 'application/pdf', size: 3355443, sizeLabel: '3.2 MB', uploadedBy: ADMIN_ID, uploadedByEmail: 'admin@vault.io', uploadedAt: '2026-02-20T03:44:00Z', encryptedBy: 'AES-256', status: 'secure', path: 'uploads/q4_financial_report.pdf' },
    { id: (0, uuid_1.v4)(), name: 'employee_contracts_2026.docx', originalName: 'Employee_Contracts_2026.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1887437, sizeLabel: '1.8 MB', uploadedBy: ADMIN_ID, uploadedByEmail: 'admin@vault.io', uploadedAt: '2026-02-19T12:12:00Z', encryptedBy: 'AES-256', status: 'secure', path: 'uploads/employee_contracts_2026.docx' },
    { id: (0, uuid_1.v4)(), name: 'infrastructure_diagram.png', originalName: 'Infrastructure_Diagram.png', mimeType: 'image/png', size: 5348147, sizeLabel: '5.1 MB', uploadedBy: ADMIN_ID, uploadedByEmail: 'admin@vault.io', uploadedAt: '2026-02-19T05:35:00Z', encryptedBy: 'AES-256', status: 'secure', path: 'uploads/infrastructure_diagram.png' },
    { id: (0, uuid_1.v4)(), name: 'compliance_audit_2025.pdf', originalName: 'Compliance_Audit_2025.pdf', mimeType: 'application/pdf', size: 9123456, sizeLabel: '8.7 MB', uploadedBy: ADMIN_ID, uploadedByEmail: 'admin@vault.io', uploadedAt: '2026-02-18T09:00:00Z', encryptedBy: 'AES-256', status: 'scanning', path: 'uploads/compliance_audit_2025.pdf' },
    { id: (0, uuid_1.v4)(), name: 'server_access_logs_jan.txt', originalName: 'Server_Access_Logs_Jan.txt', mimeType: 'text/plain', size: 943718, sizeLabel: '0.9 MB', uploadedBy: ADMIN_ID, uploadedByEmail: 'admin@vault.io', uploadedAt: '2026-02-17T16:45:00Z', encryptedBy: 'AES-256', status: 'flagged', path: 'uploads/server_access_logs_jan.txt' },
];
const auditLogs = [
    { id: (0, uuid_1.v4)(), event: 'user_login', userId: ADMIN_ID, userEmail: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', severity: 'info', timestamp: '2026-02-20T08:38:33Z' },
    { id: (0, uuid_1.v4)(), event: 'mfa_verified', userId: ADMIN_ID, userEmail: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', severity: 'info', timestamp: '2026-02-20T08:38:58Z' },
    { id: (0, uuid_1.v4)(), event: 'file_uploaded', userId: ADMIN_ID, userEmail: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', severity: 'info', timestamp: '2026-02-20T03:44:11Z', meta: { fileName: 'Q4_Financial_Report.pdf' } },
    { id: (0, uuid_1.v4)(), event: 'failed_auth', userId: 'unknown', userEmail: 'unknown@intruder.net', ip: '45.33.32.156', location: 'Amsterdam, NL', severity: 'critical', timestamp: '2026-02-19T18:12:07Z' },
    { id: (0, uuid_1.v4)(), event: 'failed_auth', userId: 'unknown', userEmail: 'unknown@intruder.net', ip: '45.33.32.156', location: 'Amsterdam, NL', severity: 'critical', timestamp: '2026-02-19T18:11:52Z' },
    { id: (0, uuid_1.v4)(), event: 'file_downloaded', userId: ADMIN_ID, userEmail: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', severity: 'info', timestamp: '2026-02-19T12:25:21Z' },
    { id: (0, uuid_1.v4)(), event: 'mfa_failed', userId: ADMIN_ID, userEmail: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', severity: 'warning', timestamp: '2026-02-19T09:10:00Z' },
    { id: (0, uuid_1.v4)(), event: 'file_flagged', userId: 'system', userEmail: 'system', ip: 'internal', location: '–', severity: 'critical', timestamp: '2026-02-17T16:45:10Z', meta: { fileName: 'Server_Access_Logs_Jan.txt' } },
];
/* ─────────────────────────────── Store API ─────────────────────────── */
exports.store = {
    /* Users */
    findUserByEmail: (email) => users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    findUserById: (id) => users.find((u) => u.id === id),
    addUser: (user) => { users.push(user); return user; },
    setUserMfa: (userId, code, expires) => {
        const u = users.find(u => u.id === userId);
        if (u) {
            u.mfaCode = code;
            u.mfaExpires = expires;
        }
    },
    clearUserMfa: (userId) => {
        const u = users.find(u => u.id === userId);
        if (u) {
            delete u.mfaCode;
            delete u.mfaExpires;
        }
    },
    verifyUser: (userId) => {
        const u = users.find(u => u.id === userId);
        if (u)
            u.isVerified = true;
    },
    /* Files */
    getFiles: () => [...files].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    getFileById: (id) => files.find((f) => f.id === id),
    addFile: (record) => { files.push(record); return record; },
    deleteFile: (id) => {
        const idx = files.findIndex((f) => f.id === id);
        if (idx === -1)
            return false;
        files.splice(idx, 1);
        return true;
    },
    /* Audit Logs */
    getAuditLogs: () => [...auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    addAuditLog: (entry) => {
        const log = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date().toISOString(),
            ...entry,
        };
        auditLogs.unshift(log);
        return log;
    },
};
