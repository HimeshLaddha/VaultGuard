'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import FileTable from '@/components/FileTable';
import Link from 'next/link';
import { api, FileRecord } from '@/lib/apiClient';

export default function FilesPage() {
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getFiles()
            .then(setFiles)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await api.deleteFile(id);
            setFiles(prev => prev.filter(f => f.id !== id));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        }
    };

    /* Map API shape → FileTable shape */
    const mappedFiles = files.map(f => ({
        id: f.id,
        name: f.originalName,
        size: f.sizeLabel,
        type: f.mimeType.split('/').pop()?.toUpperCase()
            .replace('VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT', 'DOCX') || 'FILE',
        uploadedAt: new Date(f.uploadedAt).toLocaleString(),
        encryptedBy: f.encryptedBy,
        status: f.status,
    }));

    return (
        <div className="flex min-h-screen" style={{ background: '#060d1f' }}>
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: '#e8f0ff' }}>My Files</h1>
                        <p className="text-sm mt-0.5" style={{ color: '#6b82a8' }}>
                            {loading ? 'Loading…' : `${files.length} encrypted files`}
                        </p>
                    </div>
                    <Link href="/dashboard/upload"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)', color: '#060d1f' }}>
                        + Upload File
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20" style={{ color: '#6b82a8' }}>
                        <span className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
                        Loading files…
                    </div>
                ) : error ? (
                    <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)' }}>
                        {error} — <span className="underline cursor-pointer" onClick={() => window.location.reload()}>Retry</span>
                    </div>
                ) : (
                    <FileTable files={mappedFiles as any} onDelete={handleDelete} />
                )}
            </main>
        </div>
    );
}
