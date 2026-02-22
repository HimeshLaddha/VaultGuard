'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Mail, Lock, User, ChevronRight } from 'lucide-react';
import { api } from '@/lib/apiClient';

interface FieldProps {
    id: string;
    label: string;
    icon: React.ElementType;
    type: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    placeholder?: string;
    right?: React.ReactNode;
}

function Field({ id, label, icon: Icon, type, value, onChange, error, placeholder, right }: FieldProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#6b82a8' }}>{label}</label>
            <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b82a8' }} />
                <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                        background: 'rgba(13,27,53,0.8)',
                        border: `1px solid ${error ? '#ff4d4d' : 'rgba(0,200,255,0.2)'}`,
                        color: '#e8f0ff',
                    }}
                    onFocus={e => { if (!error) e.target.style.borderColor = '#00c8ff'; }}
                    onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(0,200,255,0.2)'; }}
                />
                {right && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</div>}
            </div>
            {error && <p className="text-xs mt-1.5" style={{ color: '#ff4d4d' }}>{error}</p>}
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e: typeof errors = {};
        if (!name) e.name = 'Name is required.';
        else if (name.length < 2) e.name = 'Name must be at least 2 characters.';

        if (!email) e.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email address.';

        if (!password) e.password = 'Password is required.';
        else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
        else if (!/[A-Z]/.test(password)) e.password = 'Must contain at least one uppercase letter.';
        else if (!/[0-9]/.test(password)) e.password = 'Must contain at least one number.';

        return e;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        try {
            await api.register(name, email, password);
            // Save email to localStorage temporarily for verification page
            localStorage.setItem('pending_verify_email', email);
            router.push('/register/verify');
        } catch (err: unknown) {
            setErrors({ form: err instanceof Error ? err.message : 'Registration failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: '#060d1f' }}>
            {/* Background glow */}
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
                    <h1 className="text-2xl font-bold mb-1" style={{ color: '#e8f0ff' }}>Create Account</h1>
                    <p className="text-sm text-center" style={{ color: '#6b82a8' }}>Secure your data with zero-knowledge vault</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-8" style={{ background: 'rgba(13,27,53,0.8)', border: '1px solid rgba(0,200,255,0.12)', backdropFilter: 'blur(16px)' }}>
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <Field id="name" label="Full Name" icon={User} type="text"
                            value={name} onChange={setName} error={errors.name} placeholder="John Doe" />

                        <Field id="email" label="Email Address" icon={Mail} type="email"
                            value={email} onChange={setEmail} error={errors.email} placeholder="you@example.com" />

                        <Field id="password" label="Password" icon={Lock}
                            type={showPw ? 'text' : 'password'}
                            value={password} onChange={setPassword} error={errors.password} placeholder="••••••••"
                            right={
                                <button type="button" onClick={() => setShowPw(v => !v)} style={{ color: '#6b82a8' }}>
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />

                        {errors.form && (
                            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', color: '#ff4d4d' }}>
                                {errors.form}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2"
                            style={{ background: loading ? 'rgba(0,200,255,0.3)' : 'linear-gradient(135deg, #00c8ff, #a78bfa)', color: '#060d1f' }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>Verify Email <ChevronRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs" style={{ color: '#6b82a8' }}>
                            Already have an account?{' '}
                            <Link href="/login" style={{ color: '#00c8ff', fontWeight: 600 }}>Sign in</Link>
                        </p>
                    </div>
                </div>

                {/* Security notice */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Lock className="w-3 h-3" style={{ color: '#6b82a8' }} />
                    <p className="text-xs" style={{ color: '#6b82a8' }}>256-bit SSL encrypted · Zero-knowledge architecture</p>
                </div>
            </div>
        </div>
    );
}
