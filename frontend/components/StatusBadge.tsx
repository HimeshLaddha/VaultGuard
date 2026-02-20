'use client';
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

type Status = 'secure' | 'warning' | 'critical';

interface StatusBadgeProps {
    status: Status;
    large?: boolean;
}

const config = {
    secure: { label: 'All Systems Secure', color: '#00e676', bg: 'rgba(0,230,118,0.1)', border: 'rgba(0,230,118,0.25)', Icon: ShieldCheck, desc: 'No threats detected. All files encrypted.' },
    warning: { label: 'Attention Required', color: '#ffab40', bg: 'rgba(255,171,64,0.1)', border: 'rgba(255,171,64,0.25)', Icon: AlertTriangle, desc: 'Some files require review.' },
    critical: { label: 'Threat Detected', color: '#ff4d4d', bg: 'rgba(255,77,77,0.1)', border: 'rgba(255,77,77,0.25)', Icon: XCircle, desc: 'Immediate action required.' },
};

export default function StatusBadge({ status, large = false }: StatusBadgeProps) {
    const { label, color, bg, border, Icon, desc } = config[status];
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="relative flex-shrink-0">
                {/* Pulsing ring */}
                <span className="absolute inset-0 rounded-full animate-ping" style={{ background: color, opacity: 0.25 }} />
                <div className={`${large ? 'w-14 h-14' : 'w-10 h-10'} rounded-full flex items-center justify-center`} style={{ background: `${color}22` }}>
                    <Icon className={large ? 'w-7 h-7' : 'w-5 h-5'} style={{ color }} />
                </div>
            </div>
            <div>
                <p className={`font-bold ${large ? 'text-lg' : 'text-base'}`} style={{ color }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6b82a8' }}>{desc}</p>
            </div>
        </div>
    );
}
