import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VaultGuard – Enterprise File Security",
  description: "Military-grade encrypted file storage with zero-knowledge architecture, MFA, and real-time audit logs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#060d1f', minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
