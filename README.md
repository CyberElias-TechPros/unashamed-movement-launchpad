# The Time Is Now (TTIN) — Unashamed Movement Launchpad

Faith-based movement platform for The Seventh Man Movement: resources, testimonies, merch, events, and admin tools.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind, React Router, TanStack Query
- **Backend:** Node.js, Express, MongoDB, JWT auth

## Quick start

### 1. Backend

```bash
cd server
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run seed    # Creates admin + catalog data
npm run dev     # http://localhost:5000
```

Default admin after seed: `admin@thetimeisnow.com` / `Admin123!`

### 2. Frontend

```bash
# From repo root
npm install
# Create .env with:
# VITE_API_URL=http://localhost:5000/api
npm run dev     # http://localhost:8080
```

## Implementation tracking

- **[IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)** — Audit summary
- **[IMPLEMENTATION-TODO.md](./IMPLEMENTATION-TODO.md)** — Ultra-granular checklist (update as work completes)

## Key routes

| Path | Description |
|------|-------------|
| `/` | Home (Sympos layout via toggle) |
| `/shop`, `/cart`, `/checkout`, `/order-success` | E-commerce flow |
| `/admin/login` | Admin JWT login |
| `/admin/dashboard` | Protected admin area |

## API health

`GET http://localhost:5000/api/health`
