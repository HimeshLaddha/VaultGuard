'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, ChevronLeft, RefreshCw } from 'lucide-react';
import OtpInput from '@/components/OtpInput';
import { api } from '@/lib/apiClient';

export default function MfaPage() {
    const router = useRouter();
    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [resent, setResent] = useState(false);

    useEffect(() => {
        if (timer <= 0) return;
        const id = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [timer]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) { setError('Please enter all 6 digits.'); return; }
        setError('');
        setLoading(true);
        try {
            await api.verifyMfa(code);
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid MFA code');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        if (timer > 0) return;
        setTimer(60);
        setResent(true);
        setTimeout(() => setResent(false), 3000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: '#060d1f' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(ellipse, #00c8ff 0%, transparent 70%)' }} />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex items-center gap-2.5 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)' }}>
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl" style={{ color: '#e8f0ff' }}>VaultGuard</span>
                    </Link>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(0,200,255,0.2)', color: '#00c8ff' }}>✓</div>
                            <span className="text-xs" style={{ color: '#6b82a8' }}>Password</span>
                        </div>
                        <div className="w-8 h-px" style={{ background: 'rgba(0,200,255,0.3)' }} />
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)', color: '#060d1f' }}>2</div>
                            <span className="text-xs font-semibold" style={{ color: '#00c8ff' }}>MFA Code</span>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-2" style={{ color: '#e8f0ff' }}>Two-factor authentication</h1>
                    <p className="text-sm text-center max-w-xs" style={{ color: '#6b82a8' }}>
                        We sent a 6-digit code to <span className="font-semibold" style={{ color: '#e8f0ff' }}>adm***@vault.io</span>. Enter it below to verify.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-8" style={{ background: 'rgba(13,27,53,0.8)', border: '1px solid rgba(0,200,255,0.12)', backdropFilter: 'blur(16px)' }}>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-6">
                            <OtpInput value={otp} onChange={setOtp} error={error} />
                        </div>



                        {resent && (
                            <div className="mb-4 px-4 py-3 rounded-xl text-xs text-center" style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)', color: '#00e676' }}>
                                A new code has been sent!
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                            style={{ background: loading ? 'rgba(0,200,255,0.3)' : 'linear-gradient(135deg, #00c8ff, #a78bfa)', color: '#060d1f' }}>
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : 'Verify & Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-between">
                        <Link href="/login" className="flex items-center gap-1 text-xs transition-all" style={{ color: '#6b82a8' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#00c8ff')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#6b82a8')}>
                            <ChevronLeft className="w-3.5 h-3.5" /> Back to Login
                        </Link>
                        <button onClick={handleResend} disabled={timer > 0}
                            className="flex items-center gap-1.5 text-xs transition-all disabled:opacity-50"
                            style={{ color: timer > 0 ? '#6b82a8' : '#00c8ff' }}>
                            <RefreshCw className="w-3.5 h-3.5" />
                            {timer > 0 ? `Resend in ${timer}s` : 'Resend code'}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6">
                    <Lock className="w-3 h-3" style={{ color: '#6b82a8' }} />
                    <p className="text-xs" style={{ color: '#6b82a8' }}>TOTP · RFC 6238 compliant · 30-second window</p>
                </div>
            </div>
        </div>
    );
}
