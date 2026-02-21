# Move Ready Plus - Setup Guide

This guide walks you through setting up Move Ready Plus from scratch.

## Prerequisites

- Node.js 20+
- Supabase account (free tier)
- Geoapify account (free tier)
- Git (for version control)
- Vercel account (for deployment)

---

## Step 1: Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: `move-ready-plus`
4. Set database password
5. Choose region closest to you
6. Wait for project provisioning (~2 minutes)

### 1.2 Run Migration

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run"
6. Verify tables created: profiles, crews, jobs, assignment_events, error_logs

### 1.3 Enable Realtime

1. Go to Database → Replication
2. Enable replication for:
   - `public.jobs`
   - `public.crews`
   - `public.assignment_events`
3. Save changes

---

## Step 2: Authentication Setup

### 2.1 Enable Email Auth

1. Go to Authentication → Providers
2. Enable Email provider
3. Disable email confirmation (for demo)
4. Save

### 2.2 Create Test Users

1. Go to Authentication → Users
2. Add three users:
   - `dispatcher@test.com` / password: `TestPass123!`
   - `manager@test.com` / password: `TestPass123!`
   - `driver@test.com` / password: `TestPass123!`

### 2.3 Assign Roles

1. Go to SQL Editor
2. Run:

```sql
-- Insert profiles for test users
INSERT INTO public.profiles (id, email, role)
SELECT 
  id, 
  email,
  CASE 
    WHEN email = 'dispatcher@test.com' THEN 'dispatcher'
    WHEN email = 'manager@test.com' THEN 'manager'
    WHEN email = 'driver@test.com' THEN 'driver'
  END as role
FROM auth.users
WHERE email IN ('dispatcher@test.com', 'manager@test.com', 'driver@test.com')
ON CONFLICT (id) DO NOTHING;
```

---

## Step 3: Environment Variables

### 3.1 Get Supabase Credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` public key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3.2 Get Geoapify Key

1. Go to [geoapify.com](https://www.geoapify.com/)
2. Sign up (free tier: 3,000 requests/day)
3. Create project
4. Copy API key → `NEXT_PUBLIC_GEOAPIFY_KEY`

### 3.3 Create .env.local

Copy `.env.example` to `.env.local` and fill in:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

NEXT_PUBLIC_GEOAPIFY_KEY=your_geoapify_key_here
```

---

## Step 4: Local Development

### 4.1 Install Dependencies

```bash
npm install
```

### 4.2 Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### 4.3 Test Login

1. Navigate to `/login`
2. Sign in as `dispatcher@test.com`
3. Should redirect to `/dashboard`
4. Verify dispatch board shows unassigned jobs and crews

---

## Step 5: Verify Features

### Dispatcher Flow

1. Login as dispatcher
2. Drag unassigned job to crew column
3. Verify job moves to assigned
4. Open another browser tab → verify Realtime update

### Manager Flow

1. Login as manager
2. Navigate to Analytics
3. Verify metrics display correctly
4. Navigate to Live Tracking
5. Verify map displays crew locations

### Driver Flow

1. Login as driver
2. Navigate to My Jobs
3. Update job status: En Route → On Site → Completed
4. Verify status updates propagate

---

## Step 6: Deployment to Vercel

### 6.1 Connect Repository

1. Push code to GitHub:

```bash
git init
git add .
git commit -m "Initial Move Ready Plus implementation"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository

### 6.2 Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GEOAPIFY_KEY`

### 6.3 Deploy

1. Click "Deploy"
2. Wait for build (~3-5 minutes)
3. Test production URL
4. Verify all features work in production

---

## Step 7: Optional Enhancements

### 7.1 Automated Risk Detection

Set up pg_cron in Supabase to run risk detection every 5 minutes:

```sql
SELECT cron.schedule(
  'update-risk-flags',
  '*/5 * * * *',
  $$ SELECT update_risk_flags(); $$
);
```

### 7.2 Custom Domain

1. In Vercel → Settings → Domains
2. Add custom domain
3. Configure DNS records

### 7.3 Monitoring

- Enable Vercel Analytics
- Set up Supabase database logs monitoring
- Configure alert thresholds

---

## Troubleshooting

### Realtime Not Working

- Verify Realtime is enabled in Supabase Dashboard → Database → Replication
- Check browser console for connection errors
- Verify `NEXT_PUBLIC_` env vars are set correctly

### RLS Blocking Queries

- Check profiles table has entries for all users
- Verify role values match exactly: 'dispatcher', 'manager', 'driver'
- Test RLS policies in SQL Editor with different user contexts

### Map Not Displaying

- Verify Leaflet CSS is imported in `globals.css`
- Check browser console for Leaflet errors
- Ensure Geoapify key is valid and not rate-limited

### Assignment Conflicts Not Detecting

- Verify job scheduled times are set correctly
- Check JOB_DURATION_HOURS constant in `/api/assign/route.ts`
- Test with overlapping time windows

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Real credentials never committed to Git
- [ ] Service role key only used server-side
- [ ] RLS policies tested for all roles
- [ ] Rate limiting configured for public endpoints
- [ ] HTTPS enforced in production (Vercel default)

---

## Next Steps

After deployment:

1. Create internal documentation for dispatchers/managers
2. Set up user feedback channel
3. Monitor error logs for first week
4. Gather performance metrics
5. Plan iteration based on real usage patterns
