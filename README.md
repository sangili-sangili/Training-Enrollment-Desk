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
- **Responsive Layout**: Desktop/Tablet collapsible sidebar, mobile drawer overlay, and 5-tab mobile bottom navigation (`MobileNav`) with safe-area padding.
- **Branding Header**: Clickable graduation cap logo and "Training Desk" title with instant redirect to Dashboard.
- **Real-Time Notification Center**: Interactive notification bell with reactive notification panel tracking all system actions (new enrollments, waitlist seat offers, cancellations, operator role modifications, and database resets) with unread counters, "Mark all read", "Clear", and fully responsive positioning from 320px mobile to wide desktop.
- **Dark & Light Mode**: Seamless theme toggle between curated Dark Blue (`#0B132B` / `#131F37`) and Light modes, persisted in `localStorage`.
- **Operator Session**: Profile dropdown with "Edit Profile & Role" modal and "Sign Out" actions.
- **Authentication**: Local demo login view with pre-configured operator credentials (`admin@training.com` / `admin123`).

### 2. Dashboard (`#dashboard`)
- **Cohort Date Filter**: Interactive cohort dropdown (`ALL`, `2025-04-28`, `2026-11-10`) to dynamically filter dashboard analytics.
- **4 Primary Metric Cards**: Total People, Confirmed Seats, Waitlisted Candidates, Available Seats.
- **Animated Capacity Progress Panel**: Real-time room occupancy rates (`6/8 seats (75%)`, `5/6 seats (83%)`) with color-coded capacity bars.
- **Upcoming Sessions Timetable**: Chronological schedule view with time slots, room tags, and seat statuses.
- **Quick CTA**: "New Enrollment" button routing directly to `#enroll`.

### 3. Enroll People (`#enroll`)
- **Trainee Form**: Instant input normalization (case-insensitive canonicalized email, auto-trimmed company name).
- **Target Cohort Date Selector**: Enables scheduling for upcoming cohort dates (`2025-04-28`, `2026-11-10`).
- **Interactive Session Checklist**: Real-time room capacity badges and dynamic schedule collision warnings.
- **Live Tuition Preview Card**: Real-time breakdown of base tuition, applicable discounts, and net payable.
- **Schedule Conflict Diagnostic Modal**: Intercepts and blocks concurrent overlapping session bookings for the same trainee.

### 4. Session Management & Roster (`#sessions`)
- **4 Session Overview Cards**: Visual seat occupancy bars, status metrics, and click-to-filter interaction.
- **Multi-Criteria Filter Toolbar**: Free-text search by trainee name/email/company, session filter, and status filter (`Confirmed`, `Waitlisted`, `Offered`, `Cancelled`).
- **Participant Roster Table**: Comprehensive table with status badges, price breakdown trigger, seat cancellation trigger, and waitlist promotion actions (`Accept` or `Decline` seat offers).
- **Price Breakdown Modal**: Itemized tuition audit detailing base price, discount applied (15% Early Bird, 10% Corporate Group, or Standard), and final price.
- **Cancel Seat Modal**: Safe cancellation flow with automated oldest-eligible waitlist promotion.

### 5. Trainee Directory / People Registry (`#people`)
- **4 Summary Metric Cards**: Total Trainees, Active Seats, Client Companies, and Lifetime Tuition Invested.
- **Multi-Criteria Filter Toolbar**: Search bar, company dropdown, enrollment status filter (`All`, `Confirmed`, `Waitlisted`, `Multi-Session (2+)`), and Table vs Grid view switcher.
- **Trainee Roster Table & Card Grid**: Dual view rendering participant contact info, company affiliation, active seat count, and total investment.
- **Trainee Details Modal**: Comprehensive slide-over rendering trainee contact, lifetime tuition, and enrolled course history.
- **Quick Multi-Session Registration**: `+ Enroll` pre-fill action pre-populating participant credentials into `#enroll`.

### 6. Workspace Settings & Diagnostics (`#settings`)
- **Operator Profile Card**: Displays active credentials, administrative role, and Sign Out action.
- **Edit Profile & Role Modal**: Allows updating Full Name, Email, and Operator Role (*Senior Desk Administrator*, *Desk Administrator*, *Training Coordinator*, *Registrar / Auditor*), triggering immediate real-time notifications.
- **Storage Diagnostics & Telemetry**: Live `localStorage` byte count, record counters, and deterministic schema key. Responsive 1-card-per-row layout on mobile, 3-column on tablet/desktop.
- **Operational Data Exports**: One-click download of full JSON database backup snapshot, and formatted CSV spreadsheet roster.
- **Session Catalog & Governance Reference**: Documentation of room capacities, time slots, collision rules, and pricing discount policies.
- **Danger Zone Reset**: Safe development database reset back to initial seed data, protected by typing `RESET` confirmation.

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
├── DECISIONS.md                   # Key business logic, pricing, and architecture decisions
├── README.md                      # Comprehensive setup, operations, and architecture guide
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
