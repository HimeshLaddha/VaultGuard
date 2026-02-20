import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

/* ─────────────────────────────── Types ─────────────────────────────── */
export type Role = 'admin' | 'user';

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: Role;
    mfaSecret: string; // TOTP secret (mock: static 6-digit code)
    createdAt: string;
}

export interface FileRecord {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    sizeLabel: string;
    uploadedBy: string; // user id
    uploadedByEmail: string;
    uploadedAt: string;
    encryptedBy: string;
    status: 'secure' | 'scanning' | 'flagged';
    path: string;            // kept for backward compat with seed data
    cloudinaryPublicId?: string;  // set when stored in Cloudinary
    cloudUrl?: string;            // Cloudinary secure URL
}

export type Severity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
    id: string;
    event: string;
    userId: string;
    userEmail: string;
    ip: string;
    location: string;
    severity: Severity;
    timestamp: string; // UTC ISO string
    meta?: Record<string, unknown>;
}

/* ─────────────────────────────── Seed Data ─────────────────────────── */

const adminHash = bcrypt.hashSync('password123', 10);
const userHash = bcrypt.hashSync('user1234', 10);

const ADMIN_ID = 'usr_admin_001';
const USER_ID = 'usr_user_002';

const users: User[] = [
    {
        id: ADMIN_ID,
        email: 'admin@vault.io',
        passwordHash: adminHash,
        name: 'Admin User',
        role: 'admin',
        mfaSecret: '247831', // fixed demo code
        createdAt: '2025-01-01T00:00:00Z',
    },
    {
        id: USER_ID,
        email: 'user@vault.io',
        passwordHash: userHash,
        name: 'Regular User',
        role: 'user',
        mfaSecret: '112233',
        createdAt: '2025-06-01T00:00:00Z',
    },
];

const sizeLabel = (bytes: number) =>
    bytes < 1_048_576
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / 1_048_576).toFixed(2)} MB`;

const files: FileRecord[] = [
    { id: uuid(), name: 'q4_financial_report.pdf', originalName: 'Q4_Financial_Report.pdf', mimeType: 'application/pdf', size: 3_355_443, sizeLabel: '3.2 MB', uploadedBy: ADMIN_ID, uploadedByEmail: 'admin@vault.io', uploadedAt: '2026-02-20T03:44:00Z', encryptedBy: 'AES-256', status: 'secure', path: 'uploads/q4_financial_report.pdf' },
    { id: uuid(), name: 'employee_contracts_2026.docx', originalName: 'Employee_Contracts_2026.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1_887_437, sizeLabel: '1.8 MB', uploadedBy: ADMIN_ID, uploadedByEmail: 'admin@vault.io', uploadedAt: '2026-02-19T12:12:00Z', encryptedBy: 'AES-256', status: 'secure', path: 'uploads/employee_contracts_2026.docx' },
    { id: uuid(), name: 'infrastructure_diagram.png', originalName: 'Infrastructure_Diagram.png', mimeType: 'image/png', size: 5_348_147, sizeLabel: '5.1 MB', uploadedBy: ADMIN_ID, uploadedByEmail: 'admin@vault.io', uploadedAt: '2026-02-19T05:35:00Z', encryptedBy: 'AES-256', status: 'secure', path: 'uploads/infrastructure_diagram.png' },
    { id: uuid(), name: 'compliance_audit_2025.pdf', originalName: 'Compliance_Audit_2025.pdf', mimeType: 'application/pdf', size: 9_123_456, sizeLabel: '8.7 MB', uploadedBy: ADMIN_ID, uploadedByEmail: 'admin@vault.io', uploadedAt: '2026-02-18T09:00:00Z', encryptedBy: 'AES-256', status: 'scanning', path: 'uploads/compliance_audit_2025.pdf' },
    { id: uuid(), name: 'server_access_logs_jan.txt', originalName: 'Server_Access_Logs_Jan.txt', mimeType: 'text/plain', size: 943_718, sizeLabel: '0.9 MB', uploadedBy: ADMIN_ID, uploadedByEmail: 'admin@vault.io', uploadedAt: '2026-02-17T16:45:00Z', encryptedBy: 'AES-256', status: 'flagged', path: 'uploads/server_access_logs_jan.txt' },
];

const auditLogs: AuditLogEntry[] = [
    { id: uuid(), event: 'user_login', userId: ADMIN_ID, userEmail: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', severity: 'info', timestamp: '2026-02-20T08:38:33Z' },
    { id: uuid(), event: 'mfa_verified', userId: ADMIN_ID, userEmail: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', severity: 'info', timestamp: '2026-02-20T08:38:58Z' },
    { id: uuid(), event: 'file_uploaded', userId: ADMIN_ID, userEmail: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', severity: 'info', timestamp: '2026-02-20T03:44:11Z', meta: { fileName: 'Q4_Financial_Report.pdf' } },
    { id: uuid(), event: 'failed_auth', userId: 'unknown', userEmail: 'unknown@intruder.net', ip: '45.33.32.156', location: 'Amsterdam, NL', severity: 'critical', timestamp: '2026-02-19T18:12:07Z' },
    { id: uuid(), event: 'failed_auth', userId: 'unknown', userEmail: 'unknown@intruder.net', ip: '45.33.32.156', location: 'Amsterdam, NL', severity: 'critical', timestamp: '2026-02-19T18:11:52Z' },
    { id: uuid(), event: 'file_downloaded', userId: ADMIN_ID, userEmail: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', severity: 'info', timestamp: '2026-02-19T12:25:21Z' },
    { id: uuid(), event: 'mfa_failed', userId: ADMIN_ID, userEmail: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', severity: 'warning', timestamp: '2026-02-19T09:10:00Z' },
    { id: uuid(), event: 'file_flagged', userId: 'system', userEmail: 'system', ip: 'internal', location: '–', severity: 'critical', timestamp: '2026-02-17T16:45:10Z', meta: { fileName: 'Server_Access_Logs_Jan.txt' } },
];

/* ─────────────────────────────── Store API ─────────────────────────── */
export const store = {
    /* Users */
    findUserByEmail: (email: string) =>
        users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    findUserById: (id: string) => users.find((u) => u.id === id),

    /* Files */
    getFiles: () => [...files].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    getFileById: (id: string) => files.find((f) => f.id === id),
    addFile: (record: FileRecord) => { files.push(record); return record; },
    deleteFile: (id: string) => {
        const idx = files.findIndex((f) => f.id === id);
        if (idx === -1) return false;
        files.splice(idx, 1);
        return true;
    },

    /* Audit Logs */
    getAuditLogs: () => [...auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
        const log: AuditLogEntry = {
            id: uuid(),
            timestamp: new Date().toISOString(),
            ...entry,
        };
        auditLogs.unshift(log);
        return log;
    },
};
