# Move Ready Plus - Deployment Checklist

Complete this checklist before deploying to production.

---

## Pre-Deployment

### Database

- [ ] Supabase project created and accessible
- [ ] Migration `001_initial_schema.sql` executed successfully
- [ ] All tables created: profiles, crews, jobs, assignment_events, error_logs
- [ ] Indexes verified (run: `SELECT * FROM pg_indexes WHERE schemaname = 'public'`)
- [ ] RLS enabled on all tables (check: `SELECT * FROM pg_tables WHERE rowsecurity = true`)
- [ ] Realtime replication enabled for jobs, crews, assignment_events
- [ ] Test users created with correct roles
- [ ] Seed data populated (crews and sample jobs)

### Authentication

- [ ] Email auth provider enabled in Supabase
- [ ] Test accounts created:
  - dispatcher@test.com
  - manager@test.com
  - driver@test.com
- [ ] Profiles table populated with user roles
- [ ] RLS policies tested for each role

### Environment Variables

- [ ] `.env.local` created locally (not committed)
- [ ] All required variables set:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_GEOAPIFY_KEY`
- [ ] Service role key never exposed to client-side code
- [ ] `.env.example` up to date with placeholder values

---

## Local Testing

### Core Features

- [ ] Login works for all user roles
- [ ] Dispatcher can drag-and-drop assign jobs
- [ ] Conflict detection prevents double-booking
- [ ] Manager sees analytics with correct metrics
- [ ] Driver sees only assigned jobs and can update status
- [ ] Realtime updates work across multiple tabs
- [ ] Map displays crew locations correctly
- [ ] Risk flags appear for delayed jobs
- [ ] Error boundary catches and logs errors

### Failure Scenarios

- [ ] Realtime disconnect → degraded mode banner appears
- [ ] Realtime disconnect → polling fallback active (15s interval)
- [ ] Assignment conflict → error message displays, optimistic update reverts
- [ ] Unauthorized access → redirects to login
- [ ] Invalid credentials → error message displays

### Performance

- [ ] Initial load < 2 seconds (dev server)
- [ ] Jobs table with 100+ rows renders smoothly
- [ ] No console errors
- [ ] No React hydration warnings
- [ ] Map loads within 1 second

---

## Code Quality

### Linting & Type Checking

```bash
npm run lint        # No errors
npm run type-check  # No TypeScript errors
```

### Design System Compliance

- [ ] All spacing uses 4px multiples
- [ ] No inline styles (Tailwind classes only)
- [ ] Buttons follow design system (primary, secondary, destructive)
- [ ] Status badges use correct colors
- [ ] Forms have labels above inputs
- [ ] Tables have sticky headers
- [ ] Numeric columns use monospace font

---

## Vercel Deployment

### Repository Setup

```bash
git init
git add .
git commit -m "Initial Move Ready Plus implementation"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Vercel Configuration

1. **Import Project**
   - [ ] Repository connected to Vercel
   - [ ] Framework preset: Next.js
   - [ ] Root directory: ./
   - [ ] Build command: `npm run build`

2. **Environment Variables**

   Set in Vercel Dashboard → Settings → Environment Variables:

   - [ ] `SUPABASE_URL`
   - [ ] `SUPABASE_ANON_KEY`
   - [ ] `SUPABASE_SERVICE_ROLE_KEY`
   - [ ] `NEXT_PUBLIC_SUPABASE_URL`
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - [ ] `NEXT_PUBLIC_GEOAPIFY_KEY`

3. **Deploy**
   - [ ] Initial deployment successful
   - [ ] Build logs show no errors
   - [ ] Production URL accessible

---

## Post-Deployment Verification

### Production Testing

- [ ] Visit production URL
- [ ] Login as dispatcher → verify dispatch board works
- [ ] Assign a job → verify assignment succeeds
- [ ] Open second tab → verify Realtime propagates
- [ ] Login as manager → verify analytics loads
- [ ] Login as driver → verify job list shows correct jobs
- [ ] Update job status → verify updates work
- [ ] Test on mobile device (responsive layout)

### Monitoring Setup

- [ ] Vercel Analytics enabled (optional)
- [ ] Supabase Dashboard → Logs reviewed
- [ ] Error logs table checked (should be empty or minimal)
- [ ] No 500 errors in Vercel function logs

### Performance Metrics

- [ ] Lighthouse audit on /dashboard: Performance > 85
- [ ] Lighthouse audit on /dashboard: Accessibility > 95
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

---

## Security Verification

### Environment Security

- [ ] `.env.local` in `.gitignore`
- [ ] No secrets committed to Git (check: `git log --all --full-history -- "*.env*"`)
- [ ] Service role key used only in server-side route handlers
- [ ] HTTPS enforced (Vercel default)

### RLS Testing

Test with actual Supabase SQL:

```sql
-- Test as dispatcher (replace user_id with test user's UUID)
SET request.jwt.claims = '{"sub": "dispatcher_user_id"}';
SELECT * FROM jobs; -- Should return all jobs

-- Test as driver
SET request.jwt.claims = '{"sub": "driver_user_id"}';
SELECT * FROM jobs; -- Should return only assigned jobs
```

### Access Control

- [ ] Unauthenticated users redirected to /login
- [ ] Drivers cannot access /analytics
- [ ] Managers cannot POST to /api/assign
- [ ] Cross-role data leakage prevented

---

## Rollback Plan

If critical issues found in production:

1. **Immediate Rollback**
   ```bash
   # In Vercel Dashboard
   Deployments → Previous deployment → Promote to Production
   ```

2. **Investigation**
   - Check Vercel function logs
   - Review Supabase database logs
   - Check error_logs table
   - Review user reports

3. **Fix & Redeploy**
   - Fix issue locally
   - Test thoroughly
   - Create new deployment
   - Monitor for 1 hour

---

## Launch Readiness Checklist

### Documentation

- [ ] README.md complete
- [ ] Setup guide (`docs/setup-guide.md`) verified
- [ ] API reference (`docs/api-reference.md`) accurate
- [ ] Testing guide (`docs/testing-guide.md`) complete

### Training

- [ ] Dispatchers trained on assignment flow
- [ ] Managers trained on analytics interpretation
- [ ] Drivers trained on status update flow
- [ ] Support team briefed on common issues

### Communication

- [ ] Internal announcement drafted
- [ ] Support channel established (Slack/email)
- [ ] Feedback mechanism in place
- [ ] On-call rotation defined (if applicable)

---

## Go-Live

### T-1 Day

- [ ] Final QA pass
- [ ] Database backups verified
- [ ] Credentials rotated (if exposed during testing)
- [ ] Team notified of launch window

### Launch Day

- [ ] Deploy to production
- [ ] Smoke test all critical paths
- [ ] Monitor logs for 1 hour
- [ ] Alert team that system is live

### T+1 Hour

- [ ] Check error_logs table
- [ ] Review Vercel function logs
- [ ] Verify Realtime connections stable
- [ ] No critical errors reported

### T+1 Day

- [ ] Gather user feedback
- [ ] Review analytics metrics
- [ ] Check for performance issues
- [ ] Document any unexpected behavior

---

## Success Metrics

Track these KPIs post-launch:

1. **System Uptime:** > 99.5%
2. **Average Assignment Time:** < 30 seconds
3. **Realtime Latency:** < 2 seconds
4. **Error Rate:** < 1%
5. **User Adoption:** 80% of dispatchers using within 1 week

---

## Post-Launch Iteration

After 1 week:

- [ ] Review error logs for patterns
- [ ] Analyze most-used features
- [ ] Identify performance bottlenecks
- [ ] Gather qualitative feedback
- [ ] Create backlog for improvements
- [ ] Write postmortem (per PTRD §8)

---

## Emergency Contacts

Document here:

- **Supabase Support:** https://supabase.com/support
- **Vercel Support:** https://vercel.com/support
- **On-Call Engineer:** [Name/Contact]
- **Project Owner:** [Name/Contact]
