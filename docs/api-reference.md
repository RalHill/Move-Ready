# Move Ready Plus - API Reference

All API endpoints require authentication via Supabase session cookie.

---

## Authentication

### Session Management

Sessions are managed via `@supabase/ssr` middleware. All authenticated requests automatically include the user's session.

**Auth Flow:**
1. User signs in via `/login` page
2. Supabase sets session cookie
3. Middleware validates session on each request
4. RLS enforces role-based access

---

## Endpoints

### GET /api/jobs

Fetch jobs visible to the current user.

**Authorization:**
- Dispatcher/Manager: all jobs
- Driver: only assigned jobs

**Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "customer_name": "string",
      "address": "string",
      "scheduled_time": "ISO8601",
      "status": "unassigned | assigned | en_route | on_site | completed",
      "crew_id": "uuid | null",
      "risk_flag": boolean,
      "created_at": "ISO8601"
    }
  ]
}
```

---

### POST /api/jobs

Create a new job.

**Authorization:** Dispatcher only

**Request:**
```json
{
  "customer_name": "string",
  "address": "string",
  "scheduled_time": "ISO8601"
}
```

**Response:**
```json
{
  "job": { /* Job object */ }
}
```

---

### PATCH /api/jobs/:id

Update job status.

**Authorization:**
- Dispatcher: all fields
- Driver: status only (en_route, on_site, completed)

**Request:**
```json
{
  "status": "en_route | on_site | completed"
}
```

**Response:**
```json
{
  "job": { /* Updated job */ }
}
```

---

### GET /api/crews

Fetch all crews.

**Authorization:** All authenticated users

**Response:**
```json
{
  "crews": [
    {
      "id": "uuid",
      "name": "string",
      "status": "available | assigned | offline",
      "current_lat": number,
      "current_lng": number,
      "updated_at": "ISO8601"
    }
  ]
}
```

---

### PATCH /api/crews/:id/location

Update crew GPS location.

**Authorization:**
- Dispatcher: any crew
- Driver: own crew only

**Request:**
```json
{
  "lat": number,
  "lng": number
}
```

**Response:**
```json
{
  "crew": { /* Updated crew */ }
}
```

---

### POST /api/assign

Assign a job to a crew.

**Authorization:** Dispatcher only

**Request:**
```json
{
  "job_id": "uuid",
  "crew_id": "uuid"
}
```

**Validation:**
- Job must be unassigned
- Crew must not have overlapping job (2-hour window)
- If conflict detected → returns 409

**Response (Success):**
```json
{
  "job": { /* Updated job with crew_id */ }
}
```

**Response (Conflict):**
```json
{
  "error": "Crew already assigned to overlapping job",
  "conflicting_job": { /* Conflicting job details */ }
}
```

---

### POST /api/risk-check

Manually trigger risk flag update.

**Authorization:** Dispatcher only

**Response:**
```json
{
  "success": true
}
```

**Note:** In production, this should run via cron (pg_cron) every 5 minutes.

---

### POST /api/error-log

Log client-side errors to database.

**Authorization:** All authenticated users (or anonymous)

**Request:**
```json
{
  "error_message": "string",
  "error_stack": "string",
  "context": { /* arbitrary JSON */ }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Realtime Subscriptions

### Jobs Channel

Subscribe to job updates:

```typescript
const supabase = createClient();

const channel = supabase
  .channel('jobs-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'jobs'
  }, (payload) => {
    console.log('Job update:', payload);
  })
  .subscribe();
```

### Crews Channel

Subscribe to crew location updates:

```typescript
const channel = supabase
  .channel('crews-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'crews'
  }, (payload) => {
    console.log('Crew update:', payload);
  })
  .subscribe();
```

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad request (validation error)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `409`: Conflict (double-booking, race condition)
- `500`: Internal server error

---

## Rate Limiting

**Geoapify:**
- Free tier: 3,000 requests/day
- Cache implemented: 5-minute TTL per route
- Fallback: Show "ETA unavailable" on 429

**Supabase:**
- Free tier: 50,000 monthly active users
- 500 MB database
- 2 GB bandwidth
- Realtime: 200 concurrent connections

---

## Testing APIs

### Using curl

```bash
# Login first (get session cookie)
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"dispatcher@test.com","password":"TestPass123!"}'

# Fetch jobs (use session cookie)
curl http://localhost:3001/api/jobs \
  -H "Cookie: sb-access-token=..."

# Assign job
curl -X POST http://localhost:3001/api/assign \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"job_id":"uuid","crew_id":"uuid"}'
```

### Using Browser DevTools

1. Login via UI
2. Open Network tab
3. Make request via UI
4. Inspect request/response in Network panel
5. Copy as cURL if needed

---

## Database Maintenance

### Manual Risk Flag Update

```sql
SELECT update_risk_flags();
```

### View Recent Assignments

```sql
SELECT 
  ae.timestamp,
  j.customer_name,
  c.name as crew_name,
  p.email as assigned_by_email
FROM assignment_events ae
JOIN jobs j ON j.id = ae.job_id
JOIN crews c ON c.id = ae.crew_id
JOIN profiles p ON p.id = ae.assigned_by
ORDER BY ae.timestamp DESC
LIMIT 20;
```

### Check Error Logs

```sql
SELECT 
  timestamp,
  user_id,
  error_message,
  context
FROM error_logs
ORDER BY timestamp DESC
LIMIT 50;
```

---

## Performance Optimization

### Enable Database Indexes

All indexes are created in migration. Verify with:

```sql
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Monitor Query Performance

Use Supabase Dashboard → Database → Query Performance to identify slow queries.

---

## Security Best Practices

1. **Never commit `.env.local`** - it's in .gitignore
2. **Rotate keys if exposed** - regenerate in Supabase/Geoapify dashboards
3. **Use service_role only server-side** - never expose to client
4. **Test RLS policies** - verify roles can't access unauthorized data
5. **Enable MFA for admin accounts** - Supabase + Vercel dashboards
6. **Review audit logs regularly** - Supabase Auth logs, error_logs table

---

## Deployment Checklist

Before deploying to production:

- [ ] All migrations run successfully in Supabase
- [ ] Test users created with correct roles
- [ ] Realtime enabled for jobs, crews, assignment_events
- [ ] Environment variables set in Vercel
- [ ] .env.local not committed to Git
- [ ] API endpoints return correct status codes
- [ ] RLS policies tested for all roles
- [ ] Error boundary captures and logs errors
- [ ] Map displays crews correctly
- [ ] Drag-and-drop assignment works
- [ ] Conflict detection prevents double-booking
- [ ] Risk flags update correctly

---

## Post-Deployment

1. Monitor Vercel function logs for errors
2. Check Supabase dashboard for connection spikes
3. Review error_logs table daily for first week
4. Gather user feedback from dispatchers
5. Iterate based on real-world usage
