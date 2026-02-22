'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, ArrowLeft } from 'lucide-react';

export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 relative overflow-hidden font-inter">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#22c55e]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#3b82f6]/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-md w-full relative z-10">
                {/* Branding */}
                <div className="flex items-center gap-3 mb-10 justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#22c55e] to-[#3b82f6] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <ShieldCheck className="text-white w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight leading-none">VaultGuard</h1>
                        <p className="text-[#94a3b8] text-xs font-medium uppercase tracking-widest mt-1">Status Panel</p>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-[#161618] border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center">
                    <div className="w-20 h-20 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-[#22c55e] animate-pulse" />
                    </div>

                    <h2 className="text-2xl font-semibold text-white mb-3">Pending Approval</h2>
                    <p className="text-[#94a3b8] leading-relaxed mb-8">
                        Your account has been successfully verified. However, for security reasons, all new accounts require manual approval by a <span className="text-white font-medium">Senior Security Administrator</span>.
                    </p>

                    <div className="bg-[#1c1c1f] rounded-2xl p-5 border border-white/5 mb-8">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-[#64748b]">Review Status</span>
                            <span className="text-[#22c55e] font-semibold bg-[#22c55e]/10 px-2 py-0.5 rounded-md">Queue #12</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#22c55e] h-full w-[40%] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>

                {/* Help Footer */}
                <p className="text-center text-[#475569] text-xs mt-8">
                    Need urgent access? Contact <a href="#" className="underline hover:text-[#94a3b8]">IT Security</a>
                </p>
            </div>
        </div>
    );
}
