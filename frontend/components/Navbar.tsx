'use client';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: 'rgba(6,13,31,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,200,255,0.1)' }}>
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)' }}>
                    <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight" style={{ color: '#e8f0ff' }}>VaultGuard</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
                {['Features', 'Security', 'Pricing', 'Enterprise'].map((item) => (
                    <a key={item} href="#" className="text-sm font-medium transition-colors" style={{ color: '#6b82a8' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#00c8ff')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#6b82a8')}>
                        {item}
                    </a>
                ))}
            </div>
            <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg transition-all" style={{ color: '#e8f0ff' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00c8ff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#e8f0ff')}>
                    Sign In
                </Link>
                <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-lg transition-all" style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)', color: '#060d1f' }}>
                    Get Started
                </Link>
            </div>
        </nav>
    );
}
