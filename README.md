# Move Ready Plus

Real-Time Moving Operations Command Center

Internal operations dashboard for moving companies to coordinate crews, monitor live job progress, and detect operational risks in real time.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (Postgres, Auth, Realtime, RLS)
- **Maps**: Leaflet + Geoapify (tiles, routing, ETA)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

1. Node.js 20+
2. Supabase account with project created
3. Geoapify API key (free tier)

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GEOAPIFY_KEY`

### Database Setup

Run migrations in Supabase SQL Editor:

```bash
# See supabase/migrations/ folder
# Execute in order: 001_initial_schema.sql
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Project Structure

```
move-ready/
├── app/                  # Next.js App Router
│   ├── api/             # Route handlers
│   ├── login/           # Auth pages
│   ├── dashboard/       # Main app
│   └── analytics/       # Manager dashboard
├── components/          # React components
├── lib/                 # Utilities
│   └── supabase/       # Supabase clients
├── types/              # TypeScript definitions
├── docs/               # Documentation
│   ├── ptrd.md        # Product requirements
│   └── design-system.md
└── supabase/          # Database migrations
    └── migrations/
```

## Features

### Vertical Slice 0: Auth & Jobs
- Role-based authentication (dispatcher, manager, driver)
- Protected routes via RLS
- Jobs table with basic CRUD

### Slice 1: Job Assignment
- Drag-and-drop dispatch board
- Double-booking prevention
- Optimistic UI with rollback
- Realtime updates across tabs

### Slice 2: Live GPS Tracking
- Crew location updates
- Interactive map (Leaflet)
- ETA calculation via Geoapify
- Rate limit fallback handling

### Slice 3: Risk Flagging
- Automated delay detection
- Warning badges for at-risk jobs
- Manager dashboard widgets

## Deployment

### Vercel

```bash
vercel --prod
```

Set environment variables in Vercel dashboard before deployment.

## Architecture

```
Client (Next.js) → Vercel (API Routes) → Supabase (Postgres + RLS)
                ↘ Supabase Realtime
```

## Security

- Row Level Security (RLS) enforces role-based access
- Server-side auth validation in all API routes
- Service role key used only in server context
- Never commit `.env.local`

## Documentation

- [PTRD](docs/ptrd.md) - Full product requirements
- [Design System](docs/design-system.md) - UI standards and invariants
