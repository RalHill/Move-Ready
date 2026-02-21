# MOVE READY PLUS

Real-Time Moving Operations Command Center

Deployment target: **Vercel (frontend + route handlers) + Supabase (Postgres, Auth, Realtime)**
Free stack only.

---

# 1. INTENT LOCK (PTRD)

## 1.1 Product Definition

**Move Ready** is an internal operations dashboard for a moving company that enables dispatchers and managers to coordinate crews, monitor live job progress, and detect operational risks in real time.

It is a production-grade portfolio system designed to demonstrate senior-level frontend capability with full-stack architectural awareness.

---

## 1.2 Primary Users

### Dispatcher

* Assign crews to jobs
* Monitor live job progress
* Resolve scheduling conflicts
* Adjust ETAs

### Operations Manager

* Monitor performance metrics
* Review delays and risk flags
* Analyze crew efficiency

### Driver (Limited Interface)

* View assigned jobs
* Update job status
* Send incident reports

---

## 1.3 Decisions Enabled

The system must enable:

1. Assigning crews without double booking.
2. Detecting high-risk or delayed jobs.
3. Reallocating crews based on live location.
4. Viewing operational efficiency metrics.
5. Identifying bottlenecks in real time.

If these decisions cannot be made clearly from the interface, the system fails.

---

## 1.4 User Flow (Primary Path)

### Dispatcher Flow

1. Login
2. Land on Dispatch Board
3. View unassigned jobs
4. Drag job onto crew column
5. Backend validates assignment
6. Realtime update propagates
7. Job moves to "Assigned"
8. Live GPS updates move crew marker
9. If delay detected → warning badge appears
10. Dispatcher reallocates if needed

---

### Manager Flow

1. Login
2. Navigate to Analytics
3. View:
   * Average job duration
   * Crew utilization %
   * Cancellation rate
4. Filter by date range
5. Export snapshot report

---

### Driver Flow

1. Login
2. View assigned job
3. Update job status:
   * En route
   * On site
   * Completed
4. Submit incident report if needed

---

## 1.5 Explicit Failure Scenarios

The PTRD must acknowledge failure.

1. Supabase Realtime disconnects
   * UI must show degraded mode banner
   * Poll fallback every 15 seconds

2. Double assignment race condition
   * Backend rejects conflicting insert
   * UI reverts optimistic update

3. Geoapify rate limit hit
   * Show ETA unavailable state
   * Retry with backoff

4. Unauthorized access attempt
   * Backend rejects via RLS
   * Log incident

5. High dataset load (1000+ jobs)
   * Table virtualization required
   * Render time must remain under 100ms

---

## 1.6 Non-Goals

Explicitly not building:

* Public customer booking UI
* Payment processing
* SMS integrations
* Push notifications
* Advanced ML routing
* Native mobile app
* Offline-first PWA

This is an internal operations system only.

---

## 1.7 Deployment Target

Frontend:
Vercel (Next.js App Router)

Backend:
Supabase:
* Postgres
* Auth
* Realtime
* Row Level Security

No custom WebSocket server.
No Render.
No Railway.

---

## 1.8 Monitoring Responsibilities

Monitoring will include:

* Supabase database logs
* Vercel function logs
* Structured console logs (JSON format)
* Error boundary capture + centralized error logger table
* Performance metrics:
  * First Contentful Paint
  * Table render duration
  * Realtime latency

Alerts:

* Realtime disconnection > 30 seconds
* DB error rate > 5%
* Assignment conflict spike

---

## 1.9 NO-AI-AUTO-IMPLEMENT List (Hard Rule)

AI must NOT scaffold automatically:

* RBAC logic
* Database schema
* RLS policies
* Conflict resolution logic
* Optimistic UI rollback logic
* Error boundary logic
* Performance virtualization logic
* Realtime subscription handling
* Auth flow
* Role claim extraction

AI may scaffold:

* Boilerplate layout components
* Basic Tailwind styling
* Storybook stories

Critical logic must be written manually.

---

# 2. CONTRACTS & INTERFACES (System Skeleton)

No UI beyond wireframes until this exists.

---

## 2.1 Domain Models (TypeScript)

User

```
id: string
email: string
role: 'dispatcher' | 'manager' | 'driver'
created_at: string
```

Crew

```
id: string
name: string
status: 'available' | 'assigned' | 'offline'
current_lat: number
current_lng: number
```

Job

```
id: string
customer_name: string
address: string
scheduled_time: string
status: 'unassigned' | 'assigned' | 'en_route' | 'on_site' | 'completed'
crew_id?: string
risk_flag: boolean
created_at: string
```

AssignmentEvent

```
job_id: string
crew_id: string
assigned_by: string
timestamp: string
```

---

## 2.2 API Endpoints (Route Handlers)

GET /api/jobs
POST /api/jobs
PATCH /api/jobs/:id
GET /api/crews
POST /api/assign

Auth required for all.

---

## 2.3 Auth Claims

JWT must contain:

```
{
  sub: user_id,
  role: 'dispatcher' | 'manager' | 'driver'
}
```

Backend enforces RBAC via RLS.

---

## 2.4 Events (Realtime)

Supabase subscriptions:

* jobs: UPDATE
* crews: UPDATE
* assignments: INSERT

---

# 3. DESIGN SYSTEM & UI INVARIANTS

Commit: `/docs/design-system.md`

---

## Palette

Primary: Deep Blue
Success: Green
Warning: Amber
Danger: Red
Neutral Gray Scale

---

## Typography

Heading: 600 weight
Body: 400 weight
Numeric tables: Monospace

---

## Spacing

4px base unit scale
All layout spacing multiple of 4

---

## Component Invariants

Buttons:

* Primary: filled
* Destructive: red only for irreversible actions
* Disabled: 40% opacity + no pointer events

Tables:

* Virtualized if > 50 rows
* Sticky header required

Forms:

* Label above input
* Inline error text only
* No placeholder as label

---

## Automated UI Invariants

* ESLint rule for no inline styles
* Storybook smoke test for components
* Accessibility lint in CI

---

# 4. VERTICAL SLICE 0

Scope:

* Supabase Auth
* Role-based login
* Protected dashboard route
* Fetch jobs
* Render basic table

Hard rule:
RBAC enforced via Supabase RLS.

Deploy to Vercel immediately.

---

# 5. CORE WORKFLOWS (Vertical Slices)

## Slice 1: Job Assignment

1. Commit API contract
2. Implement DB constraint
3. Implement RLS
4. Implement assign endpoint
5. Add optimistic UI
6. Add rollback logic
7. Add realtime subscription

---

## Slice 2: Live GPS Tracking

1. Add crew location updates
2. Subscribe to changes
3. Render Leaflet map
4. Fetch ETA via Geoapify
5. Add rate-limit fallback

---

## Slice 3: Risk Flagging

1. Add rule-based delay detection
2. Compute risk_flag in DB function
3. Show warning badges
4. Add manager dashboard widget

---

# 6. FINAL UI POLISH

* Apply full design system
* Lighthouse audit
* Axe accessibility scan
* Cross-browser validation
* Mobile layout adjustments

---

# 7. OBSERVABILITY, TESTING, RELEASE

Testing:

Unit:
* Assignment logic
* Conflict rejection
* Risk detection

Integration:
* Role-based access tests

E2E:
* Dispatcher full assignment flow
* Driver status update flow

Release Plan:

* Feature flags via DB column
* Canary: internal users only
* Rollback: revert Vercel deployment

---

# 8. POSTMORTEM & DELETION

After release:

* Write 1-page postmortem:
  * What broke
  * What scaled
  * What was overengineered
  * What would change

* Delete:
  * Experimental feature branches
  * Unused components
  * Dead schema tables

---

# Final Assessment

This PTRD:

* Enforces architectural discipline
* Demonstrates senior frontend maturity
* Proves production readiness
* Avoids infrastructure complexity
* Works entirely on free stack
* Deploys cleanly to Vercel
