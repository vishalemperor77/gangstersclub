# GANGSTERS CLUB — Backend

Express REST API for the Gangsters Club platform. Uses Supabase (PostgreSQL,
Auth, Storage) as the data layer. **No payment functionality exists anywhere.**

## Stack

- Node.js + Express
- Supabase (`@supabase/supabase-js`) — Postgres, Auth, Storage
- Zod — request validation
- Helmet / CORS / compression / rate limiting
- `qrcode` — member ID card QR generation

## Setup

```bash
cd backend
cp .env.example .env     # fill in your Supabase keys
npm install
```

### Required env vars

| Var | Purpose |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | Anon key (public read flows) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-side only. Never expose to the browser.** |
| `PUBLIC_URL` | Public site base URL — used to build QR verification links |
| `CLIENT_URL` | Frontend origin for CORS |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Used only by `npm run seed` |

### Database

Run `supabase/schema.sql` in the Supabase SQL editor. It creates all tables,
RLS policies, secure RPC functions and storage buckets.

### Create the initial admin

```bash
npm run seed
```

The admin role is stored in `profiles.role = 'admin'`. No admin credentials
are stored in source code.

### Run

```bash
npm run dev          # http://localhost:5000
```

## Architecture

```
src/
  config/        env + supabase clients (service-role & anon)
  middleware/    auth (JWT verify), RBAC (admin / active member),
                 rate limiting, multer upload validation, error handler
  validators/    Zod schemas
  controllers/   one controller per domain
  routes/        single REST router mounted at /api
  utils/         activity logging, auth user creation
scripts/seed.js  bootstrap admin
```

## Authorization model

Every protected route runs: `authRequired` (verifies the Supabase JWT and loads
the profile) → `activeMemberRequired` or `adminRequired` (server-side role
check). The frontend never decides access; a missing/invalid role returns
`401`/`403`. The database additionally enforces RLS as a second layer.

Membership approval is executed by the `approve_application` RPC inside
Postgres, so member-ID generation, account activation and verification-row
creation happen atomically.
