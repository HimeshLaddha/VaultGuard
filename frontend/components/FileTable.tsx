'use client';
import { useState } from 'react';
import { FileItem } from '@/lib/mockData';
import { Download, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface FileTableProps {
    files: FileItem[];
    onDelete?: (id: string) => void;
}

const statusConfig = {
    secure: { label: 'Secure', color: '#00e676', Icon: CheckCircle },
    scanning: { label: 'Scanning', color: '#ffab40', Icon: Clock },
    flagged: { label: 'Flagged', color: '#ff4d4d', Icon: AlertCircle },
};

const typeColors: Record<string, string> = {
    PDF: '#ff6b6b', DOCX: '#4fc3f7', PNG: '#a78bfa', TXT: '#ffab40',
};

export default function FileTable({ files, onDelete }: FileTableProps) {
    const [sortCol, setSortCol] = useState<keyof FileItem>('uploadedAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const sorted = [...files].sort((a, b) => {
        const av = a[sortCol] as string, bv = b[sortCol] as string;
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    const toggle = (col: keyof FileItem) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('asc'); }
    };

    const TH = ({ label, col }: { label: string; col: keyof FileItem }) => (
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none"
            style={{ color: '#6b82a8' }} onClick={() => toggle(col)}>
            {label} {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
        </th>
    );

    return (
        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(0,200,255,0.1)' }}>
            <table className="w-full text-sm">
                <thead style={{ background: 'rgba(13,27,53,0.8)' }}>
                    <tr>
                        <TH label="File Name" col="name" />
                        <TH label="Type" col="type" />
                        <TH label="Size" col="size" />
                        <TH label="Uploaded" col="uploadedAt" />
                        <TH label="Status" col="status" />
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b82a8' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((file, i) => {
                        const { label, color, Icon } = statusConfig[file.status];
                        return (
                            <tr key={file.id} className="transition-colors"
                                style={{ background: i % 2 === 0 ? 'rgba(6,13,31,0.6)' : 'rgba(13,27,53,0.4)', borderTop: '1px solid rgba(0,200,255,0.06)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,200,255,0.05)')}
                                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(6,13,31,0.6)' : 'rgba(13,27,53,0.4)')}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                            style={{ background: `${typeColors[file.type] || '#6b82a8'}22`, color: typeColors[file.type] || '#6b82a8' }}>
                                            {file.type[0]}
                                        </div>
                                        <span className="font-medium truncate max-w-[180px]" style={{ color: '#e8f0ff' }}>{file.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: `${typeColors[file.type] || '#6b82a8'}22`, color: typeColors[file.type] || '#6b82a8' }}>{file.type}</span>
                                </td>
                                <td className="px-4 py-3 text-xs" style={{ color: '#6b82a8' }}>{file.size}</td>
                                <td className="px-4 py-3 text-xs" style={{ color: '#6b82a8' }}>{file.uploadedAt}</td>
                                <td className="px-4 py-3">
                                    <span className="flex items-center gap-1 text-xs font-medium">
                                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                                        <span style={{ color }}>{label}</span>
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 rounded-lg transition-all" style={{ color: '#6b82a8' }}
                                            onMouseEnter={e => (e.currentTarget.style.color = '#00c8ff')}
                                            onMouseLeave={e => (e.currentTarget.style.color = '#6b82a8')}
                                            title="Download">
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="p-1.5 rounded-lg transition-all" style={{ color: '#6b82a8' }}
                                            onMouseEnter={e => (e.currentTarget.style.color = '#ff4d4d')}
                                            onMouseLeave={e => (e.currentTarget.style.color = '#6b82a8')}
                                            onClick={() => onDelete?.(file.id)}
                                            title="Delete">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
