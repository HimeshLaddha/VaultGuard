'use client';
import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
    value: string[];
    onChange: (val: string[]) => void;
    error?: string;
}

export default function OtpInput({ value, onChange, error }: OtpInputProps) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (idx: number, char: string) => {
        if (!/^\d?$/.test(char)) return;
        const next = [...value];
        next[idx] = char;
        onChange(next);
        if (char && idx < 5) refs.current[idx + 1]?.focus();
    };

    const handleKey = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !value[idx] && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const next = [...value];
        pasted.split('').forEach((c, i) => { next[i] = c; });
        onChange(next);
        refs.current[Math.min(pasted.length, 5)]?.focus();
    };

    return (
        <div>
            <div className="flex gap-3 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                    <input
                        key={i}
                        ref={el => { refs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value[i] || ''}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKey(i, e)}
                        onPaste={handlePaste}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all"
                        style={{
                            background: 'rgba(15,28,58,0.9)',
                            border: error ? '2px solid #ff4d4d' : value[i] ? '2px solid #00c8ff' : '2px solid rgba(0,200,255,0.2)',
                            color: '#e8f0ff',
                            caretColor: '#00c8ff',
                        }}
                    />
                ))}
            </div>
            {error && <p className="text-center text-xs mt-2" style={{ color: '#ff4d4d' }}>{error}</p>}
        </div>
    );
}
