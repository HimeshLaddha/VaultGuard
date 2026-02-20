'use client';
import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, X, FileText, CheckCircle } from 'lucide-react';
import { api } from '@/lib/apiClient';

interface DropZoneProps {
    onFilesAccepted?: (files: File[]) => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function DropZone({ onFilesAccepted }: DropZoneProps) {
    const [files, setFiles] = useState<{ file: File; id: string; progress: number; done: boolean; error?: string }[]>([]);
    const [globalError, setGlobalError] = useState('');

    const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
        setGlobalError('');
        if (rejected.length > 0) {
            const code = rejected[0].errors[0].code;
            if (code === 'file-too-large') setGlobalError('File exceeds 10 MB limit.');
            else if (code === 'file-invalid-type') setGlobalError('Invalid file type. Allowed: PDF, DOCX, PNG, JPG.');
            else setGlobalError('One or more files were rejected.');
        }
        const mapped = accepted.map(f => ({ file: f, id: Math.random().toString(36).slice(2), progress: 0, done: false }));
        setFiles(prev => [...prev, ...mapped]);
        onFilesAccepted?.(accepted);
    }, [onFilesAccepted]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
        maxSize: MAX_SIZE,
        multiple: true,
    });

    const uploadOne = async (id: string, file: File) => {
        // Animate progress from 0 → 85 while uploading
        let ticker = setInterval(() => {
            setFiles(prev => prev.map(f => f.id === id && f.progress < 85
                ? { ...f, progress: Math.min(f.progress + Math.random() * 12 + 4, 85) }
                : f));
        }, 200);
        try {
            await api.uploadFile(file);
            clearInterval(ticker);
            setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: 100, done: true } : f));
        } catch (err: unknown) {
            clearInterval(ticker);
            const msg = err instanceof Error ? err.message : 'Upload failed';
            setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: 0, error: msg } : f));
        }
    };

    const handleUpload = () => {
        files.filter(f => !f.done && !f.error).forEach(f => uploadOne(f.id, f.file));
    };

    const remove = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

    const sizeLabel = (n: number) => n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`;

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div {...getRootProps()} className="rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer text-center transition-all"
                style={{
                    border: isDragActive ? '2px dashed #00c8ff' : '2px dashed rgba(0,200,255,0.25)',
                    background: isDragActive ? 'rgba(0,200,255,0.08)' : 'rgba(13,27,53,0.5)',
                    boxShadow: isDragActive ? '0 0 32px rgba(0,200,255,0.2)' : 'none',
                }}>
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,200,255,0.12)' }}>
                    <UploadCloud className="w-8 h-8" style={{ color: isDragActive ? '#00c8ff' : '#6b82a8' }} />
                </div>
                <p className="text-base font-semibold mb-1" style={{ color: '#e8f0ff' }}>
                    {isDragActive ? 'Release to upload' : 'Drag & drop files here'}
                </p>
                <p className="text-sm" style={{ color: '#6b82a8' }}>or <span style={{ color: '#00c8ff' }}>browse</span> to choose files</p>
                <p className="text-xs mt-2" style={{ color: '#6b82a8' }}>PDF, DOCX, PNG, JPG · Max 10 MB per file</p>
            </div>

            {globalError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', color: '#ff4d4d' }}>
                    <X className="w-4 h-4 flex-shrink-0" />
                    {globalError}
                </div>
            )}

            {/* File preview list */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map(file => (
                        <div key={file.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(13,27,53,0.7)', border: '1px solid rgba(0,200,255,0.1)' }}>
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,200,255,0.12)' }}>
                                <FileText className="w-4 h-4" style={{ color: '#00c8ff' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium truncate" style={{ color: '#e8f0ff' }}>{file.file.name}</p>
                                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: '#6b82a8' }}>{sizeLabel(file.file.size)}</span>
                                </div>
                                <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,200,255,0.1)' }}>
                                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${file.progress}%`, background: file.done ? '#00e676' : 'linear-gradient(90deg, #00c8ff, #a78bfa)' }} />
                                </div>
                                {file.done && <p className="text-xs mt-1" style={{ color: '#00e676' }}>Upload complete ✓</p>}
                                {file.error && <p className="text-xs mt-1" style={{ color: '#ff4d4d' }}>⚠ {file.error}</p>}
                            </div>
                            {file.done ? (
                                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#00e676' }} />
                            ) : (
                                <button onClick={() => remove(file.id)} className="flex-shrink-0 p-1 rounded-lg" style={{ color: '#6b82a8' }}>
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {files.length > 0 && files.some(f => !f.done) && (
                <button onClick={handleUpload}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)', color: '#060d1f' }}>
                    Upload {files.filter(f => !f.done).length} File{files.filter(f => !f.done).length > 1 ? 's' : ''}
                </button>
            )}
        </div>
    );
}
