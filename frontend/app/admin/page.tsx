'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import { ShieldCheck, UserCheck, Users, Search, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface PendingUser {
    id: string;
    email: string;
    name: string;
    status: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchPendingUsers = async () => {
        try {
            setRefreshing(true);
            const data = await api.getPendingUsers();
            setUsers(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch pending users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId: string) => {
        try {
            setActionLoading(userId);
            await api.approveUser(userId);
            setSuccess(`User approved successfully!`);
            // Remove from local state
            setUsers(users.filter(u => u.id !== userId));
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to approve user');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-6 font-inter">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#2dd4bf] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Security Administration</h1>
                        <p className="text-[#94a3b8] text-sm font-medium">VaultGuard Approval Gateway</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchPendingUsers}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <Link href="/dashboard" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-sm font-medium">
                        Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#161618] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <span className="text-[#94a3b8] font-medium">Pending Review</span>
                        </div>
                        <div className="text-3xl font-bold">{users.length}</div>
                    </div>
                    {/* Add more stats if needed */}
                </div>

                {/* Main Content Card */}
                <div className="bg-[#161618] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5 bg-[#1c1c1f]/50 flex items-center justify-between">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#3b82f6]" />
                            Access Requests
                        </h2>
                        {success && (
                            <div className="flex items-center gap-2 text-[#22c55e] text-sm animate-in fade-in slide-in-from-top-2">
                                <CheckCircle className="w-4 h-4" />
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-[#64748b]">
                            <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 opacity-20" />
                            <p>Scanning for new requests...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-20 text-center text-[#64748b]">
                            <CheckCircle className="w-12 h-12 text-[#22c55e] mx-auto mb-4 opacity-20" />
                            <p className="text-lg text-white font-medium mb-1">Queue Clear</p>
                            <p>All registration requests have been processed.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#1c1c1f]/30 text-[#64748b] text-xs font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">User Details</th>
                                        <th className="px-6 py-4">Request Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-sm text-[#64748b]">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-[#94a3b8]">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    Pending
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleApprove(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-black text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                                >
                                                    {actionLoading === user.id ? (
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <UserCheck className="w-4 h-4" />
                                                    )}
                                                    Approve Access
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4 items-start">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-[#94a3b8] leading-relaxed">
                        <span className="text-white font-semibold">Security Note:</span> Approving a user grants them full access to their private vault and file sharing capabilities. Ensure the user's identity has been verified through secondary channels before granting access.
                    </div>
                </div>
            </div>
        </div>
    );
}
