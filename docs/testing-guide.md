# Move Ready Plus - Testing Guide

## Testing Strategy

This project follows a pragmatic testing approach focused on critical paths and business logic.

---

## Unit Tests

### Assignment Logic

Test the core business logic for job assignment and conflict detection.

**Test Cases:**

1. **Valid Assignment**
   - Given: unassigned job, available crew
   - When: dispatcher assigns job to crew
   - Then: job.crew_id set, job.status = 'assigned', crew.status = 'assigned'

2. **Double Booking Prevention**
   - Given: crew assigned to job from 10:00-12:00
   - When: dispatcher tries to assign same crew to job from 11:00-13:00
   - Then: API returns 409, job remains unassigned

3. **No Overlap Allowed**
   - Given: crew assigned to job from 10:00-12:00
   - When: dispatcher assigns same crew to job from 12:00-14:00
   - Then: assignment succeeds (no overlap)

### Risk Detection

**Test Cases:**

1. **Job Delayed**
   - Given: job scheduled for 1 hour ago, status not 'completed'
   - When: update_risk_flags() runs
   - Then: job.risk_flag = true

2. **Job On Time**
   - Given: job scheduled for future, or completed
   - When: update_risk_flags() runs
   - Then: job.risk_flag = false

---

## Integration Tests

### Role-Based Access Control

**Test Cases:**

1. **Dispatcher Access**
   - Can: read all jobs, create jobs, assign crews, update jobs
   - Cannot: N/A (full access)

2. **Manager Access**
   - Can: read all jobs, read all crews, view analytics
   - Cannot: assign jobs, update jobs, create jobs

3. **Driver Access**
   - Can: read assigned jobs, update job status (en_route, on_site, completed)
   - Cannot: see unassigned jobs, assign jobs, access analytics

**Test Method:**
1. Create test users with different roles in Supabase Auth
2. Login as each user
3. Attempt various API calls
4. Verify RLS enforces permissions

---

## End-to-End Tests

### Dispatcher Assignment Flow

**Steps:**
1. Login as dispatcher@test.com
2. Navigate to /dashboard
3. Verify unassigned jobs visible
4. Drag job to crew column
5. Verify optimistic update (job moves immediately)
6. Verify API call succeeds
7. Open incognito window, login as manager
8. Verify Realtime update propagates (job shows as assigned)

### Driver Status Update Flow

**Steps:**
1. Login as driver@test.com
2. Navigate to /driver/jobs
3. Verify assigned job visible
4. Click "En Route" button
5. Verify status updates
6. Click "On Site" button
7. Verify status updates
8. Click "Complete" button
9. Verify job marked completed
10. Open dispatcher window → verify Realtime update

### Conflict Detection Flow

**Steps:**
1. Login as dispatcher
2. Assign Crew Alpha to Job A (10:00-12:00)
3. Attempt to assign Crew Alpha to Job B (11:00-13:00)
4. Verify error message displays
5. Verify optimistic update rolls back
6. Verify Job B remains unassigned

---

## Manual QA Checklist

### Functionality

- [ ] Login works for all user roles
- [ ] Dashboard displays correct data per role
- [ ] Drag-and-drop assignment works
- [ ] Conflict detection prevents double-booking
- [ ] Realtime updates propagate across tabs
- [ ] Map displays crew locations
- [ ] Risk flags appear for delayed jobs
- [ ] Analytics show correct metrics
- [ ] Driver can update job status
- [ ] Error boundary catches errors

### UI/UX

- [ ] Design system colors applied correctly
- [ ] Buttons have correct states (hover, disabled)
- [ ] Forms show inline errors
- [ ] Tables have sticky headers
- [ ] Status badges match design system
- [ ] Mobile layout works (< 768px)
- [ ] Loading states present for async actions
- [ ] Error messages are user-friendly

### Performance

- [ ] Initial page load < 2 seconds
- [ ] Table renders large datasets (100+ rows) smoothly
- [ ] Realtime updates don't cause jank
- [ ] Map loads within 1 second
- [ ] No console errors in production build

### Accessibility

- [ ] All interactive elements keyboard-accessible
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] ARIA labels on icon-only buttons
- [ ] Form labels present (not just placeholders)
- [ ] Screen reader compatible

---

## Automated Testing Tools

### Lighthouse (Performance & Accessibility)

```bash
# Run production build locally
npm run build
npm start

# Open Chrome DevTools → Lighthouse
# Run audit on /dashboard
# Target: Performance > 90, Accessibility > 95
```

### ESLint (Code Quality)

```bash
npm run lint
```

### Type Check

```bash
npm run type-check
```

---

## Testing Realtime Failure

### Simulate Disconnect

1. Open browser DevTools → Network tab
2. Set throttling to "Offline"
3. Wait 5 seconds
4. Verify degraded mode banner appears
5. Set throttling back to "Online"
6. Verify banner disappears

### Verify Polling Fallback

1. Disconnect Realtime (as above)
2. In another tab, assign a job
3. Wait 15 seconds
4. Verify job updates in disconnected tab (via polling)

---

## Load Testing

### Simulate High Job Count

```sql
-- Insert 500 test jobs
INSERT INTO public.jobs (customer_name, address, scheduled_time, status)
SELECT 
  'Customer ' || generate_series,
  generate_series || ' Main St, Toronto ON',
  NOW() + (generate_series || ' hours')::interval,
  'unassigned'
FROM generate_series(1, 500);
```

Verify:
- Table virtualization activates (> 50 rows)
- Render time < 100ms
- No performance degradation

### Concurrent Assignments

1. Open 3 dispatcher tabs
2. Simultaneously assign same job to different crews
3. Verify only one succeeds
4. Others receive 409 conflict error

---

## Regression Testing

After each major change:

1. Run full manual QA checklist
2. Test all user roles
3. Verify no existing features broke
4. Check browser console for new errors
5. Review Supabase logs for RLS violations

---

## Bug Reporting Template

When reporting bugs:

```markdown
**Role:** dispatcher | manager | driver
**Page:** /dashboard | /analytics | /driver/jobs
**Steps to Reproduce:**
1. Step one
2. Step two
3. ...

**Expected:** What should happen
**Actual:** What actually happened
**Browser:** Chrome 120 / Safari 17 / Firefox 121
**Error Logs:** (paste from console or error_logs table)
```

---

## Known Limitations

1. **No offline support** - requires active internet
2. **Geoapify rate limits** - 3,000 requests/day (free tier)
3. **Supabase connection limits** - 200 concurrent Realtime connections
4. **No push notifications** - users must keep dashboard open
5. **No mobile app** - web-only, responsive design for tablets

---

## Future Testing Considerations

When scaling beyond demo:

- Add automated E2E tests (Playwright/Cypress)
- Set up CI/CD testing pipeline
- Implement visual regression testing (Percy/Chromatic)
- Add performance monitoring (Sentry/DataDog)
- Set up staged rollouts with canary deployments
