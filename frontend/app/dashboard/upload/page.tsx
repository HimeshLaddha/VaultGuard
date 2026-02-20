'use client';
import Sidebar from '@/components/Sidebar';
import DropZone from '@/components/DropZone';
import { AlertCircle, CheckCircle, Shield, UploadCloud } from 'lucide-react';

const guidelines = [
    { icon: CheckCircle, text: 'Allowed file types: PDF, DOCX, PNG, JPG / JPEG', color: '#00e676' },
    { icon: CheckCircle, text: 'Maximum file size: 10 MB per file', color: '#00e676' },
    { icon: CheckCircle, text: 'Files are encrypted with AES-256 upon upload', color: '#00e676' },
    { icon: AlertCircle, text: 'Do not upload files containing unredacted PII without consent', color: '#ffab40' },
];

export default function UploadPage() {
    return (
        <div className="flex min-h-screen" style={{ background: '#060d1f' }}>
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: '#e8f0ff' }}>Secure File Upload</h1>
                        <p className="text-sm mt-0.5" style={{ color: '#6b82a8' }}>Files are encrypted with AES-256 before storage</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', color: '#00e676' }}>
                        <Shield className="w-3.5 h-3.5" />
                        End-to-End Encrypted
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Drop Zone (left 2/3) */}
                    <div className="lg:col-span-2">
                        <div className="p-6 rounded-2xl" style={{ background: 'rgba(13,27,53,0.7)', border: '1px solid rgba(0,200,255,0.1)' }}>
                            <div className="flex items-center gap-2 mb-5">
                                <UploadCloud className="w-5 h-5" style={{ color: '#00c8ff' }} />
                                <h2 className="text-base font-bold" style={{ color: '#e8f0ff' }}>Upload Files</h2>
                            </div>
                            <DropZone />
                        </div>
                    </div>

                    {/* Sidebar info (right 1/3) */}
                    <div className="space-y-5">
                        {/* Guidelines */}
                        <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,27,53,0.7)', border: '1px solid rgba(0,200,255,0.1)' }}>
                            <h3 className="text-sm font-bold mb-4" style={{ color: '#e8f0ff' }}>Upload Guidelines</h3>
                            <ul className="space-y-3">
                                {guidelines.map(({ icon: Icon, text, color }, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
                                        <span className="text-xs leading-relaxed" style={{ color: '#6b82a8' }}>{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Encryption info */}
                        <div className="p-5 rounded-2xl" style={{ background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.15)' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Shield className="w-4 h-4" style={{ color: '#00c8ff' }} />
                                <h3 className="text-sm font-bold" style={{ color: '#e8f0ff' }}>How Encryption Works</h3>
                            </div>
                            <ol className="space-y-2.5">
                                {[
                                    'File is encrypted client-side with a unique AES-256 key',
                                    'The key is wrapped with your account\'s public RSA key',
                                    'Encrypted blob is stored on our zero-knowledge servers',
                                    'Only you can decrypt with your private key',
                                ].map((step, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(0,200,255,0.2)', color: '#00c8ff' }}>{i + 1}</span>
                                        <span className="text-xs leading-relaxed" style={{ color: '#6b82a8' }}>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Stats */}
                        <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,27,53,0.7)', border: '1px solid rgba(0,200,255,0.1)' }}>
                            <h3 className="text-sm font-bold mb-3" style={{ color: '#e8f0ff' }}>Storage</h3>
                            <div className="mb-2 flex justify-between text-xs" style={{ color: '#6b82a8' }}>
                                <span>23.4 MB used</span>
                                <span>10 GB total</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,200,255,0.1)' }}>
                                <div className="h-full rounded-full" style={{ width: '0.23%', background: 'linear-gradient(90deg, #00c8ff, #a78bfa)' }} />
                            </div>
                            <p className="text-xs mt-1.5" style={{ color: '#6b82a8' }}>9.98 GB remaining</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
