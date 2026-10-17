# Training Enrollment Desk

A mission-critical, responsive administrative web application for corporate and conference training coordinators. Built with React 19 and modern frontend engineering best practices, it governs course registrations, enforces strict room capacities, detects schedule overlaps, automates FIFO waitlist promotions upon cancellation, computes early-bird and corporate group discounts, and reliably persists operational state using browser `localStorage`.

---

## 1. Project Overview

The **Training Enrollment Desk** provides administrative coordinators with a comprehensive operations cockpit to manage training cohorts:
- Real-time dashboard showing aggregate participant counts, confirmed/waitlisted seats, and occupancy progress bars.
- Intelligent participant registration form with normalization previews, collision prevention, and live pricing summaries.
- Roster management with itemized price audits, seat cancellations, and waitlist promotion workflows.
- Trainee directory tracking lifetime participant tuition, company distribution, and multi-session enrollments.
- Workspace settings with storage telemetry, JSON database backup download, CSV spreadsheet export, and safe data resets.

---

## 2. Technology Stack

- **Core**: React 19 (`^19.2.8`), React DOM (`^19.2.8`)
- **Build Tooling & Dev Server**: Vite (`^8.3.0`), `@vitejs/plugin-react` (`^6.1.1`)
- **Styling**: Tailwind CSS v4 (`^4.3.3`), `@tailwindcss/vite` (`^4.3.3`)
- **Typography & Aesthetics**: Inter Font, Dark Blue (`#0B132B` / `#131F37`) and Teal (`#009688`) palette
- **Static Analysis**: Oxlint (`^1.81.0`)

---

## 3. Prerequisites

- **Node.js**: `v20.0.0` or later (verified on Node v20/v22)
- **Package Manager**: `npm` (comes with Node.js)

---

## 4. Installation Steps

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd Training-Enrollment-Desk
npm install
```

---

## 5. Development Command

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be served locally at `http://localhost:5173/` (or `http://localhost:5174/` if 5173 is occupied).

To run lint checks:

```bash
npm run lint
```

---

## 6. Production Build Command

Compile the production-ready bundle into the `dist/` directory:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 7. Implemented Application Features

### 1. Application Shell & Navigation
- Responsive sidebar navigation (Desktop/Tablet) and drawer/bottom tab navigation (Mobile).
- Top header with global cohort date filter (`ALL` default), Sun/Moon dark mode toggle, unread notification panel, and operator avatar.
- Local demo login view with one-click demo credentials (`admin@training.com` / `admin123`).

### 2. Dashboard (`#dashboard`)
- 4 stat cards with circular visual accents: Total People, Confirmed Seats, Waitlisted Candidates, Available Seats.
- Animated capacity progress panel showing live occupancy rates (`6/8 seats (75%)`, `5/6 seats (83%)`).
- Timetable of upcoming sessions with room tags and schedules.

### 3. Enroll People (`#enroll`)
- Participant form with instant input normalization (trimmed lowercase email, trimmed company).
- Session checklist displaying remaining available capacity and dynamic schedule collision warnings.
- Real-time tuition summary card with preliminary discount evaluation.
- Schedule Conflict Diagnostic Modal preventing overlapping confirmed seats for the same individual.

### 4. Session Management & Roster (`#sessions`)
- 4 session overview cards with occupancy progress bars and click-to-filter.
- Multi-criteria filter toolbar: search by participant name/email/company, filter by session, filter by status.
- Participant roster table with status badges (`Confirmed`, `Waitlisted`, `Offered`, `Cancelled`).
- Price Breakdown Modal providing an itemized tuition audit (base price, discount type, deduction, final price).
- Safe seat cancellation with automated oldest-eligible waitlist promotion.
- Operator action controls to `Accept` or `Decline` waitlist seat offers.

### 5. Trainee Directory / People Registry (`#people`)
- 4 summary metric cards: Total Trainees, Active Seats, Client Companies, and Tuition Invested.
- Multi-criteria filter toolbar with company dropdown, status selector, and Table vs Grid view switcher.
- Trainee Details Drawer rendering participant contact, company, lifetime tuition, and enrolled course history.
- `+ Enroll` pre-fill action: pre-populates participant credentials for streamlined multi-session registration.

### 6. Workspace Settings & Diagnostics (`#settings`)
- Operator profile card with administrative credentials and Sign Out action.
- Storage telemetry displaying live `localStorage` byte footprint and entity breakdown.
- Data export tools: Download complete JSON database backup, export CSV spreadsheet roster.
- Session catalog reference table documenting room capacities and schedule collision rules.
- Safe reset modal with explicit confirmation guard (requiring typing `RESET`) to restore baseline seed data.

---

## 8. Data Model & LocalStorage Behavior

### Storage Key: `TRAINING_ENROLLMENT_DESK_DATA`
- **Schema Version**: `1.0.0`
- **Initial Seed Fixtures**: 24 unique participants, 18 confirmed seats, 6 waitlisted entries, 12 partner companies across 4 sessions.
- **Fail-Safe Hydration**: Corrupted JSON or tampered schemas are automatically detected, triggering a non-destructive recovery to default seed fixtures.
- **Route Retention**: Active tab route (`TED_ACTIVE_TAB`) is persisted in `localStorage` and synchronized with URL hash (`#dashboard`, `#enroll`, `#sessions`, `#people`, `#settings`) to prevent redirect on page reload.

---

## 9. Project Structure

```
Training-Enrollment-Desk/
├── documents/                     # Project planning & architectural specifications
│   ├── PROJECT_PLAN.md            # Requirements, scope, and DoD
│   ├── BUSINESS_RULES.md          # Domain rules, pricing math, capacity rules
│   ├── TECHNICAL_ARCHITECTURE.md  # Architecture, folder boundaries, state flow
│   ├── FINAL_REVIEW.md            # Comprehensive post-implementation review
│   └── SCREEN_NOTES/              # Detailed per-screen architectural notes
│       ├── dashboard.md
│       ├── enroll_people.md
│       ├── sessions_roster.md
│       ├── people_directory.md
│       └── settings_workspace.md
├── src/
│   ├── app/                       # Application bootstrap & state context
│   │   ├── context/               # EnrollmentContext (global state, auth, notifications)
│   │   ├── routes.js              # Navigation routes & tabs definition
│   │   └── App.jsx                # Root layout shell and route switch
│   ├── components/                # Reusable design system components
│   │   ├── feedback/              # Modals (Conflict, Price, Profile) & Toasts
│   │   ├── layout/                # Header, Sidebar, MobileNav
│   │   └── ui/                    # Button, Input, Badge, Card
│   ├── data/                      # Fixtures and initial seed payloads
│   ├── domain/                    # Pure business logic (zero framework dependencies)
│   │   ├── enrollment/            # Normalization, validation, enrollment lifecycle
│   │   ├── pricing/               # Early bird (15%), company discount (10%), price breakdown
│   │   ├── sessions/              # Catalog definitions and collision detection
│   │   └── waitlist/              # FIFO queue ordering, offer promotion lifecycle
│   ├── features/                  # Feature screen views
│   │   ├── authentication/        # LoginView (demo operator auth)
│   │   ├── dashboard/             # DashboardView, StatCards, CapacityPanel, UpcomingList
│   │   ├── enrollment/            # EnrollView, TraineeForm, SessionChecklist, SummaryCard
│   │   ├── people/                # PeopleView, PeopleTable, PeopleCardGrid, DetailsModal
│   │   └── settings/              # SettingsView, Diagnostics, BackupExport, SafeReset
│   ├── services/storage/          # LocalStorage service, schema validation, migrations
│   └── styles/                    # Tailwind CSS v4 & theme variables
```

---

## 10. Known Limitations

- **Browser-Local Storage**: Operational data is persisted strictly to the user's local browser storage. Multi-user concurrent synchronizations across different browsers would require a backend database service.
- **Fixed Baseline Cohort Dates**: Default session dates use `'2025-04-28'` and standard cohort dates for deterministic pricing calculations.
