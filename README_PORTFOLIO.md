# Move Ready Plus - Real-Time Moving Operations Platform

A production-ready, enterprise-grade dashboard for managing moving operations with real-time crew tracking, job dispatch, and comprehensive analytics.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Key Features

### Real-Time Operations Management
- **Live Crew Tracking**: Real-time GPS tracking with interactive maps powered by Leaflet
- **Drag-and-Drop Dispatch**: Intuitive job assignment with optimistic UI updates
- **Smart Job Prioritization**: Automatic risk flagging based on scheduled times
- **Instant Notifications**: Real-time alerts for delays, completions, and urgent situations

### Advanced Analytics
- **Performance Metrics**: Track completion rates, crew utilization, and job throughput
- **Interactive Charts**: Visual representations of daily performance and trends
- **Risk Management**: Automated identification of at-risk jobs
- **CSV Export**: Generate detailed reports for stakeholders

### Modern User Experience
- **Full Dark Mode**: Comprehensive theme system with instant switching
- **Mobile-First Design**: Responsive hamburger menu and optimized layouts
- **Loading States**: Skeleton screens and smooth transitions
- **Accessibility**: WCAG AA compliant with proper contrast ratios and ARIA labels

### Enterprise Features
- **Role-Based Access**: Dispatcher, Manager, and Driver roles with granular permissions
- **3-Step Crew Onboarding**: Validated multi-step form with Zod schemas
- **Settings Management**: Comprehensive user preferences including timezone, date format, and notifications
- **Toast Notifications**: Contextual feedback for all user actions

## 🛠 Technical Stack

### Frontend
- **Framework**: Next.js 16 (App Router, React Server Components)
- **UI**: React 19 with TypeScript 5.7
- **Styling**: Tailwind CSS 4 with dark mode support
- **State**: React hooks with optimistic UI patterns
- **Icons**: Lucide React for consistent iconography
- **Forms**: Zod for runtime validation
- **Notifications**: React Hot Toast with custom theming

### Backend
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with email/password
- **Real-Time**: Supabase Realtime subscriptions for live updates
- **API**: Next.js Route Handlers (API Routes)

### Maps & Visualization
- **Mapping**: React Leaflet with OpenStreetMap tiles
- **Charts**: Custom SVG-based charts with responsive design
- **Virtual Lists**: @tanstack/react-virtual for performance

## 🏗 Architecture Highlights

### CSS Grid Layouts
Eliminated layout "dead space" with a robust CSS Grid system:
```typescript
<div className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] h-screen overflow-hidden">
  <Sidebar className="row-span-2" />
  <Header className="col-start-2" />
  <main className="col-start-2 overflow-auto">
    {children}
  </main>
</div>
```

### Theme Provider
Persistent dark mode with localStorage:
```typescript
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  // Manages theme state and localStorage persistence
  // Applies 'dark' class to document.documentElement
}
```

### Optimistic UI Updates
Instant feedback for crew assignments:
```typescript
async function handleAssignJob(jobId: string, crewId: string) {
  // Update local state immediately
  setJobs(prev => prev.map(j => 
    j.id === jobId ? { ...j, crew_id: crewId } : j
  ));
  
  // Then sync with database
  await supabase.from('jobs').update({ crew_id: crewId }).eq('id', jobId);
}
```

### Real-Time Subscriptions
Automatic UI updates via Supabase channels:
```typescript
useEffect(() => {
  const channel = supabase
    .channel('jobs-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' },
      (payload) => {
        if (payload.eventType === 'UPDATE') {
          setJobs(prev => prev.map(j => 
            j.id === payload.new.id ? payload.new : j
          ));
        }
      }
    )
    .subscribe();
  
  return () => supabase.removeChannel(channel);
}, []);
```

## 📱 Responsive Design

### Mobile Breakpoints
- `< 768px`: Hamburger menu, single-column cards, stacked charts
- `768px - 1024px`: 2-column grids, visible sidebar
- `> 1024px`: 3-4 column grids, full feature set

### Mobile Menu
Slide-in navigation with backdrop:
```tsx
<MobileMenu
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  userRole={userRole}
  userName={userName}
/>
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue 600 (#2563eb) for actions and active states
- **Success**: Green 600 (#16a34a) for completions
- **Warning**: Amber 800 (#92400e) with Amber 50 background for WCAG AA compliance
- **Danger**: Red 600 (#dc2626) for errors and urgency

### Typography
- **Headings**: Semibold for hierarchy
- **Body**: Regular system font stack
- **Code**: Monospace for coordinates and technical data

### Spacing
Consistent 4px base unit with Tailwind's spacing scale (1 = 4px, 2 = 8px, etc.)

## 🔒 Security

### Row Level Security (RLS)
All Supabase tables enforce RLS policies:
- Users can only access data for their role
- Managers have full access to all operations
- Drivers can only view their assigned jobs

### Authentication
- Secure email/password authentication via Supabase Auth
- Session management with HTTP-only cookies
- Automatic token refresh

### Input Validation
- Zod schemas for all form inputs
- Server-side validation for API routes
- SQL injection protection via Supabase parameterized queries

## ⚡ Performance Optimizations

### Code Splitting
- Dynamic imports for heavy components (Leaflet maps)
- Route-based code splitting via Next.js App Router
- Lazy loading of modals and dropdowns

### Memoization
- `React.memo()` for expensive components (cards, charts)
- `useMemo()` for filtered/sorted data
- Debounced search inputs (300ms delay)

### Suspense Boundaries
- Loading skeletons for async data fetching
- Graceful fallbacks during navigation
- Progressive enhancement

## 🧪 Quality Assurance

### Type Safety
- Strict TypeScript configuration
- Shared types across client/server
- Zod runtime validation for external data

### Linting
- ESLint with React hooks and TypeScript rules
- Prettier for consistent formatting
- Pre-commit hooks (recommended)

### Accessibility
- WCAG AA contrast ratios (7:1 for text)
- Keyboard navigation support
- ARIA labels for interactive elements
- Focus trapping in modals
- Screen reader tested

## 📦 Project Structure

```
move-ready/
├── app/                      # Next.js App Router pages
│   ├── analytics/           # Analytics dashboard
│   ├── crews/               # Crew management
│   ├── dashboard/           # Main dispatch board
│   ├── settings/            # User settings
│   └── tracking/            # Live crew tracking
├── components/
│   ├── analytics/           # Charts and metrics
│   ├── crews/               # Crew list components
│   ├── dispatch/            # Dispatch board logic
│   ├── layout/              # Sidebar, header, wrappers
│   ├── modals/              # Add crew, assign job
│   ├── notifications/       # Notification dropdown
│   ├── settings/            # Settings sections
│   ├── tracking/            # Map and crew cards
│   └── ui/                  # Reusable components
├── lib/
│   ├── supabase/            # Supabase client/server
│   ├── theme-provider.tsx   # Dark mode context
│   ├── export-utils.ts      # CSV generation
│   ├── utils.ts             # Utility functions
│   └── validations/         # Zod schemas
├── types/
│   └── domain.ts            # TypeScript interfaces
└── docs/
    └── ui-improvements.md   # Implementation notes
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/move-ready.git
cd move-ready
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Database Setup

Run the SQL migrations in `supabase/migrations/` to set up:
- Users table with role-based access
- Jobs table with crew assignments
- Crews table with location tracking
- RLS policies for security

## 🎯 Roadmap

### Completed ✅
- CSS Grid layouts for 100vh height
- Mobile hamburger menu with responsive design
- WCAG AA contrast for at-risk warnings
- Full application dark mode
- 3-step Add Crew modal with validation
- Comprehensive Settings page
- Functional analytics charts and export
- Working search and View All filtering
- Loading skeletons for all async components
- Standardized button states
- Functional notification bell
- Toast notification system

### Future Enhancements
- WebSocket support for sub-second updates
- Route optimization algorithms
- Historical analytics with time-range filtering
- PDF report generation
- SMS notifications for crews
- Mobile app (React Native)
- Multi-language support (i18n)

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome! Please open an issue to discuss proposed changes.

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Your Name**
- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS
