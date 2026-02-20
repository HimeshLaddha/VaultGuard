'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import FileTable from '@/components/FileTable';
import AuditLogTable from '@/components/AuditLogTable';
import { HardDrive, Files, Clock, Monitor, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import { api, FileRecord, AuditLogEntry } from '@/lib/apiClient';

export default function DashboardPage() {
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [fileError, setFileError] = useState('');
    const [auditError, setAuditError] = useState('');

    useEffect(() => {
        api.getFiles()
            .then(setFiles)
            .catch(e => setFileError(e.message))
            .finally(() => setLoadingFiles(false));

        api.getAuditLogs()
            .then(setAuditLogs)
            .catch(e => setAuditError(e.message))
            .finally(() => setLoadingLogs(false));
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await api.deleteFile(id);
            setFiles(prev => prev.filter(f => f.id !== id));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        }
    };

    const flaggedCount = files.filter(f => f.status === 'flagged').length;
    const scanningCount = files.filter(f => f.status === 'scanning').length;
    const securityStatus = flaggedCount > 0 ? 'warning' : 'secure';

    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    const storageLabel = totalBytes < 1_048_576
        ? `${(totalBytes / 1024).toFixed(1)} KB`
        : `${(totalBytes / 1_048_576).toFixed(1)} MB`;

    const lastLogin = auditLogs.find(l => l.event === 'user_login');
    const lastLoginTime = lastLogin
        ? new Date(lastLogin.timestamp).toLocaleTimeString()
        : '–';

    const stats = [
        { label: 'Total Files', value: files.length.toString(), icon: Files, color: '#00c8ff', bg: 'rgba(0,200,255,0.1)' },
        { label: 'Storage Used', value: storageLabel, icon: HardDrive, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
        { label: 'Last Login', value: lastLoginTime, icon: Clock, color: '#00e676', bg: 'rgba(0,230,118,0.1)' },
        { label: 'Active Sessions', value: '1', icon: Monitor, color: '#ffab40', bg: 'rgba(255,171,64,0.1)' },
    ];

    /* Map API FileRecord → FileTable's expected shape */
    const mappedFiles = files.map(f => ({
        id: f.id,
        name: f.originalName,
        size: f.sizeLabel,
        type: f.mimeType.split('/').pop()?.toUpperCase().replace('VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT', 'DOCX') || 'FILE',
        uploadedAt: new Date(f.uploadedAt).toLocaleString(),
        encryptedBy: f.encryptedBy,
        status: f.status,
    }));

    /* Map API AuditLogEntry → AuditLogTable's expected shape */
    const mappedLogs = auditLogs.map(l => ({
        id: l.id,
        event: l.event.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        user: l.userEmail,
        ip: l.ip,
        location: l.location,
        timestamp: new Date(l.timestamp).toLocaleString(),
        severity: l.severity,
    }));

    return (
        <div className="flex min-h-screen" style={{ background: '#060d1f' }}>
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: '#e8f0ff' }}>Security Dashboard</h1>
                        <p className="text-sm mt-0.5" style={{ color: '#6b82a8' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Live data
                        </p>
                    </div>
                    <Link href="/dashboard/upload"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)', color: '#060d1f' }}>
                        <span>+ Upload File</span>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="p-5 rounded-2xl" style={{ background: 'rgba(13,27,53,0.7)', border: '1px solid rgba(0,200,255,0.1)' }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <TrendingUp className="w-4 h-4" style={{ color: '#00e676' }} />
                            </div>
                            <p className="text-2xl font-bold" style={{ color: '#e8f0ff' }}>{value}</p>
                            <p className="text-xs mt-1" style={{ color: '#6b82a8' }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Security Status */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4" style={{ color: '#6b82a8' }} />
                        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#6b82a8' }}>Security Status</h2>
                    </div>
                    <StatusBadge status={securityStatus} large />
                    {flaggedCount > 0 && (
                        <div className="mt-3 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.2)', color: '#ff4d4d' }}>
                            🚨 {flaggedCount} file{flaggedCount > 1 ? 's' : ''} flagged for immediate review.
                        </div>
                    )}
                    {scanningCount > 0 && (
                        <div className="mt-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,171,64,0.08)', border: '1px solid rgba(255,171,64,0.2)', color: '#ffab40' }}>
                            ⏳ {scanningCount} file{scanningCount > 1 ? 's' : ''} currently being scanned.
                        </div>
                    )}
                </div>

                {/* File List */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold" style={{ color: '#e8f0ff' }}>Encrypted Files</h2>
                            <p className="text-xs mt-0.5" style={{ color: '#6b82a8' }}>{files.length} files · AES-256 encrypted</p>
                        </div>
                        <Link href="/dashboard/upload" className="text-xs font-semibold" style={{ color: '#00c8ff' }}>+ Add File</Link>
                    </div>
                    {loadingFiles ? (
                        <div className="flex items-center justify-center py-12" style={{ color: '#6b82a8' }}>
                            <span className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
                            Loading files…
                        </div>
                    ) : fileError ? (
                        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d' }}>
                            {fileError} — <span className="underline cursor-pointer" onClick={() => window.location.reload()}>Retry</span>
                        </div>
                    ) : (
                        <FileTable files={mappedFiles as any} onDelete={handleDelete} />
                    )}
                </div>

                {/* Audit Log */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold" style={{ color: '#e8f0ff' }}>Audit Log</h2>
                        <p className="text-xs mt-0.5" style={{ color: '#6b82a8' }}>Immutable record of all system events</p>
                    </div>
                    {loadingLogs ? (
                        <div className="flex items-center justify-center py-12" style={{ color: '#6b82a8' }}>
                            <span className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
                            Loading audit logs…
                        </div>
                    ) : auditError ? (
                        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d' }}>
                            {auditError} — Admin access required to view audit logs.
                        </div>
                    ) : (
                        <AuditLogTable logs={mappedLogs as any} pageSize={5} />
                    )}
                </div>
            </main>
        </div>
    );
}
