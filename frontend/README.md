# VaultGuard – Security Product Frontend

A fully responsive, interactive security product UI built with **Next.js 14 (App Router)** and **Tailwind CSS**.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom CSS variables
- **Language**: TypeScript
- **Icons**: Lucide React
- **File Upload**: react-dropzone

## Pages

| Route | Description |
|---|---|
| `/` | Landing page – hero, features, testimonials |
| `/login` | Email + password login with validation |
| `/login/mfa` | 6-digit MFA code entry |
| `/dashboard` | File list, security status, audit log |
| `/dashboard/upload` | Drag-and-drop file upload |
| `/dashboard/files` | Full file list |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

| Field | Value |
|---|---|
| Email | `admin@vault.io` |
| Password | `password123` |
| MFA Code | `247831` |

## Features

- 🔐 Two-step authentication (Password → 6-digit MFA)
- 🛡 Security status indicator (green / amber / red)
- 📁 Sortable, deletable file list with encryption status
- 📋 Filterable audit log with pagination
- 📤 Drag-and-drop upload with type/size validation and progress animation
- 📱 Fully responsive (mobile, tablet, desktop)
- ✅ Form validation on login and upload
