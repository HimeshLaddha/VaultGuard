import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import File, { IFile } from '../models/File';
import AuditLog from '../models/AuditLog';

/* ─────────────────────────────── Types ─────────────────────────────── */
export type Role = 'admin' | 'user';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Keep the interfaces for external use, but the models will implement Document
export interface UserRecord {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: Role;
    mfaSecret?: string;
    mfaCode?: string;
    mfaExpires?: number;
    isVerified: boolean;
    status: UserStatus;
    createdAt: Date;
}

export interface FileRecord {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    sizeLabel: string;
    uploadedBy: string;
    uploadedByEmail: string;
    uploadedAt: Date;
    encryptedBy: string;
    status: 'secure' | 'scanning' | 'flagged';
    path: string;
    cloudinaryPublicId?: string;
    cloudUrl?: string;
}

export interface AuditLogEntry {
    id: string; // We'll map the Mongoose _id or keep the custom id field
    event: string;
    userId: string;
    userEmail: string;
    ip: string;
    location: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: Date;
    meta?: Record<string, unknown>;
}

/* ─────────────────────────────── Seed Utility ────────────────────────── */

export const seedDatabase = async () => {
    const adminExists = await User.findOne({ email: 'admin@vault.io' });
    if (!adminExists) {
        console.log('Seeding default Admin user...');
        const adminHash = await bcrypt.hash('password123', 10);
        await User.create({
            id: 'usr_admin_01',
            email: 'admin@vault.io',
            passwordHash: adminHash,
            name: 'Admin User',
            role: 'admin',
            mfaSecret: '247831',
            isVerified: true,
            status: 'APPROVED',
        });
    }

    const userExists = await User.findOne({ email: 'user@vault.io' });
    if (!userExists) {
        console.log('Seeding default Regular user...');
        const userHash = await bcrypt.hash('user1234', 10);
        await User.create({
            id: 'usr_user_02',
            email: 'user@vault.io',
            passwordHash: userHash,
            name: 'Regular User',
            role: 'user',
            mfaSecret: '112233',
            isVerified: true,
            status: 'APPROVED',
        });
    }

    // Seed mock files
    const filesCount = await File.countDocuments();
    if (filesCount === 0) {
        console.log('Seeding legacy mock files...');
        const mockFiles = [
            { name: 'Q4_Financial_Report.pdf', size: 3.2, type: 'PDF', uploadedAt: '2026-02-20 09:14', status: 'secure' },
            { name: 'Employee_Contracts_2026.docx', size: 1.8, type: 'DOCX', uploadedAt: '2026-02-19 17:42', status: 'secure' },
            { name: 'Infrastructure_Diagram.png', size: 5.1, type: 'PNG', uploadedAt: '2026-02-19 11:05', status: 'secure' },
            { name: 'Compliance_Audit_2025.pdf', size: 8.7, type: 'PDF', uploadedAt: '2026-02-18 14:30', status: 'scanning' },
            { name: 'Product_Roadmap_Confidential.docx', size: 2.4, type: 'DOCX', uploadedAt: '2026-02-18 08:21', status: 'secure' },
            { name: 'Server_Access_Logs_Jan.txt', size: 0.9, type: 'TXT', uploadedAt: '2026-02-17 22:15', status: 'flagged' },
            { name: 'Board_Meeting_Minutes.pdf', size: 1.1, type: 'PDF', uploadedAt: '2026-02-17 16:48', status: 'secure' },
            { name: 'API_Keys_Backup.txt', size: 0.2, type: 'TXT', uploadedAt: '2026-02-16 10:33', status: 'flagged' },
        ];

        for (const f of mockFiles) {
            const mimeMap: Record<string, string> = {
                'PDF': 'application/pdf',
                'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'PNG': 'image/png',
                'TXT': 'text/plain'
            };
            await File.create({
                id: uuid(),
                name: f.name,
                originalName: f.name,
                mimeType: mimeMap[f.type] || 'application/octet-stream',
                size: f.size * 1024 * 1024,
                sizeLabel: `${f.size} MB`,
                uploadedBy: 'usr_admin_01',
                uploadedByEmail: 'admin@vault.io',
                uploadedAt: new Date(f.uploadedAt),
                encryptedBy: 'AES-256',
                status: f.status,
                path: 'in-memory-only'
            });
        }
    }

    // Seed mock audit logs
    const logsCount = await AuditLog.countDocuments();
    if (logsCount === 0) {
        console.log('Seeding legacy mock audit logs...');
        const mockLogs = [
            { event: 'User Login', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-20 14:08:33', severity: 'info' },
            { event: 'File Uploaded', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-20 09:14:11', severity: 'info' },
            { event: 'MFA Verified', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-20 09:13:58', severity: 'info' },
            { event: 'Failed Login Attempt', user: 'unknown@intruder.net', ip: '45.33.32.156', location: 'Amsterdam, NL', timestamp: '2026-02-19 23:42:07', severity: 'critical' },
            { event: 'Failed Login Attempt', user: 'unknown@intruder.net', ip: '45.33.32.156', location: 'Amsterdam, NL', timestamp: '2026-02-19 23:41:52', severity: 'critical' },
            { event: 'File Downloaded', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-19 17:55:21', severity: 'info' },
            { event: 'Password Changed', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-19 12:30:00', severity: 'warning' },
            { event: 'API Key Accessed', user: 'admin@vault.io', ip: '10.0.0.15', location: 'New York, US', timestamp: '2026-02-18 08:25:44', severity: 'warning' },
            { event: 'File Flagged', user: 'system', ip: 'internal', location: '–', timestamp: '2026-02-17 22:15:10', severity: 'critical' },
            { event: 'User Logout', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-17 18:00:00', severity: 'info' },
            { event: 'MFA Code Resent', user: 'admin@vault.io', ip: '192.168.1.101', location: 'New York, US', timestamp: '2026-02-17 09:33:19', severity: 'info' },
            { event: 'New Session Started', user: 'admin@vault.io', ip: '192.168.1.102', location: 'New York, US', timestamp: '2026-02-16 08:10:05', severity: 'info' },
        ];

        for (const l of mockLogs) {
            await AuditLog.create({
                id: uuid(),
                event: l.event.toLowerCase().replace(/ /g, '_'),
                userEmail: l.user,
                userId: l.user === 'admin@vault.io' ? 'usr_admin_01' : 'system',
                ip: l.ip,
                location: l.location,
                severity: l.severity,
                timestamp: new Date(l.timestamp)
            });
        }
    }
};

/* ─────────────────────────────── Store API ─────────────────────────── */
export const store = {
    /* Users */
    findUserByEmail: async (email: string) =>
        await User.findOne({ email: email.toLowerCase() }),

    findUserById: async (id: string) =>
        await User.findOne({ id }) || await User.findById(id),

    addUser: async (userData: any) => {
        const user = new User(userData);
        return await user.save();
    },

    setUserMfa: async (userId: string, code: string, expires: number) => {
        await User.findOneAndUpdate({ id: userId }, { mfaCode: code, mfaExpires: expires });
    },

    clearUserMfa: async (userId: string) => {
        await User.findOneAndUpdate({ id: userId }, { $unset: { mfaCode: 1, mfaExpires: 1 } });
    },

    verifyUser: async (userId: string) => {
        await User.findOneAndUpdate({ id: userId }, { isVerified: true });
    },

    setUserStatus: async (userId: string, status: UserStatus) => {
        await User.findOneAndUpdate({ id: userId }, { status });
    },

    getPendingUsers: async () =>
        await User.find({ status: 'PENDING' }),

    /* Files */
    getFiles: async () =>
        await File.find().sort({ uploadedAt: -1 }),

    getFileById: async (id: string) =>
        await File.findOne({ id }) || await File.findById(id),

    addFile: async (fileData: any) => {
        const file = new File(fileData);
        return await file.save();
    },

    deleteFile: async (id: string) => {
        const res = await File.deleteOne({ id });
        return res.deletedCount > 0;
    },

    /* Audit Logs */
    getAuditLogs: async () =>
        await AuditLog.find().sort({ timestamp: -1 }),

    addAuditLog: async (entry: any) => {
        const log = new AuditLog({
            ...entry,
            id: uuid()
        });
        return await log.save();
    },
};
