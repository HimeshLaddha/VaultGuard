# VaultGuard 🔐

A secure document management platform with JWT authentication, MFA, role-based access control, Cloudinary cloud storage, and immutable audit logging.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [Security Architecture](#security-architecture)

---

## Features

| Feature | Details |
|---|---|
| **Two-Phase Auth** | Password login → MFA code → JWT access token |
| **HTTP-only Cookies** | Tokens stored in `HttpOnly; SameSite=Strict` cookies |
| **RBAC** | Admin role can view audit logs; users cannot |
| **Cloud Storage** | Files uploaded directly to Cloudinary (no local disk) |
| **Audit Log** | Immutable log of every login, upload, deletion, and failure |
| **Audit Export** | Download full audit log as CSV or JSON |
| **File Validation** | Type allowlist (PDF, DOCX, PNG, JPG, TXT) + 10 MB cap |
| **Input Validation** | Zod schemas on every endpoint |
| **Security Headers** | Helmet.js (HSTS, CSP, X-Frame-Options, etc.) |

---

## Project Structure

```
project/
├── frontend/                  ← Next.js 14 (App Router) — port 3000
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── login/mfa/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx        (overview + audit log)
│   │       ├── files/page.tsx  (file manager)
│   │       └── upload/page.tsx (upload new files)
│   ├── components/
│   │   ├── Sidebar.tsx         (live user info from /api/auth/me)
│   │   ├── FileTable.tsx
│   │   ├── AuditLogTable.tsx   (CSV/JSON export buttons)
│   │   └── DropZone.tsx        (real upload with progress bar)
│   ├── lib/apiClient.ts        (typed fetch wrapper)
│   └── .env.local              (NEXT_PUBLIC_API_URL)
│
└── backend/                   ← Express + TypeScript — port 5000
    └── src/
        ├── store/index.ts      (in-memory DB — swap for real DB)
        ├── utils/
        │   ├── auth.ts         (JWT sign/verify + cookie helpers)
        │   ├── validation.ts   (Zod schemas + filename sanitizer)
        │   └── cloudinary.ts   (upload / signed URL / delete)
        ├── middleware/auth.ts  (withAuth, withPreAuth, withRole)
        ├── routes/
        │   ├── auth.ts         (login, mfa, logout, me)
        │   ├── files.ts        (list, upload, download, delete)
        │   └── audit.ts        (get logs, export CSV/JSON)
        ├── app.ts              (Express setup)
        └── server.ts           (entry point)
```

---

## Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- A free **Cloudinary** account → [cloudinary.com](https://cloudinary.com)

---

## Setup

### 1. Install backend dependencies

```bash
cd project/backend
npm install
```

### 2. Install frontend dependencies

```bash
cd project/frontend
npm install
```

### 3. Configure environment variables

#### Backend — `backend/.env`

```env
JWT_SECRET=<your-long-random-secret>
JWT_PRE_AUTH_SECRET=<another-long-random-secret>
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Get these from cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
CLOUDINARY_FOLDER=vaultguard
```

#### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Running the App

### Terminal 1 — Backend

```bash
cd project/backend
npx ts-node --transpile-only src/server.ts
```

Expected output:
```
VaultGuard API running on http://localhost:5000
   Environment : development
   Health check: http://localhost:5000/api/health
```

### Terminal 2 — Frontend

```bash
cd project/frontend
npm run dev
```

Then open **http://localhost:3000**

> ⚠ Always start the **backend first**, then the frontend.

---

## Demo Credentials

> These are seeded into the in-memory store on every server start.

### Admin Account
| Field | Value |
|---|---|
| Email | `admin@vault.io` |
| Password | `password123` |
| MFA Code | `247831` |
| Role | `admin` — can view & export audit logs |

### Regular User Account
| Field | Value |
|---|---|
| Email | `user@vault.io` |
| Password | `user1234` |
| MFA Code | `112233` |
| Role | `user` — audit log shows 403 (RBAC working) |

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Validate credentials, set pre-auth cookie |
| `POST` | `/api/auth/mfa` | pre-auth | Verify 6-digit code, set access cookie |
| `POST` | `/api/auth/logout` | access | Clear all cookies |
| `GET` | `/api/auth/me` | access | Return current user info |
| `GET` | `/api/files` | access | List all files |
| `POST` | `/api/files/upload` | access | Upload file to Cloudinary |
| `GET` | `/api/files/:id/download` | access | Get 15-min signed Cloudinary URL |
| `DELETE` | `/api/files/:id` | access | Delete file (owner or admin) |
| `GET` | `/api/audit` | admin | Get full audit log |
| `GET` | `/api/audit/export?format=csv` | admin | Download audit log as CSV |
| `GET` | `/api/audit/export?format=json` | admin | Download audit log as JSON |
| `GET` | `/api/health` | — | Health check |

---

## Security Architecture

```
Browser
  │
  │  HTTP-only cookies (SameSite=Strict)
  ▼
Express Backend
  ├── helmet()        → HSTS, CSP, X-Frame-Options headers
  ├── CORS            → restricted to FRONTEND_URL only
  ├── withPreAuth     → validates pre-auth JWT (after password step)
  ├── withAuth        → validates access JWT (full session)
  ├── withRole('admin') → RBAC guard
  ├── Zod schemas     → input validation on every route
  └── Multer (memoryStorage) → buffer only, never writes to disk
        │
        └── Cloudinary SDK → files stored in cloud, not locally
```

### Token Flow

```
POST /login ──────► pre-auth cookie (5 min) ──► POST /mfa ──► access cookie (8 h)
                         │                              │
                    (password OK)                  (MFA code OK)
```

### File Handling

- Files held in memory by multer (never written to disk)
- Uploaded to Cloudinary via base64 data URI
- Downloads served as 15-minute signed URLs through the API
- Deletion removes file from both the store and Cloudinary

---

## Replacing the In-Memory Store

The `backend/src/store/index.ts` file acts as a simple in-memory database. To connect a real database (MongoDB, PostgreSQL, etc.):

1. Replace the `users`, `files`, and `auditLogs` arrays with database queries
2. Update the store helper functions (`findUserByEmail`, `addFile`, etc.) to use your ORM/client
3. No route code needs to change — routes only call store functions
