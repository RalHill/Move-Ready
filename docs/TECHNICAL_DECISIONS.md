# Technical Decisions & Architecture

## Overview
This document explains the key technical decisions made during the development of Move Ready Plus and the reasoning behind them.

## Layout Architecture

### Decision: CSS Grid over Flexbox
**Chosen**: CSS Grid with `grid-cols-[auto_1fr] grid-rows-[auto_1fr]`
**Alternative**: Flexbox with `flex-direction: column` and calculated heights

**Rationale**:
1. **Eliminated Dead Space**: Grid's fractional units (`1fr`) automatically fill available space without manual height calculations
2. **Simpler Mental Model**: Two-dimensional layout (rows + columns) is more intuitive than nested flex containers
3. **Better Browser Support**: Modern browsers handle Grid more predictably than complex flex layouts
4. **Easier Maintenance**: Adding/removing layout sections doesn't require recalculating flex-grow values

**Implementation**:
```tsx
<div className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] h-screen">
  <Sidebar className="row-span-2" />  {/* Spans both rows */}
  <Header className="col-start-2" />  {/* Top of second column */}
  <main className="col-start-2 overflow-auto">  {/* Fills remaining space */}
    {children}
  </main>
</div>
```

## State Management

### Decision: React State + Optimistic UI over Redux/Zustand
**Chosen**: `useState` + `useEffect` with Supabase Realtime
**Alternative**: Redux Toolkit, Zustand, or Recoil

**Rationale**:
1. **Reduced Complexity**: No global store boilerplate needed for this scale
2. **Co-location**: State lives near components that use it
3. **Real-Time First**: Supabase subscriptions automatically sync state across clients
4. **Optimistic Updates**: Direct state mutations provide instant feedback before server confirmation

**Example**:
```tsx
// Optimistic update
setJobs(prev => prev.map(j => 
  j.id === jobId ? { ...j, crew_id: crewId } : j
));

// Server sync (happens in background)
await supabase.from('jobs').update({ crew_id: crewId }).eq('id', jobId);
```

## Data Storage

### Decision: LocalStorage for Settings, Supabase for Operational Data
**Chosen**: Hybrid approach
**Alternative**: All data in Supabase, or all in browser storage

**Rationale**:
1. **Performance**: Settings load instantly from localStorage (no API call)
2. **Device-Specific**: Theme and notification preferences are personal, not synced across devices
3. **Cost**: Reduces database reads for frequently accessed non-critical data
4. **Privacy**: User preferences stay local unless explicitly shared

**Implementation**:
```tsx
// Settings stored locally
localStorage.setItem('user_settings', JSON.stringify(settings));
localStorage.setItem('theme', theme);

// Operational data in Supabase
supabase.from('jobs').insert({ customer_name, address, ... });
```

## Dark Mode

### Decision: Class-based Dark Mode with Context API
**Chosen**: Tailwind's `dark:` variant + React Context
**Alternative**: CSS variables with data attributes, or separate stylesheets

**Rationale**:
1. **Type Safety**: Tailwind classes are autocompleted and checked by ESLint
2. **Performance**: No runtime CSS variable calculations
3. **Developer Experience**: Write `dark:bg-gray-800` directly in JSX
4. **Persistence**: Context + localStorage ensures theme survives page reloads

**Implementation**:
```tsx
// Provider manages theme state
<ThemeProvider>
  {children}
</ThemeProvider>

// Components use dark: prefix
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-gray-100">Content</p>
</div>
```

## Form Validation

### Decision: Zod for Runtime Validation
**Chosen**: Zod schemas
**Alternative**: Yup, Joi, or manual validation

**Rationale**:
1. **Type Inference**: TypeScript types automatically inferred from schemas
2. **Composability**: Schemas can be split by form step (`step1Schema`, `step2Schema`)
3. **Transform Support**: Auto-uppercase license plates, parse phone numbers
4. **Bundle Size**: Zod is lightweight (~8KB gzipped)

**Example**:
```tsx
export const addCrewSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  licensePlate: z.string().transform(val => val.toUpperCase()),
});

// TypeScript type automatically generated
type AddCrewFormData = z.infer<typeof addCrewSchema>;
```

## Real-Time Updates

### Decision: Supabase Realtime over WebSockets
**Chosen**: Supabase Realtime channels
**Alternative**: Socket.io, Pusher, or Ably

**Rationale**:
1. **Integrated**: No separate WebSocket server to manage
2. **Row-Level Security**: Respects database RLS policies automatically
3. **Automatic Reconnection**: Built-in retry logic and presence tracking
4. **Ease of Use**: Subscribe to table changes with simple API

**Implementation**:
```tsx
useEffect(() => {
  const channel = supabase
    .channel('jobs-updates')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'jobs' },
      (payload) => {
        setJobs(prev => prev.map(j => 
          j.id === payload.new.id ? payload.new : j
        ));
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

## Mobile Responsiveness

### Decision: Hamburger Menu for Small Screens
**Chosen**: Fixed sidebar on desktop, slide-in drawer on mobile
**Alternative**: Bottom navigation bar, or always-hidden sidebar with toggle

**Rationale**:
1. **Familiar Pattern**: Users expect hamburger menus on mobile
2. **Screen Real Estate**: Drawer only appears when needed, maximizing content space
3. **Accessibility**: Keyboard-accessible with Escape key to close
4. **Smooth Transitions**: CSS animations provide polished feel

**Breakpoints**:
- `< 768px`: Hamburger menu
- `768px - 1024px`: Visible sidebar, 2-column layouts
- `> 1024px`: Full sidebar, 3-4 column grids

## Component Architecture

### Decision: Server Components by Default, Client Only When Needed
**Chosen**: React Server Components (RSC) in Next.js App Router
**Alternative**: Client-side rendering for all components

**Rationale**:
1. **Performance**: Server components don't send JavaScript to browser
2. **Data Fetching**: Fetch directly in component without useEffect
3. **Security**: API keys stay on server
4. **SEO**: Content rendered server-side for better indexing

**Pattern**:
```tsx
// page.tsx (Server Component)
export default async function AnalyticsPage() {
  const data = await fetchData(); // Happens on server
  return <AnalyticsContent data={data} />;
}

// analytics-content.tsx (Client Component)
"use client";
export function AnalyticsContent({ data }) {
  const [filters, setFilters] = useState(...);
  // Interactive logic here
}
```

## Performance Optimizations

### Decision: Dynamic Imports for Heavy Components
**Chosen**: `next/dynamic` with `{ ssr: false }` for maps
**Alternative**: Bundle all JavaScript upfront

**Rationale**:
1. **Faster Initial Load**: Leaflet (200KB+) only loads on tracking page
2. **Hydration Safety**: Map libraries expect browser APIs not available during SSR
3. **Route-Based Splitting**: Each page loads only what it needs

**Implementation**:
```tsx
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
```

## Testing Strategy (Future)

### Recommended: Vitest + Testing Library
**Reason**: Fast, modern, TypeScript-first
**Alternative**: Jest + Enzyme (older, slower)

**Approach**:
1. **Unit Tests**: Utility functions, validation schemas
2. **Component Tests**: User interactions, form submissions
3. **Integration Tests**: Real database queries with test fixtures
4. **E2E Tests**: Playwright for critical flows (login, job assignment)

## Deployment

### Recommended: Vercel
**Reason**: Built by Next.js creators, automatic preview URLs
**Alternative**: Netlify, AWS Amplify, or self-hosted

**Configuration**:
- Environment variables in Vercel dashboard
- Preview deployments for each PR
- Automatic optimization (compression, caching, CDN)

## Conclusion

These decisions prioritize:
1. **Developer Experience**: Fast iteration with TypeScript, Tailwind, and Zod
2. **User Experience**: Instant feedback, dark mode, responsive design
3. **Maintainability**: Simple architecture, co-located state, clear patterns
4. **Performance**: Code splitting, optimistic UI, efficient re-renders
5. **Scalability**: Real-time infrastructure ready for 100+ concurrent users

Every choice was made with the goal of creating a **portfolio-grade project** that demonstrates **senior-level frontend engineering** capabilities.
