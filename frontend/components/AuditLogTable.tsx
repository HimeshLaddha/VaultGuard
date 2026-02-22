'use client';
import { useState } from 'react';
import { Info, AlertTriangle, XCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { AuditLogEntry } from '@/lib/apiClient';

interface AuditLogTableProps {
    logs: any[]; // Using any[] to match the mapped shape in dashboard
    pageSize?: number;
}

const sevConfig = {
    info: { color: '#4fc3f7', Icon: Info },
    warning: { color: '#ffab40', Icon: AlertTriangle },
    critical: { color: '#ff4d4d', Icon: XCircle },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function downloadExport(format: 'csv' | 'json') {
    const res = await fetch(`${API_BASE}/api/audit/export?format=${format}`, {
        credentials: 'include',
    });
    if (!res.ok) { alert('Export failed — admin access required'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cd = res.headers.get('Content-Disposition') || '';
    const match = cd.match(/filename="?([^"]+)"?/);
    a.href = url;
    a.download = match?.[1] || `audit_log.${format}`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function AuditLogTable({ logs, pageSize = 5 }: AuditLogTableProps) {
    const [page, setPage] = useState(0);
    const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
    const [exporting, setExporting] = useState(false);

    const filtered = filter === 'all' ? logs : logs.filter(l => l.severity === filter);
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

    const handleExport = async (format: 'csv' | 'json') => {
        setExporting(true);
        await downloadExport(format).finally(() => setExporting(false));
    };

    const FilterBtn = ({ val, label }: { val: typeof filter; label: string }) => (
        <button onClick={() => { setFilter(val); setPage(0); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
                background: filter === val ? 'rgba(0,200,255,0.15)' : 'transparent',
                color: filter === val ? '#00c8ff' : '#6b82a8',
                border: `1px solid ${filter === val ? 'rgba(0,200,255,0.3)' : 'transparent'}`,
            }}>
            {label}
        </button>
    );

    return (
        <div>
            {/* Toolbar: filters + export buttons */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <FilterBtn val="all" label="All" />
                    <FilterBtn val="info" label="Info" />
                    <FilterBtn val="warning" label="Warning" />
                    <FilterBtn val="critical" label="Critical" />
                </div>

                {/* Export buttons */}
                <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#6b82a8' }}>Export:</span>
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={exporting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                        style={{ background: 'rgba(0,230,118,0.12)', color: '#00e676', border: '1px solid rgba(0,230,118,0.25)' }}>
                        <Download className="w-3.5 h-3.5" />
                        CSV
                    </button>
                    <button
                        onClick={() => handleExport('json')}
                        disabled={exporting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                        style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}>
                        <Download className="w-3.5 h-3.5" />
                        JSON
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(0,200,255,0.1)' }}>
                <table className="w-full text-sm">
                    <thead style={{ background: 'rgba(13,27,53,0.8)' }}>
                        <tr>
                            {['Severity', 'Event', 'User', 'IP Address', 'Location', 'Timestamp'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b82a8' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: '#6b82a8' }}>
                                    No audit events match the current filter.
                                </td>
                            </tr>
                        ) : paginated.map((log, i) => {
                            const severity = log.severity as 'info' | 'warning' | 'critical';
                            const { color, Icon } = sevConfig[severity];
                            return (
                                <tr key={log.id}
                                    style={{ background: i % 2 === 0 ? 'rgba(6,13,31,0.6)' : 'rgba(13,27,53,0.4)', borderTop: '1px solid rgba(0,200,255,0.06)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,200,255,0.05)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(6,13,31,0.6)' : 'rgba(13,27,53,0.4)')}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Icon className="w-4 h-4" style={{ color }} />
                                            <span className="text-xs capitalize font-medium" style={{ color }}>{log.severity}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium" style={{ color: '#e8f0ff' }}>{log.event}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#6b82a8' }}>{log.user}</td>
                                    <td className="px-4 py-3 text-xs font-mono" style={{ color: '#6b82a8' }}>{log.ip}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#6b82a8' }}>{log.location}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#6b82a8' }}>{log.timestamp}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs" style={{ color: '#6b82a8' }}>
                        Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length} events
                    </span>
                    <div className="flex items-center gap-2">
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                            className="p-1.5 rounded-lg transition-all disabled:opacity-30" style={{ color: '#6b82a8' }}>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-medium" style={{ color: '#e8f0ff' }}>{page + 1} / {totalPages}</span>
                        <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                            className="p-1.5 rounded-lg transition-all disabled:opacity-30" style={{ color: '#6b82a8' }}>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
