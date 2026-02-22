# VaultGuard 🔐

A production-grade secure document management platform with JWT authentication, email-based MFA, admin-approval registration, role-based access control, Cloudinary cloud storage, MongoDB persistence, and immutable audit logging.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [User Flows](#user-flows)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [Security Architecture](#security-architecture)

---

## Features

| Feature | Details |
|---|---|
| **Registration + Admin Approval** | New users register → admin approves → user can log in |
| **Email-Based MFA** | Real 6-digit OTP sent via Gmail SMTP on every login |
| **Two-Phase Auth** | Password login → MFA code → JWT access token |
| **HTTP-only Cookies** | Tokens stored in `HttpOnly; SameSite=Strict` cookies |
| **RBAC** | Admin can approve users, view & export audit logs |
| **MongoDB Persistence** | All users, files, and audit logs stored in MongoDB |
| **Cloud Storage** | Files uploaded directly to Cloudinary (no local disk) |
| **Audit Log** | Immutable log of every login, upload, deletion, and failure |
| **Audit Export** | Download full audit log as CSV or JSON |
| **File Validation** | Type allowlist (PDF, DOCX, PNG, JPG, TXT) + 10 MB cap |
| **Input Validation** | Zod schemas on every endpoint |
| **Security Headers** | Helmet.js (HSTS, CSP, X-Frame-Options, etc.) |
| **Rate Limiting** | Auth, upload, and global limiters to prevent brute-force |

---

## Project Structure

```
VaultGuard/
├── frontend/                  ← Next.js 14 (App Router) — port 3000
│   ├── app/
│   │   ├── page.tsx            (landing page)
│   │   ├── register/page.tsx   (self-service registration)
│   │   ├── login/page.tsx      (email + password)
│   │   ├── login/mfa/page.tsx  (6-digit OTP — shows real user email)
│   │   ├── pending-approval/   (waiting room after registration)
│   │   ├── admin/page.tsx      (approve pending users)
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
└── backend/                   ← Express + TypeScript — port 5001
    └── src/
        ├── models/             (Mongoose schemas: User, File, AuditLog)
        ├── store/index.ts      (MongoDB store API + seed on first run)
        ├── utils/
        │   ├── auth.ts         (JWT sign/verify + cookie helpers)
        │   ├── mailer.ts       (Nodemailer + Gmail SMTP)
        │   ├── validation.ts   (Zod schemas + filename sanitizer)
        │   └── cloudinary.ts   (upload / signed URL / delete)
        ├── middleware/
        │   ├── auth.ts         (withAuth, withPreAuth, withRole, withApproval)
        │   └── rateLimit.ts    (auth, upload, global limiters)
        ├── routes/
        │   ├── auth.ts         (register, verify-email, login, mfa, approve-user, me)
        │   ├── files.ts        (list, upload, download, delete)
        │   └── audit.ts        (get logs, export CSV/JSON)
        ├── app.ts              (Express setup + Helmet + CORS)
        └── server.ts           (entry point + DB connect)
```

---

## Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI
- A free **Cloudinary** account → [cloudinary.com](https://cloudinary.com)
- A **Gmail** account with an [App Password](https://myaccount.google.com/apppasswords) for SMTP

---

## Setup

### 1. Install backend dependencies

```bash
cd VaultGuard/backend
npm install
```

### 2. Install frontend dependencies

```bash
cd VaultGuard/frontend
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

# MongoDB
MONGODB_URI=mongodb://localhost:27017/vaultguard

# Cloudinary — get from cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
CLOUDINARY_FOLDER=vaultguard

# Gmail SMTP — use an App Password, not your real password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<your_gmail>@gmail.com
SMTP_PASS=<your_16_char_app_password>
```

#### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Running the App

### Terminal 1 — Backend

```bash
cd VaultGuard/backend
$env:PORT=5000; npm run server   # PowerShell
# or
PORT=5000 npm run server         # bash
```

Expected output:
```
VaultGuard API running on http://localhost:5000
   Environment : development
   Health check: http://localhost:5000/api/health
✅ MongoDB connected  
```

### Terminal 2 — Frontend

```bash
cd VaultGuard/frontend  
npm run dev
```

Then open **http://localhost:3000**

> ⚠ Always start the **backend first**, then the frontend.

---

## User Flows

### New User Registration

1. Navigate to `/register` and fill in name, email, password.
2. A 6-digit verification code is sent to your email.
3. Enter the code to verify your email.
4. Your account status becomes `PENDING` — you'll see a "waiting for approval" screen.
5. Admin logs in and approves your account from `/admin`.
6. You can now log in normally.

### Login (MFA)

1. Navigate to `/login`, enter email + password.
2. A fresh 6-digit OTP is emailed to **your** registered address (expires in 5 min).
3. Enter the OTP on the MFA page — the page shows your actual email (masked).
4. On success you are redirected to the dashboard.

---

## Demo Credentials

> The admin account is seeded into MongoDB on first run. Regular users must register.

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
| `POST` | `/api/auth/register` | — | Register a new user, sends email OTP |
| `POST` | `/api/auth/verify-email` | — | Verify email OTP after registration |
| `POST` | `/api/auth/login` | — | Validate credentials, set pre-auth cookie, send MFA email |
| `POST` | `/api/auth/mfa` | pre-auth | Verify 6-digit OTP, set access cookie |
| `POST` | `/api/auth/logout` | access | Clear all cookies |
| `GET` | `/api/auth/me` | access | Return current user info |
| `GET` | `/api/auth/pending-users` | admin | List users awaiting approval |
| `POST` | `/api/auth/approve-user` | admin | Approve a pending user |
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
  ├── helmet()          → HSTS, CSP, X-Frame-Options headers
  ├── CORS              → restricted to FRONTEND_URL only
  ├── withPreAuth       → validates pre-auth JWT (after password step)
  ├── withAuth          → validates access JWT (full session)
  ├── withApproval      → blocks PENDING/REJECTED users
  ├── withRole('admin') → RBAC guard
  ├── Zod schemas       → input validation on every route
  └── Multer (memoryStorage) → buffer only, never writes to disk
        │
        └── Cloudinary SDK → files stored in cloud, not locally
```

### Token Flow

```
POST /login ──────► pre-auth cookie (5 min) ──► POST /mfa ──► access cookie (8 h)
                         │                              │
                    (password OK +              (MFA OTP OK)
                     APPROVED status)
```

### Email MFA Flow

```
/login validates password
  └─► Generates random 6-digit OTP
  └─► Stores OTP + 5-min expiry in MongoDB
  └─► Sends OTP to user.email via Gmail SMTP
  └─► Frontend MFA page reads email from sessionStorage and masks it
  └─► User submits OTP → /mfa clears token, issues access JWT
```

---

## Security Features

### Registration & Admin Approval

All new accounts are `PENDING` by default. Only an admin can set status to `APPROVED`. Unapproved accounts:
- Cannot reach the MFA step (blocked with `403` before any OTP is sent)
- Cannot access any authenticated endpoint

### Input Sanitization

**Zod schemas** validate every request body before it reaches business logic:

| Schema | Fields validated |
|---|---|
| `LoginSchema` | `email` (valid format, max 254 chars), `password` (non-empty, max 128 chars) |
| `RegisterSchema` | `name`, `email`, `password` (min 8 chars, complexity) |
| `MfaSchema` | `code` (exactly 6 digits, `/^\d{6}$/`) |

### Role-Based Access Control (RBAC)

```
POST /api/auth/approve-user  → withAuth + withRole('admin')
GET  /api/audit              → withAuth + withRole('admin') → 403 for non-admins
GET  /api/audit/export       → withAuth + withRole('admin') → 403 for non-admins
DELETE /api/files/:id        → withAuth + ownership check OR admin role
```

### Rate Limiting

| Limiter | Endpoints | Window | Max requests |
|---|---|---|---|
| Auth limiter | `POST /api/auth/login`, `POST /api/auth/mfa` | 15 minutes | 10 |
| Upload limiter | `POST /api/files/upload` | 1 hour | 20 |
| Global limiter | All `/api/*` endpoints | 15 minutes | 200 |

### HTTP Security Headers (Helmet.js)

| Header | Purpose |
|---|---|
| `Content-Security-Policy` | Blocks XSS, data injection |
| `Strict-Transport-Security` | Forces HTTPS (production only) |
| `X-Frame-Options: DENY` | Prevents clickjacking |
| `X-Content-Type-Options: nosniff` | Prevents MIME sniffing |
| `Referrer-Policy: no-referrer` | No referrer leakage |

---

## Deployment (Production)

### Build both apps

```bash
# Backend
cd VaultGuard/backend && npm run build

# Frontend
cd VaultGuard/frontend && npm run build
```

### Start for production

```bash
# Backend
cd backend && NODE_ENV=production node dist/server.js

# Frontend
cd frontend && npm run start
```

### Checklist before going live

- [ ] Set `NODE_ENV=production` — enables HSTS and disables dev-only logging
- [ ] Generate strong JWT secrets: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- [ ] Set `FRONTEND_URL` to your production domain
- [ ] Use a dedicated Gmail App Password — never commit credentials
- [ ] Point `MONGODB_URI` to a production Atlas cluster
- [ ] Store all `.env` secrets in your hosting provider's secrets manager
- [ ] Point `CLOUDINARY_FOLDER` to a production-specific folder
- [ ] Enable Cloudinary's upload restrictions to only allow server-side uploads
