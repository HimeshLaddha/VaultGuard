'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, LayoutDashboard, Files, Upload, Settings, LogOut, Bell } from 'lucide-react';
import { api } from '@/lib/apiClient';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Files, label: 'My Files', href: '/dashboard/files' },
    { icon: Upload, label: 'Upload File', href: '/dashboard/upload' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

    useEffect(() => {
        api.me()
            .then(u => setUser({ name: u.name, email: u.email, role: u.role }))
            .catch(() => { }); // silently fail — user not logged in
    }, []);

    const handleSignOut = async () => {
        try { await api.logout(); } catch { /* ignore */ }
        router.push('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '…';

    return (
        <aside className="fixed inset-y-0 left-0 w-64 flex flex-col z-40" style={{ background: '#0d1b35', borderRight: '1px solid rgba(0,200,255,0.1)' }}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid rgba(0,200,255,0.1)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)' }}>
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg" style={{ color: '#e8f0ff' }}>VaultGuard</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map(({ icon: Icon, label, href }) => {
                    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                        <Link key={href} href={href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{
                                background: active ? 'rgba(0,200,255,0.12)' : 'transparent',
                                color: active ? '#00c8ff' : '#6b82a8',
                                border: active ? '1px solid rgba(0,200,255,0.2)' : '1px solid transparent',
                            }}>
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="px-4 py-4 space-y-1" style={{ borderTop: '1px solid rgba(0,200,255,0.1)' }}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(0,200,255,0.06)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)', color: '#060d1f' }}>
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#e8f0ff' }}>
                            {user?.name ?? '…'}
                        </p>
                        <p className="text-xs truncate" style={{ color: '#6b82a8' }}>
                            {user?.email ?? ''}
                            {user?.role === 'admin' && (
                                <span className="ml-1 px-1 rounded text-xs font-bold" style={{ background: 'rgba(0,200,255,0.15)', color: '#00c8ff' }}>admin</span>
                            )}
                        </p>
                    </div>
                    <Bell className="w-4 h-4 flex-shrink-0" style={{ color: '#6b82a8' }} />
                </div>

                <button onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full"
                    style={{ color: '#6b82a8' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ff4d4d')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6b82a8')}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
