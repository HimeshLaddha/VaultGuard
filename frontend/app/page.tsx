'use client';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Shield, Lock, Eye, FileCheck, ChevronRight, Star, Zap, Globe, Award } from 'lucide-react';

const features = [
  { icon: Shield, title: 'AES-256 Encryption', desc: 'Military-grade encryption protects every file at rest and in transit with zero-knowledge architecture.', color: '#00c8ff' },
  { icon: Lock, title: 'Multi-Factor Auth', desc: 'Time-based one-time passwords add a critical second layer, making unauthorized access virtually impossible.', color: '#a78bfa' },
  { icon: Eye, title: 'Real-Time Audit Logs', desc: 'Every action is logged with IP, location, and timestamp. Full accountability across your entire team.', color: '#00e676' },
  { icon: FileCheck, title: 'Compliance Ready', desc: 'Built to exceed SOC 2, HIPAA, GDPR, and ISO 27001 requirements with automated compliance reporting.', color: '#ffab40' },
  { icon: Zap, title: 'Instant Threat Detection', desc: 'Machine learning algorithms detect anomalies and suspicious patterns in real time – 24/7/365.', color: '#ff6b6b' },
  { icon: Globe, title: 'Global CDN Delivery', desc: 'Your files are served from the nearest edge node ensuring sub-100ms latency worldwide.', color: '#4fc3f7' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'CISO, TechNova Corp', text: 'VaultGuard completely transformed how we handle sensitive data. The audit trails alone saved us weeks during our last compliance audit.', stars: 5 },
  { name: 'Marcus Reid', role: 'VP Engineering, FinBridge', text: 'The MFA system is rock-solid and the UI is the most intuitive I\'ve seen in enterprise security. Our team adopted it in days, not months.', stars: 5 },
  { name: 'Priya Sharma', role: 'Security Lead, HealthSync', text: 'We handle HIPAA-protected data daily. VaultGuard gives us confidence that patient data is always protected. Non-negotiable for healthcare.', stars: 5 },
];

const stats = [
  { value: '10M+', label: 'Files Secured' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '500+', label: 'Enterprise Clients' },
  { value: '0', label: 'Breaches' },
];

export default function LandingPage() {
  return (
    <div style={{ background: '#060d1f', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-36 pb-28 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(ellipse, #00c8ff 0%, transparent 70%)' }} />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold" style={{ background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.25)', color: '#00c8ff' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00e676' }} />
          SOC 2 Type II Certified · HIPAA Compliant · GDPR Ready
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight max-w-5xl" style={{ color: '#e8f0ff' }}>
          Enterprise File Security<br />
          <span style={{ background: 'linear-gradient(135deg, #00c8ff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            That Never Sleeps
          </span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mb-10" style={{ color: '#6b82a8', lineHeight: 1.7 }}>
          Zero-knowledge encrypted storage, real-time threat detection, and immutable audit logs — built for organizations that refuse to compromise on security.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link href="/login" className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)', color: '#060d1f', boxShadow: '0 8px 32px rgba(0,200,255,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            Start Free Trial
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="#features" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.2)', color: '#00c8ff' }}>
            See How It Works
          </Link>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl w-full">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center p-4 rounded-2xl" style={{ background: 'rgba(13,27,53,0.6)', border: '1px solid rgba(0,200,255,0.1)' }}>
              <p className="text-3xl font-extrabold mb-1" style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{value}</p>
              <p className="text-xs" style={{ color: '#6b82a8' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust logos */}
      <section className="py-10 px-6" style={{ borderTop: '1px solid rgba(0,200,255,0.08)', borderBottom: '1px solid rgba(0,200,255,0.08)' }}>
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#6b82a8' }}>Trusted by leading enterprises worldwide</p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
          {['Goldman Sachs', 'Pfizer Health', 'Deloitte', 'Airbus', 'Siemens', 'JP Morgan'].map(logo => (
            <span key={logo} className="text-sm font-bold tracking-tight" style={{ color: '#e8f0ff' }}>{logo}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#00c8ff' }}>Enterprise-Grade Protection</p>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4" style={{ color: '#e8f0ff' }}>Security without compromise</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#6b82a8' }}>Every feature was built from the ground up with security-first principles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-6 rounded-2xl transition-all cursor-default group"
                style={{ background: 'rgba(13,27,53,0.7)', border: '1px solid rgba(0,200,255,0.1)' }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${color}44`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(0,200,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}18` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#e8f0ff' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b82a8' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6" style={{ background: 'rgba(13,27,53,0.3)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: '#e8f0ff' }}>Trusted by security teams</h2>
            <p className="text-base" style={{ color: '#6b82a8' }}>See why the world's most security-conscious organizations choose VaultGuard.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="p-6 rounded-2xl" style={{ background: 'rgba(15,28,58,0.7)', border: '1px solid rgba(0,200,255,0.1)' }}>
                <div className="flex gap-1 mb-4">
                  {Array(stars).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#ffab40' }} />)}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#a8b8d0' }}>"{text}"</p>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#e8f0ff' }}>{name}</p>
                  <p className="text-xs" style={{ color: '#6b82a8' }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(167,139,250,0.1) 0%, transparent 70%)' }} />
        <Award className="w-12 h-12 mx-auto mb-6" style={{ color: '#a78bfa' }} />
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 max-w-2xl mx-auto" style={{ color: '#e8f0ff' }}>Ready to secure your data?</h2>
        <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: '#6b82a8' }}>Join 500+ enterprises. No credit card required. 14-day free trial.</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-sm transition-all"
          style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)', color: '#060d1f', boxShadow: '0 8px 40px rgba(167,139,250,0.35)' }}>
          Get Started Free
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10" style={{ borderTop: '1px solid rgba(0,200,255,0.08)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00c8ff, #a78bfa)' }}>
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold" style={{ color: '#e8f0ff' }}>VaultGuard</span>
          </div>
          <p className="text-xs" style={{ color: '#6b82a8' }}>© 2026 VaultGuard Inc. All rights reserved. · Privacy Policy · Terms of Service · Security</p>
        </div>
      </footer>
    </div>
  );
}
