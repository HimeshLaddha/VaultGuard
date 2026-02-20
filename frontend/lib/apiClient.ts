/* Typed API client for VaultGuard backend.
   All requests include credentials: 'include' to send HTTP-only cookies. */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...init.headers },
        credentials: 'include',
        ...init,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data as T;
}

/* ── Auth ── */
export const api = {
    login: (email: string, password: string) =>
        request<{ message: string; email: string }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    verifyMfa: (code: string) =>
        request<{ message: string; user: { id: string; email: string; name: string; role: string } }>(
            '/api/auth/mfa',
            { method: 'POST', body: JSON.stringify({ code }) }
        ),

    logout: () =>
        request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

    me: () =>
        request<{ id: string; email: string; name: string; role: string }>('/api/auth/me'),

    /* ── Files ── */
    getFiles: () => request<FileRecord[]>('/api/files'),

    uploadFile: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return fetch(`${BASE}/api/files/upload`, {
            method: 'POST',
            credentials: 'include',
            body: form, // no Content-Type header — browser sets multipart boundary
        }).then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            return data as FileRecord;
        });
    },

    deleteFile: (id: string) =>
        request<{ ok: boolean; message: string }>(`/api/files/${id}`, { method: 'DELETE' }),

    /* ── Audit ── */
    getAuditLogs: () => request<AuditLogEntry[]>('/api/audit'),
};

/* ── Shared types (mirrors backend) ── */
export interface FileRecord {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    sizeLabel: string;
    uploadedBy: string;
    uploadedByEmail: string;
    uploadedAt: string;
    encryptedBy: string;
    status: 'secure' | 'scanning' | 'flagged';
}

export interface AuditLogEntry {
    id: string;
    event: string;
    userId: string;
    userEmail: string;
    ip: string;
    location: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: string;
    meta?: Record<string, unknown>;
}
