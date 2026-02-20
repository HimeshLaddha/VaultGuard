import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Silence the multiple-lockfiles workspace root warning */
  outputFileTracingRoot: process.cwd(),

  /* ── Image optimization ──────────────────────────────────────── */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  /* ── HTTP caching headers ───────────────────────────────────── */
  async headers() {
    return [
      {
        /* Immutable cache for Next.js static JS/CSS chunks */
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        /* Cache Next.js image optimisation endpoint responses for 1 day */
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },
      {
        /* API responses must never be cached by browsers */
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },

  /* ── Bundle optimizations ───────────────────────────────────── */
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
