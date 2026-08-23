# UI/UX Design System

This file is the single source of truth for the UI/UX of the Event Operations & Hackathon Management Platform.

The goal is to make the product look clean, consistent, professional, and easy to use.

---

## 1. UI Stack

### Core UI Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React for icons

### Recommended Utility Libraries

Use only these supporting UI utilities:

- `clsx`
- `tailwind-merge`
- `lucide-react`

Optional accessible primitives if needed:

- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-select`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toast`
- `@radix-ui/react-tooltip`

### Do Not Use

Do not add another full component framework.

Avoid:

- Material UI
- Chakra UI
- Ant Design
- Bootstrap
- DaisyUI
- Semantic UI

Tailwind CSS is the styling system.

---

## 2. Design Principles

### 2.1 Clean

Use lots of white space.

Avoid clutter.

Every page should have one clear primary action.

### 2.2 Consistent

Use the same:

- Colors
- Font sizes
- Spacing
- Border radius
- Buttons
- Inputs
- Tables
- Badges
- Modals
- Empty states
- Loading states
- Error states

### 2.3 Operational

This is an event management system.

The UI should favor:

- Tables
- Forms
- Dashboards
- Status badges
- Clear actions
- Fast data entry
- Easy filtering

### 2.4 Accessible

All interactive elements must be keyboard accessible.

Use visible focus states.

Use proper labels for inputs.

Do not rely on color alone to communicate status.

---

## 3. Layout System

## 3.1 App Shell

Use a dashboard layout.

```text
+---------------------------------------------------------------+
| Sidebar | Topbar                                              |
|         |-----------------------------------------------------|
|         | Page Header                                         |
|         |-----------------------------------------------------|
|         | Page Content                                        |
|         |                                                     |
|         |                                                     |
+---------------------------------------------------------------+
```

### Sidebar

- Width: `260px`
- Background: white
- Right border: `border-line`
- Contains navigation links
- Active link uses primary background tint
- Collapses on mobile

### Topbar

- Height: `64px`
- Background: white
- Bottom border: `border-line`
- Contains event switcher, user menu, and notifications if needed

### Content Area

- Background: `bg-canvas`
- Padding: `p-4 md:p-6`
- Max width for normal pages: `max-w-7xl`
- Center content: `mx-auto`

---

## 3.2 Page Structure

Every main page should follow this structure.

```text
Page Header
- Title
- Description
- Primary actions

Toolbar
- Search
- Filters
- Tabs
- Add button

Content
- Table
- Cards
- Form
- Dashboard widgets
```

---

## 3.3 Grid System

Use a 12-column responsive grid concept.

### Dashboard Stats

```text
Mobile: 1 column
Tablet: 2 columns
Desktop: 4 columns
```

Tailwind:

```tsx
grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4
```

### Content Cards

```tsx
grid grid-cols-1 gap-6 lg:grid-cols-3
```

### Forms

Mobile:

```text
One column
```

Desktop:

```text
Two columns for short fields
Full width for large fields
```

Example:

```tsx
grid grid-cols-1 gap-4 md:grid-cols-2
```

---

## 4. Design Tokens

## 4.1 Color System

### Brand Color

Use indigo as the primary brand color.

```ts
brand: {
  50: "#EEF2FF",
  100: "#E0E7FF",
  200: "#C7D2FE",
  300: "#A5B4FC",
  400: "#818CF8",
  500: "#6366F1",
  600: "#4F46E5",
  700: "#4338CA",
  800: "#3730A3",
  900: "#312E81",
}
```

### Neutral Colors

Use slate-based neutrals.

```ts
canvas: "#F8FAFC"
surface: "#FFFFFF"
line: "#E2E8F0"

ink: {
  DEFAULT: "#0F172A",
  soft: "#475569",
  muted: "#64748B",
  inverse: "#F8FAFC",
}
```

### Semantic Colors

```ts
success: {
  50: "#ECFDF5",
  100: "#D1FAE5",
  200: "#A7F3D0",
  600: "#059669",
  700: "#047857",
}

warning: {
  50: "#FFFBEB",
  100: "#FEF3C7",
  200: "#FDE68A",
  600: "#D97706",
  700: "#B45309",
}

danger: {
  50: "#FFF1F2",
  100: "#FFE4E6",
  200: "#FECDD3",
  600: "#DC2626",
  700: "#B91C1C",
}

info: {
  50: "#F0F9FF",
  100: "#E0F2FE",
  200: "#BAE6FD",
  600: "#0284C7",
  700: "#0369A1",
}
```

---

## 4.2 Typography

### Font Family

Primary font:

```text
Inter
```

Fallback:

```text
ui-sans-serif, system-ui, sans-serif
```

Mono font for serial numbers, codes, tokens, and URLs:

```text
JetBrains Mono, ui-monospace
```

### Font Sizes

Use these consistently.

```text
Page title: text-2xl font-semibold
Section title: text-lg font-semibold
Card title: text-base font-medium
Body: text-sm
Small text: text-xs
Table header: text-xs uppercase tracking-wide
```

### Text Colors

```text
Main text: text-ink
Secondary text: text-ink-soft
Muted text: text-ink-muted
Disabled text: text-ink-muted/60
Inverse text: text-ink-inverse
```

---

## 4.3 Spacing

Use a 4px spacing base.

Common spacing:

```text
XS: 4px   => p-1
SM: 8px   => p-2
MD: 12px  => p-3
LG: 16px  => p-4
XL: 24px  => p-6
2XL: 32px => p-8
```

### Page Padding

```tsx
p-4 md:p-6
```

### Card Padding

```tsx
p-5
```

### Form Field Gap

```tsx
space-y-4
```

### Section Gap

```tsx
space-y-6
```

---

## 4.4 Border Radius

Use consistent rounded corners.

```text
Buttons: rounded-lg
Inputs: rounded-lg
Cards: rounded-xl
Badges: rounded-full
Modals: rounded-xl
Dropdowns: rounded-lg
Tooltips: rounded-md
```

Define:

```ts
borderRadius: {
  control: "8px",
  card: "12px",
}
```

---

## 4.5 Shadows

Use subtle shadows.

```ts
boxShadow: {
  card: "0 1px 3px rgba(15, 23, 42, 0.08)",
  modal: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
  dropdown: "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)",
}
```

Do not use large heavy shadows unless creating a modal.

---

## 5. Tailwind Configuration

Use this as the base Tailwind config.

```ts
// tailwind.config.ts

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F8FAFC",
        surface: "#FFFFFF",
        line: "#E2E8F0",

        ink: {
          DEFAULT: "#0F172A",
          soft: "#475569",
          muted: "#64748B",
          inverse: "#F8FAFC",
        },

        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },

        success: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          600: "#059669",
          700: "#047857",
        },

        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          600: "#D97706",
          700: "#B45309",
        },

        danger: {
          50: "#FFF1F2",
          100: "#FFE4E6",
          200: "#FECDD3",
          600: "#DC2626",
          700: "#B91C1C",
        },

        info: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          600: "#0284C7",
          700: "#0369A1",
        },
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },

      borderRadius: {
        control: "8px",
        card: "12px",
      },

      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.08)",
        modal:
          "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
        dropdown:
          "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)",
      },
    },
  },
  plugins: [],
};
```

---

## 6. Global Styles

Use this global CSS file.

```css
/* src/styles/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }

  body {
    @apply bg-canvas font-sans text-sm text-ink;
  }

  h1 {
    @apply text-2xl font-semibold tracking-tight text-ink;
  }

  h2 {
    @apply text-lg font-semibold tracking-tight text-ink;
  }

  h3 {
    @apply text-base font-medium text-ink;
  }

  a {
    @apply text-brand-600 hover:text-brand-700;
  }

  :focus-visible {
    @apply outline-none ring-2 ring-brand-600 ring-offset-2;
  }
}

@layer components {
  .card {
    @apply rounded-card border border-line bg-surface shadow-card;
  }

  .label {
    @apply mb-1.5 block text-sm font-medium text-ink;
  }

  .input {
    @apply h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:cursor-not-allowed disabled:opacity-60;
  }

  .helper-text {
    @apply mt-1.5 text-xs text-ink-muted;
  }

  .error-text {
    @apply mt-1.5 text-xs text-danger-600;
  }

  .page-header {
    @apply flex flex-col gap-4 md:flex-row md:items-center md:justify-between;
  }

  .page-title {
    @apply text-2xl font-semibold tracking-tight text-ink;
  }

  .page-description {
    @apply mt-1 text-sm text-ink-soft;
  }
}
```

---

## 7. Utility Function

Create a class merge helper.

```ts
// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use this everywhere class names are combined.

---

## 8. Component System

All shared UI components should live here:

```text
client/src/components/ui/
  button.tsx
  input.tsx
  textarea.tsx
  select.tsx
  checkbox.tsx
  badge.tsx
  card.tsx
  modal.tsx
  dropdown.tsx
  tabs.tsx
  toast.tsx
  table.tsx
  empty-state.tsx
  loading-state.tsx
  error-state.tsx
  stat-card.tsx
  avatar.tsx
  pagination.tsx
```

Layout components live here:

```text
client/src/components/layout/
  app-shell.tsx
  sidebar.tsx
  topbar.tsx
  page-header.tsx
  page-container.tsx
```

Feature components live here:

```text
client/src/features/
  auth/
  hardware/
  teams/
  itinerary/
  checkin/
  budget/
  certificates/
  venue/
  projects/
  judging/
  volunteers/
  incidents/
```

---

## 9. Button Component

Buttons must be consistent.

### Button Variants

#### Primary

Use for the main action on a page or form.

Classes:

```text
bg-brand-600 text-white hover:bg-brand-700
```

#### Secondary

Use for supporting actions.

Classes:

```text
border border-line bg-surface text-ink hover:bg-slate-50
```

#### Ghost

Use for low-emphasis actions.

Classes:

```text
text-ink-soft hover:bg-slate-100 hover:text-ink
```

#### Danger

Use for destructive actions.

Classes:

```text
bg-danger-600 text-white hover:bg-danger-700
```

### Button Sizes

```text
sm: h-8 px-3 text-xs
md: h-10 px-4 text-sm
lg: h-11 px-5 text-sm
```

### Button Rules

- Use only one primary button per section.
- Destructive actions require confirmation.
- Loading buttons must be disabled.
- Buttons must show a visible focus ring.
- Use icon plus label for main actions.

Example:

```tsx
<Button variant="primary" size="md">
  Add Hardware
</Button>
```

---

## 10. Form Components

## 10.1 Input Fields

All inputs should use:

```text
h-10
w-full
rounded-control
border
border-line
bg-surface
px-3
text-sm
```

Focus state:

```text
focus:border-brand-600
focus:ring-2
focus:ring-brand-600/20
```

Error state:

```text
border-danger-600
focus:border-danger-600
focus:ring-danger-600/20
```

---

## 10.2 Form Field Layout

Use this structure:

```tsx
<div>
  <label className="label">Email</label>
  <input className="input" type="email" placeholder="name@example.com" />
  <p className="helper-text">Enter your registered email.</p>
</div>
```

Error example:

```tsx
<div>
  <label className="label">Email</label>
  <input className="input border-danger-600" type="email" />
  <p className="error-text">Email is required.</p>
</div>
```

---

## 10.3 Form Rules

- Labels must always be visible.
- Do not use placeholder text as the only label.
- Show validation errors after blur or submit.
- Disable submit button while saving.
- Use success toast after successful save.
- Keep destructive actions separate from save actions.

---

## 11. Table System

Tables are used heavily in this project.

Use consistent table styling.

### Table Container

```tsx
<div className="card overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-left text-sm">
      ...
    </table>
  </div>
</div>
```

### Table Header

```tsx
<thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-muted">
  <tr>
    <th className="h-11 border-b border-line px-4 font-medium">
      Name
    </th>
  </tr>
</thead>
```

### Table Body

```tsx
<tbody className="divide-y divide-line">
  <tr className="hover:bg-slate-50/70">
    <td className="px-4 py-3">
      Content
    </td>
  </tr>
</tbody>
```

### Table Rules

- Use sticky header for long tables.
- Use horizontal scrolling on mobile.
- Right-align numeric values.
- Use muted text for secondary table data.
- Use badges for statuses.
- Keep row actions in a dropdown menu.
- Use skeleton rows while loading.
- Use empty state when no records exist.

---

## 12. Badge System

Badges are used for statuses.

Base badge classes:

```text
inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium
```

### Badge Variants

#### Success

```text
border-success-200 bg-success-50 text-success-700
```

#### Warning

```text
border-warning-200 bg-warning-50 text-warning-700
```

#### Danger

```text
border-danger-200 bg-danger-50 text-danger-700
```

#### Info

```text
border-info-200 bg-info-50 text-info-700
```

#### Neutral

```text
border-line bg-slate-50 text-ink-soft
```

---

## 13. Status Color Mapping

Use the same status colors across the entire app.

### Hardware Status

| Status | Badge |
|---|---|
| Available | Success |
| Checked Out | Info |
| Damaged | Danger |
| Lost | Danger |
| Retired | Neutral |

### Team Application Status

| Status | Badge |
|---|---|
| Pending | Warning |
| Approved | Success |
| Rejected | Danger |

### Check-in Method

| Method | Badge |
|---|---|
| QR | Info |
| Manual | Neutral |

### Project Status

| Status | Badge |
|---|---|
| Draft | Neutral |
| Submitted | Info |
| Disqualified | Danger |

### Volunteer Assignment Status

| Status | Badge |
|---|---|
| Assigned | Info |
| Checked In | Warning |
| Completed | Success |
| No Show | Danger |

### Incident Severity

| Severity | Badge |
|---|---|
| Low | Info |
| Medium | Warning |
| High | Danger |
| Critical | Danger |

### Incident Status

| Status | Badge |
|---|---|
| Open | Warning |
| Investigating | Info |
| Resolved | Success |

### Certificate Status

| Status | Badge |
|---|---|
| Eligible | Info |
| Issued | Success |
| Revoked | Danger |

---

## 14. Card System

Use cards for grouped content.

Base card:

```tsx
<div className="card p-5">
  <h3>Card Title</h3>
  <p className="mt-1 text-sm text-ink-soft">
    Card description.
  </p>
</div>
```

### Card Header

```tsx
<div className="flex items-center justify-between border-b border-line px-5 py-4">
  <h3 className="text-base font-medium">Hardware Items</h3>
  <Button variant="secondary" size="sm">
    Filter
  </Button>
</div>
```

### Card Body

```tsx
<div className="p-5">
  Content
</div>
```

### Card Footer

```tsx
<div className="flex items-center justify-end gap-3 border-t border-line px-5 py-4">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Save</Button>
</div>
```

---

## 15. Modal System

Use modals for:

- Confirmations
- Quick create forms
- Quick edit forms
- Detail previews

Do not use modals for very large forms.

Use full pages for complex flows.

### Modal Styling

Overlay:

```text
fixed inset-0 z-50 bg-slate-950/50
```

Panel:

```text
fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-card border border-line bg-surface shadow-modal
```

Modal header:

```tsx
<div className="flex items-center justify-between border-b border-line px-5 py-4">
  <h3>Checkout Hardware</h3>
  <button aria-label="Close">
    <X size={18} />
  </button>
</div>
```

Modal body:

```tsx
<div className="p-5">
  Form content
</div>
```

Modal footer:

```tsx
<div className="flex justify-end gap-3 border-t border-line px-5 py-4">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Confirm</Button>
</div>
```

### Confirmation Dialog Rules

Destructive confirmation dialogs must include:

- Clear title
- Explanation
- Cancel button
- Danger button

Example:

```text
Delete hardware item?

This action cannot be undone.
This will remove the item from inventory and checkout history.

Cancel
Delete Item
```

---

## 16. Toast Notifications

Use toasts for short feedback messages.

### Toast Types

#### Success

```text
bg-success-50 text-success-700 border-success-200
```

#### Error

```text
bg-danger-50 text-danger-700 border-danger-200
```

#### Info

```text
bg-info-50 text-info-700 border-info-200
```

#### Warning

```text
bg-warning-50 text-warning-700 border-warning-200
```

### Toast Position

Desktop:

```text
Top right
```

Mobile:

```text
Top center or bottom center
```

### Toast Rules

- Auto dismiss after 4 to 6 seconds.
- Allow manual dismiss.
- Do not use toasts for validation errors.
- Use inline errors for form validation.

---

## 17. Empty States

Every list must have an empty state.

### Empty State Structure

```tsx
<div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
  <div className="mb-4 rounded-full bg-slate-100 p-3">
    <Icon size={24} className="text-ink-muted" />
  </div>

  <h3 className="text-base font-medium">No hardware items</h3>

  <p className="mt-1 max-w-sm text-sm text-ink-muted">
    Add your first hardware item to start tracking inventory.
  </p>

  <Button className="mt-4" variant="primary">
    Add Hardware
  </Button>
</div>
```

### Empty State Copy Rules

Use:

```text
No [items]
[Helpful explanation]
[Call to action]
```

Examples:

```text
No teams yet
Create teams so participants can join and collaborate.
Create Team
```

```text
No incidents reported
Incidents reported during the event will appear here.
Report Incident
```

---

## 18. Loading States

Use skeleton loaders for tables, cards, and dashboards.

### Button Loading

Show spinner and disable button.

```tsx
<Button disabled>
  Saving...
</Button>
```

### Table Loading

Show skeleton rows.

```tsx
<div className="animate-pulse space-y-3 p-4">
  <div className="h-4 w-3/4 rounded bg-slate-200" />
  <div className="h-4 w-1/2 rounded bg-slate-200" />
  <div className="h-4 w-2/3 rounded bg-slate-200" />
</div>
```

### Card Loading

```tsx
<div className="card animate-pulse p-5">
  <div className="h-4 w-1/3 rounded bg-slate-200" />
  <div className="mt-4 h-8 w-1/2 rounded bg-slate-200" />
</div>
```

---

## 19. Error States

Use error states when data fails to load.

Example:

```tsx
<div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
  <div className="mb-4 rounded-full bg-danger-50 p-3">
    <AlertCircle size={24} className="text-danger-600" />
  </div>

  <h3 className="text-base font-medium">Something went wrong</h3>

  <p className="mt-1 max-w-sm text-sm text-ink-muted">
    We could not load the data. Please try again.
  </p>

  <Button className="mt-4" variant="secondary">
    Retry
  </Button>
</div>
```

---

## 20. Navigation

## 20.1 Sidebar Navigation

Use grouped navigation.

### Main

```text
Dashboard
Schedule
Teams
Projects
Venue
```

### Operations

```text
Hardware
Volunteers
Check-in
Incidents
Certificates
```

### Admin

```text
Budget
Members
Settings
Audit Logs
```

### Active Link Style

```text
bg-brand-50 text-brand-700
```

### Inactive Link Style

```text
text-ink-soft hover:bg-slate-50 hover:text-ink
```

---

## 20.2 Topbar

Topbar should include:

- Current event name
- Breadcrumbs if needed
- User avatar dropdown
- Optional notification icon

User dropdown items:

```text
Profile
Settings
Log out
```

---

## 21. Page Templates

## 21.1 Login Page

Centered card layout.

```text
+-------------------------------------------+
|                                           |
|              Logo                         |
|                                           |
|              Card                         |
|              Email                        |
|              Password                     |
|              Login Button                 |
|                                           |
+-------------------------------------------+
```

Rules:

- Center vertically and horizontally.
- Background: `bg-canvas`
- Card width: `max-w-sm`
- One primary action.
- Link to register if allowed.

---

## 21.2 Dashboard Page

```text
Page Header
- Event name
- Date
- Quick actions

Stat Cards
- Participants
- Teams
- Check-ins
- Open incidents

Recent Activity
- Recent check-ins
- Recent incidents
- Hardware checkouts

Quick Tables
- Teams needing members
- Volunteer shifts today
```

---

## 21.3 List Page

Used for:

- Hardware
- Teams
- Participants
- Sponsors
- Expenditures
- Venue locations
- Projects
- Volunteer shifts
- Incidents

Structure:

```text
Page Header
- Title
- Description
- Add button

Toolbar
- Search
- Filters
- Status tabs

Table
- Data rows
- Row actions
```

Example toolbar:

```tsx
<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  <div className="flex flex-1 gap-3">
    <SearchInput placeholder="Search hardware..." />
    <Select placeholder="Status" />
  </div>

  <Button variant="primary">
    Add Hardware
  </Button>
</div>
```

---

## 21.4 Detail Page

Used for:

- Participant detail
- Team detail
- Hardware item detail
- Project detail
- Incident detail
- Volunteer shift detail

Structure:

```text
Page Header
- Back link
- Title
- Status badge
- Actions

Tabs
- Overview
- Activity
- Settings
```

Example:

```text
Hardware Item
Arduino Uno
Status: Available

Tabs:
- Details
- Checkout History
- Damage Reports
```

---

## 21.5 Form Page

Used for complex forms.

Structure:

```text
Page Header
- Title
- Description

Form Card
- Section 1
- Section 2
- Section 3

Footer Actions
- Cancel
- Save
```

Rules:

- Group related fields.
- Use section headings.
- Keep primary action visible.
- Show validation errors near fields.
- Use confirmation modal if leaving unsaved form.

---

## 22. Feature-Specific UI Patterns

## 22.1 Hardware Inventory

### Hardware List Page

Show:

- Search
- Category filter
- Status filter
- Add hardware button

Table columns:

```text
Name
Category
Quantity
Status
Condition
Location
Actions
```

### Checkout Flow

Use modal.

Fields:

```text
Borrower
Checkout date
Due date
Notes
```

Actions:

```text
Cancel
Checkout
```

### Return Flow

Use modal.

Fields:

```text
Return condition
Notes
Damaged checkbox
```

If damaged:

```text
Show damage report fields
```

---

## 22.2 Teams

### Teams Page

Use cards or table.

Card should show:

```text
Team name
Project focus
Member count / max size
Member avatars
Status
View button
```

### Solo Participants

Show:

```text
Name
Experience level
Tech stack badges
Looking for team badge
Assign button
```

### Team Application

Application actions:

```text
Approve
Reject
```

Use success and danger buttons.

---

## 22.3 Itinerary & Check-in

### Schedule Page

Use timeline or table.

Columns:

```text
Time
Session
Location
Type
Status
Action
```

### Check-in Page

Show:

```text
Participant search
QR scanner or manual check-in button
Recent check-ins
```

Check-in table:

```text
Participant
Method
Time
Status
```

Use badges:

```text
QR = Info
Manual = Neutral
```

---

## 22.4 Budget & Sponsorship

### Budget Dashboard

Stat cards:

```text
Total Sponsorship
Total Spend
Remaining Budget
Sponsor Count
```

### Contributions Table

```text
Sponsor
Type
Amount
Received At
Recorded By
```

### Expenditures Table

```text
Category
Amount
Vendor
Spent At
Recorded By
Approved By
```

Use success badges for contributions.

Use neutral or danger emphasis for expenses.

---

## 22.5 Certificates

### Eligibility Page

Show:

```text
Participant
Attendance status
Project status
Eligibility badge
Issue button
```

Table columns:

```text
Participant
Type
Status
Issued At
Actions
```

Badge mapping:

```text
Eligible = Info
Issued = Success
Revoked = Danger
```

---

## 22.6 Venue & Logistics

### Venue Locations Page

Use table or card grid.

Location card:

```text
Location name
Type
Capacity
Current assignment
Availability
```

### Assignment Modal

Fields:

```text
Location
Assignable type
Team or project
Start time
End time
```

Show conflict warning:

```text
This location is already assigned during the selected time.
```

---

## 22.7 Projects & Judging

### Project Submission Page

Team view:

```text
Project title
Description
Repository URL
Demo URL
Status
Submit button
```

### Judge Scoring Page

Show:

```text
Project name
Team name
Description
Links
Score inputs
Feedback textarea
Submit score button
```

### Leaderboard

Table columns:

```text
Rank
Project
Team
Average Score
Total Score
Status
```

Highlight top 3 rows subtly.

---

## 22.8 Volunteers

### Shifts Page

Table columns:

```text
Shift
Location
Start
End
Capacity
Assigned
Status
Actions
```

### Volunteer Assignment Modal

Show:

```text
Volunteer name
Shift details
Conflict warning if overlap exists
Assign button
```

---

## 22.9 Incidents

### Incident List

Table columns:

```text
Title
Severity
Status
Reported By
Location
Occurred At
Actions
```

### Incident Detail

Show:

```text
Title
Severity badge
Status badge
Description
Location
Reported by
Assigned to
Timeline
Resolution notes
```

### Incident Analytics

Stat cards:

```text
Total Incidents
Open
Investigating
Resolved
```

Charts:

```text
Incidents by severity
Incidents by status
Incidents over time
```

---

## 23. Icon System

Use `lucide-react`.

### Icon Sizes

```text
Small: 16px
Default: 20px
Large: 24px
```

### Common Icons

```text
Add: Plus
Edit: Pencil
Delete: Trash2
Search: Search
Filter: Filter
Calendar: Calendar
Check-in: QrCode
Hardware: Cpu
Teams: Users
Budget: DollarSign
Certificate: Award
Venue: MapPin
Project: FolderKanban
Volunteer: ClipboardCheck
Incident: AlertTriangle
Analytics: BarChart3
Settings: Settings
Close: X
More: MoreHorizontal
```

### Icon Rules

- Use one icon per button unless necessary.
- Use `size={18}` or `size={20}` inside buttons.
- Use muted colors for decorative icons.
- Do not mix icon libraries.

---

## 24. Accessibility Rules

## Keyboard

All interactive elements must support keyboard navigation.

Use:

```text
button
```

for actions.

Do not use clickable `div` elements for buttons.

## Focus

Always preserve focus visibility.

Use:

```text
focus-visible:ring-2 focus-visible:ring-brand-600
```

## Labels

All inputs must have labels.

Use `htmlFor` and `id`.

Example:

```tsx
<label htmlFor="email" className="label">
  Email
</label>

<input id="email" className="input" type="email" />
```

## Color Contrast

Do not use light gray text on white backgrounds except for muted helper text.

Body text must remain readable.

## Icons and Text

Do not use icon-only buttons without `aria-label` unless the action is obvious.

Example:

```tsx
<button aria-label="Close">
  <X size={18} />
</button>
```

---

## 25. Content Rules

Use consistent wording.

### Buttons

Use verb-first labels.

Good:

```text
Add Item
Edit Team
Submit Project
Checkout Hardware
Resolve Incident
```

Bad:

```text
Submit
Ok
Do It
Save Changes Here
```

### Titles

Use sentence case.

Good:

```text
Hardware inventory
Team applications
Volunteer shifts
```

Bad:

```text
HARDWARE INVENTORY
Team Applications Page
```

### Empty States

Use helpful language.

Good:

```text
No hardware items
Add hardware to start tracking checkouts and returns.
```

Bad:

```text
No data
Nothing found
```

### Errors

Use clear user-friendly errors.

Good:

```text
Due date is required.
This location is already booked for that time.
Only one team per participant is allowed.
```

Bad:

```text
Error
Invalid input
Something failed
```

---

## 26. Date, Time, and Number Formatting

## Dates

Use short readable dates.

Example:

```text
Aug 20, 2026
```

## Times

Use:

```text
9:30 AM
```

## Date Time

Use:

```text
Aug 20, 2026, 9:30 AM
```

## Currency

Use currency formatting.

Example:

```text
$1,250.00
```

## Numbers

Use comma separators.

Example:

```text
1,024
```

---

## 27. Responsive Rules

## Mobile

- Sidebar collapses into hamburger menu.
- Tables scroll horizontally.
- Forms use one column.
- Page header actions stack vertically.
- Modals become near-full-width on small screens.

## Tablet

- Sidebar can collapse.
- Tables may remain scrollable.
- Forms can use two columns.
- Dashboard stats use two columns.

## Desktop

- Sidebar fixed.
- Dashboard stats use four columns.
- Tables full width.
- Forms use two columns where appropriate.

---

## 28. Z-Index System

Use consistent z-index values.

```text
Sidebar: 30
Topbar: 20
Dropdown: 50
Modal overlay: 50
Modal panel: 50
Toast: 60
Tooltip: 70
```

Do not randomly increase z-index.

---

## 29. Do / Don't Rules

## Do

- Use the design tokens.
- Use shared components.
- Use consistent spacing.
- Use semantic status colors.
- Use skeleton loaders.
- Use empty states.
- Use accessible labels.
- Use subtle shadows.
- Use confirmation modals for destructive actions.

## Don't

- Do not use random hex colors.
- Do not use inline styles unless absolutely necessary.
- Do not create multiple button styles.
- Do not use browser `alert()`.
- Do not use browser `confirm()`.
- Do not use placeholder text as labels.
- Do not use heavy shadows.
- Do not use uppercase body text.
- Do not use too many font sizes.
- Do not mix icon libraries.

---

## 30. UI File Structure

```text
client/
  src/
    components/
      ui/
        avatar.tsx
        badge.tsx
        button.tsx
        card.tsx
        checkbox.tsx
        dropdown.tsx
        empty-state.tsx
        error-state.tsx
        input.tsx
        loading-state.tsx
        modal.tsx
        pagination.tsx
        select.tsx
        stat-card.tsx
        table.tsx
        tabs.tsx
        textarea.tsx
        toast.tsx
      layout/
        app-shell.tsx
        page-container.tsx
        page-header.tsx
        sidebar.tsx
        topbar.tsx
      forms/
        form-field.tsx
        search-input.tsx
        date-picker.tsx
        select-field.tsx
    features/
      auth/
      hardware/
      teams/
      itinerary/
      checkin/
      budget/
      certificates/
      venue/
      projects/
      judging/
      volunteers/
      incidents/
    lib/
      utils.ts
      format.ts
      api.ts
    styles/
      globals.css
```

---

## 31. Example Button Component

```tsx
// src/components/ui/button.tsx

import { type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-line bg-surface text-ink hover:bg-slate-50",
  ghost: "text-ink-soft hover:bg-slate-100 hover:text-ink",
  danger: "bg-danger-600 text-white hover:bg-danger-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
```

---

## 32. Example Input Component

```tsx
// src/components/ui/input.tsx

import { type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({ className, hasError, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "input",
        hasError &&
          "border-danger-600 focus:border-danger-600 focus:ring-danger-600/20",
        className
      )}
      {...props}
    />
  );
}
```

---

## 33. Example Badge Component

```tsx
// src/components/ui/badge.tsx

import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: "border-success-200 bg-success-50 text-success-700",
  warning: "border-warning-200 bg-warning-50 text-warning-700",
  danger: "border-danger-200 bg-danger-50 text-danger-700",
  info: "border-info-200 bg-info-50 text-info-700",
  neutral: "border-line bg-slate-50 text-ink-soft",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

---

## 34. Example Page Header Component

```tsx
// src/components/layout/page-header.tsx

import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="page-description">{description}</p>
        )}
      </div>

      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
```

---

## 35. Example Empty State Component

```tsx
// src/components/ui/empty-state.tsx

import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-3 text-ink-muted">
        {icon}
      </div>

      <h3 className="text-base font-medium">{title}</h3>

      <p className="mt-1 max-w-sm text-sm text-ink-muted">
        {description}
      </p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

---

## 36. Implementation Checklist

Before considering UI complete, check:

### Layout

- Sidebar is consistent.
- Topbar is consistent.
- Page headers follow the same structure.
- Content has proper max width.
- Pages are responsive.

### Components

- Buttons use shared component.
- Inputs use shared component.
- Badges use shared component.
- Cards use shared component.
- Tables use shared styling.
- Modals use shared component.

### States

- Every list has loading state.
- Every list has empty state.
- Every list has error state.
- Forms have validation errors.
- Buttons have loading state.

### Accessibility

- Focus rings are visible.
- Inputs have labels.
- Icon buttons have aria-labels.
- Keyboard navigation works.
- Color contrast is readable.

### Consistency

- No random colors.
- No random spacing.
- No random border radius.
- No random shadows.
- No mixed icon styles.
- No mixed button styles.

---

## 37. Final Rule

If a screen is unclear, follow this priority:

```text
1. Clarity
2. Consistency
3. Speed of use
4. Visual polish
```

The product should feel like a professional operations dashboard:

```text
Clean
Structured
Reliable
Easy to scan
Easy to manage
```