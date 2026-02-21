# Move Ready Plus - Design System

## Color Palette

### Primary (Deep Blue)
- `primary-50`: #eff6ff
- `primary-100`: #dbeafe
- `primary-600`: #2563eb
- `primary-700`: #1d4ed8
- `primary-800`: #1e40af (Default)

### Success (Green)
- `success-50`: #f0fdf4
- `success-100`: #dcfce7
- `success-600`: #16a34a (Default)
- `success-700`: #15803d

### Warning (Amber)
- `warning-50`: #fffbeb
- `warning-100`: #fef3c7
- `warning-500`: #f59e0b (Default)
- `warning-600`: #d97706

### Danger (Red)
- `danger-50`: #fef2f2
- `danger-100`: #fee2e2
- `danger-600`: #dc2626 (Default)
- `danger-700`: #b91c1c

### Neutral Gray Scale
- `gray-50`: #f9fafb
- `gray-100`: #f3f4f6
- `gray-200`: #e5e7eb
- `gray-300`: #d1d5db
- `gray-400`: #9ca3af
- `gray-500`: #6b7280
- `gray-600`: #4b5563
- `gray-700`: #374151
- `gray-800`: #1f2937
- `gray-900`: #111827

---

## Typography

### Headings
- Font weight: 600 (semibold)
- Line height: 1.2

### Body
- Font weight: 400 (normal)
- Line height: 1.5

### Numeric Tables
- Font family: Consolas, Monaco, Courier New, monospace
- Font weight: 400
- Tabular nums: enabled

---

## Spacing Scale

Base unit: 4px
All layout spacing must be a multiple of 4.

| Token | Value |
|-------|-------|
| spacing-1 | 4px |
| spacing-2 | 8px |
| spacing-3 | 12px |
| spacing-4 | 16px |
| spacing-5 | 20px |
| spacing-6 | 24px |
| spacing-8 | 32px |
| spacing-10 | 40px |
| spacing-12 | 48px |
| spacing-16 | 64px |
| spacing-20 | 80px |
| spacing-24 | 96px |

---

## Component Invariants

### Buttons

**Primary Button**
- Background: `primary-800`
- Hover: `primary-700`
- Text: white
- Padding: 8px 16px (vertical, horizontal)
- Border radius: 6px

**Secondary Button**
- Background: transparent
- Border: 1px solid `gray-300`
- Hover: `gray-50`
- Text: `gray-700`

**Destructive Button**
- Background: `danger-600`
- Hover: `danger-700`
- Text: white
- **Use only for irreversible actions** (delete, remove)

**Disabled State**
- Opacity: 40%
- No pointer events
- Cursor: not-allowed

---

### Tables

**Structure**
- Sticky header required (position: sticky, top: 0)
- Zebra striping: even rows `gray-50`
- Hover: `gray-100`

**Virtualization**
- If row count > 50: use `@tanstack/react-virtual`
- Target render time: < 100ms

**Typography**
- Headers: font-weight 600, `gray-900`
- Body: font-weight 400, `gray-700`
- Numeric columns: font-family monospace, text-align right

---

### Forms

**Layout**
- Label above input (never as placeholder)
- Spacing: 8px between label and input
- Input height: 40px

**Validation**
- Inline error text below input
- Error text color: `danger-600`
- Error border: 1px solid `danger-600`

**Input States**
- Default: border `gray-300`
- Focus: border `primary-600`, outline ring
- Error: border `danger-600`
- Disabled: background `gray-100`, opacity 60%

---

### Status Badges

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Unassigned | `gray-100` | `gray-700` | none |
| Assigned | `primary-100` | `primary-800` | none |
| En Route | `warning-100` | `warning-700` | none |
| On Site | `warning-50` | `warning-600` | none |
| Completed | `success-100` | `success-700` | none |
| Risk Flag | `danger-100` | `danger-700` | 1px `danger-600` |

---

## Layout Standards

### Sidebar
- Width: 240px
- Background: `gray-900`
- Text: `gray-100`
- Active link: `primary-600` background

### Main Content
- Padding: 24px
- Max width: 1400px
- Background: white

### Cards
- Border: 1px solid `gray-200`
- Border radius: 8px
- Padding: 16px
- Shadow: subtle (0 1px 3px rgba(0,0,0,0.1))

---

## Automated UI Invariants

### ESLint Rules
- No inline styles (use Tailwind classes only)
- No unused CSS classes
- Accessibility: require alt text, ARIA labels

### Storybook
- Smoke test for all components
- Visual regression via snapshot comparison

### CI Checks
- Lighthouse score: Performance > 90, Accessibility > 95
- Axe accessibility scan: 0 violations

---

## Responsive Breakpoints

| Breakpoint | Min Width |
|------------|-----------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

Mobile-first approach: base styles for mobile, use breakpoints for larger screens.

---

## Animation Standards

- Transition duration: 150ms (fast), 300ms (standard)
- Easing: ease-in-out
- Use for: hover states, modal open/close, dropdown expand

Avoid animations for:
- Table row updates (performance)
- Realtime data changes (distracting)

---

## Accessibility Requirements

- Keyboard navigation: all interactive elements must be accessible via Tab
- Focus indicators: visible outline on all focusable elements
- ARIA labels: required for icon-only buttons
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Screen reader support: semantic HTML, proper heading hierarchy
