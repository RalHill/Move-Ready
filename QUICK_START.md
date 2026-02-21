# Move Ready Plus - Quick Start

Get up and running in 10 minutes.

## 1. Database Setup (5 minutes)

### Run Migration in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and click "Run"
4. Verify success (should see "Success. No rows returned")

### Create Test Users

In Supabase Dashboard → Authentication → Users → "Add user":

| Email | Password | Role |
|-------|----------|------|
| dispatcher@test.com | TestPass123! | dispatcher |
| manager@test.com | TestPass123! | manager |
| driver@test.com | TestPass123! | driver |

Then in SQL Editor, run:

```sql
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

### Enable Realtime

Database → Replication → Enable for:
- `public.jobs`
- `public.crews`
- `public.assignment_events`

---

## 2. Environment Setup (2 minutes)

Your `.env.local` is already configured with your credentials. Verify it exists and contains:

```bash
SUPABASE_URL=https://zbiulljwpiwkljhtrulc.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://zbiulljwpiwkljhtrulc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_GEOAPIFY_KEY=6498a2f07dc44a0bb0b33dee4da68b20
```

---

## 3. Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

---

## 4. Test the System (2 minutes)

### As Dispatcher

1. Login: `dispatcher@test.com` / `TestPass123!`
2. You should see the Dispatch Board
3. Drag an unassigned job to a crew column
4. Verify job moves and shows "assigned" status

### As Manager

1. Logout, login as `manager@test.com` / `TestPass123!`
2. Navigate to "Analytics"
3. Verify metrics display
4. Navigate to "Live Tracking"
5. Verify map shows crew locations

### As Driver

1. Logout, login as `driver@test.com` / `TestPass123!`
2. Navigate to "My Jobs"
3. Click status buttons: En Route → On Site → Complete
4. Verify status updates

---

## 5. Verify Realtime (1 minute)

1. Login as dispatcher in main window
2. Open incognito window, login as manager
3. In dispatcher window, assign a job
4. Watch manager window → should update automatically

---

## Troubleshooting

**"Profile not found" error:**
- Run the profiles INSERT SQL again
- Verify user IDs match in auth.users and profiles tables

**Map not loading:**
- Check browser console for errors
- Verify NEXT_PUBLIC_GEOAPIFY_KEY is set

**Realtime not working:**
- Verify replication enabled in Supabase Dashboard
- Check browser console for WebSocket errors

---

## Next Steps

- Review [`docs/setup-guide.md`](docs/setup-guide.md) for comprehensive setup
- See [`docs/deployment-checklist.md`](docs/deployment-checklist.md) before deploying
- Read [`docs/api-reference.md`](docs/api-reference.md) for API details
- Check [`docs/testing-guide.md`](docs/testing-guide.md) for QA procedures

---

## Deploy to Vercel

When ready to deploy:

```bash
# Push to GitHub
git add .
git commit -m "Initial Move Ready Plus implementation"
git branch -M main
git remote add origin <your-repo>
git push -u origin main

# Then in Vercel:
# 1. Import repository
# 2. Add environment variables
# 3. Deploy
```

See [`docs/deployment-checklist.md`](docs/deployment-checklist.md) for full deployment guide.
