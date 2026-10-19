# Training Enrollment Desk

A mission-critical, responsive administrative web application for corporate and conference training coordinators. Built with React 19, Vite, and Tailwind CSS v4 following modern frontend software engineering and architecture best practices. It governs course registrations, enforces strict room capacities, detects 2D schedule overlaps (date & time), automates FIFO waitlist promotions upon cancellation, computes early-bird and corporate group discounts, and reliably persists operational state using browser `localStorage`.

---

## 1. Project Overview

The **Training Enrollment Desk** provides administrative coordinators with a comprehensive operations cockpit to manage training cohorts:
- **Operations Dashboard**: Real-time cockpit showing aggregate participant counts, confirmed/waitlisted seats, and occupancy progress bars derived strictly from live data without visual overrides or fake trends.
- **Intelligent Participant Registration**: Form with normalization previews, 2D schedule collision prevention (scoped by cohort date and time slot), and instant tuition breakdown.
- **Roster & Session Management**: Itemized price audits, seat cancellations, and automated FIFO waitlist promotion workflows.
- **Trainee Directory**: Tracks lifetime participant tuition, company distribution, and multi-session enrollments with dual table/grid views.
- **Workspace Settings**: Live storage telemetry, JSON database backup download, formatted CSV spreadsheet export, and safe data resets.

---

## 2. Technology Stack

- **Core**: React 19 (`^19.2.8`), React DOM (`^19.2.8`)
- **Build Tooling & Dev Server**: Vite (`^8.3.0`), `@vitejs/plugin-react` (`^6.1.1`)
- **Styling**: Tailwind CSS v4 (`^4.3.3`), `@tailwindcss/vite` (`^4.3.3`)
- **Typography & Aesthetics**: Inter Font, Dark Blue (`#0B132B` / `#131F37`) and Teal (`#009688`) palette with accessible contrast
- **Static Analysis & Linting**: Oxlint (`^1.81.0`)

---

## 3. Prerequisites

- **Node.js**: `v20.0.0` or later (verified on Node v20/v22/v24)
- **Package Manager**: `npm` (bundled with Node.js)

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

To run linter checks:

```bash
npm run lint
```

---

## 6. Production Build Command

Compile the optimized production bundle into the `dist/` directory:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 7. Core Business Rules & Pricing Matrix

### Room Capacities & Desk Limits
Total desk capacity is strictly **24 seats** across 4 concurrent sessions:
1. **HTML & CSS Foundations (`SES-HTML`)**: Capacity 8 | Room 101 | 09:00 – 11:30 | Base ₹2,000
2. **Modern React with Vite (`SES-REACT`)**: Capacity 6 | Room 102 | 10:00 – 12:30 | Base ₹4,000
3. **Automated Testing Masterclass (`SES-TEST`)**: Capacity 6 | Room 101 | 13:30 – 15:30 | Base ₹3,000
4. **Distributed System Design (`SES-SYSDES`)**: Capacity 4 | Room 103 | 14:00 – 17:00 | Base ₹5,000

*Baseline seed invariant for cohort `2025-04-28`: 24 Unique People, 18 Confirmed Seats, 6 Waitlisted Candidates. Available Seats = $24 - 18 = 6$ ($25\%$ open capacity).*

### Tuition Discounts & Mandatory Precedence
- **Early Bird (15% Discount)**: Automatically awarded when registration/confirmation occurs $\ge 7$ calendar days before the session date.
- **Company Group (10% Discount)**: Awarded when $\ge 3$ unique confirmed employees from the same normalized company attend the same session within the same cohort.
- **Strict Precedence**: Early Bird (15%) strictly overrides Company Group (10%). Discounts are non-stackable.
- **Waitlist Fee**: Unconfirmed / waitlisted trainees are never charged (₹0 tuition while waitlisted).
- **Retroactive Recalculations**: When a 3rd company employee confirms, existing confirmed colleagues in that session automatically receive retroactive price updates (preserving Early Bird if applicable).

### Two-Dimensional Collision Space (Date $\times$ Time)
- Trainees cannot be confirmed in two overlapping sessions **on the same cohort date**.
- Overlap condition: $S_A < E_B \land S_B < E_A$ evaluated in minutes from midnight.
- Trainees **can** freely enroll in concurrent time slots if they occur on **different cohort dates**.
- Forms evaluate intra-batch conflicts upfront: selecting overlapping sessions in a single submission is blocked atomically before state mutations.

### FIFO Waitlist Queue & Offer Promotion
- Waitlisted applicants are queued strictly by `enrolledAt` timestamp (FIFO).
- When a confirmed seat is vacated/cancelled, the oldest eligible waitlisted applicant is automatically promoted to `Offered` status.
- If the oldest waitlisted candidate has since developed a schedule conflict with another session on that date, they are skipped without losing their general queue position, offering the seat to the next eligible candidate.
- When an offer is confirmed, tuition is calculated using the confirmation date.

---

## 8. Implemented Application Features

### 1. Application Shell & Navigation
- **Responsive Layout**: Collapsible desktop sidebar, mobile drawer overlay, and 5-tab mobile bottom navigation (`MobileNav`).
- **Real-Time Notification Center**: Reactive notification bell tracking all system mutations (confirmations, waitlist seat offers, cancellations, operator role edits, database resets) with unread counters and "Mark all read".
- **Dark & Light Mode**: Seamless theme toggle between Dark Blue (`#0B132B` / `#131F37`) and Light modes, persisted in `localStorage`.
- **Keyboard Accessibility**: Full compliance with WCAG 2.1 AA keyboard navigation (interactive cards support `role="button"`, `role="checkbox"`, `tabIndex={0}`, and `Enter`/`Space` key handlers).
- **Authentication**: Local demo login view with pre-configured operator credentials (`admin@training.com` / `admin123`).

### 2. Operations Dashboard (`#dashboard`)
- **Cohort Date Filter**: Filter between `ALL`, `2025-04-28`, and upcoming cohorts with zero cross-cohort data leakage.
- **4 Primary Metric Cards**: Total People, Confirmed Seats, Waitlisted Enrollments, and Available Seats derived purely from state with dynamic metric badges.
- **Capacity Progress Panel**: Live occupancy progress bars showing exact seat counts ($6/8$, $5/6$, $4/6$, $3/4$) and striped percentage bars with accessible ARIA labels.
- **Upcoming Sessions Timetable**: Chronological schedule view with time slots, room tags, seat counts, and status pills.

### 3. Enroll People (`#enroll`)
- **Trainee Form**: Instant input normalization (case-insensitive canonicalized email, auto-trimmed company name) and auto-fill for returning participants.
- **Target Cohort Date Selector**: Schedule registrations for specific cohort dates.
- **Interactive Session Checklist**: Real-time room capacity badges, conflict diagnostics, and keyboard-toggleable cards.
- **Live Tuition Preview Card**: Real-time breakdown of base tuition, applicable discount, and net payable.
- **Schedule Conflict Diagnostic Modal**: Visual alert intercepting overlapping session bookings for the same trainee.

### 4. Session Management & Roster (`#sessions`)
- **4 Session Overview Cards**: Visual seat occupancy bars, status metrics, and click-to-filter interaction.
- **Multi-Criteria Filter Toolbar**: Free-text search by trainee name/email/company, session filter, and status filter (`Confirmed`, `Waitlisted`, `Offered`, `Cancelled`).
- **Participant Roster Table**: Comprehensive table with status badges, price breakdown trigger, seat cancellation trigger, and waitlist promotion actions (`Accept` or `Decline` seat offers).
- **Price Breakdown Modal**: Itemized tuition audit detailing base price, applied discount (15% Early Bird, 10% Corporate Group, or Standard), and final price.
- **Cancel Seat Modal**: Safe cancellation flow with automated oldest-eligible waitlist promotion.

### 5. Trainee Directory / People Registry (`#people`)
- **4 Summary Metric Cards**: Total Trainees, Active Seats, Client Companies, and Lifetime Tuition Invested.
- **Multi-Criteria Filter Toolbar**: Search bar, company dropdown, enrollment status filter (`All`, `Confirmed`, `Waitlisted`, `Multi-Session (2+)`), and Table vs Grid view switcher.
- **Trainee Roster Table & Card Grid**: Dual view rendering participant contact info, company affiliation, active seat count, and total investment.
- **Trainee Details Modal**: Comprehensive slide-over rendering trainee contact, lifetime tuition, and enrolled course history.
- **Quick Multi-Session Registration**: `+ Enroll` action pre-populating participant credentials into `#enroll`.

### 6. Workspace Settings & Diagnostics (`#settings`)
- **Operator Profile Card**: Displays active credentials, administrative role, and Sign Out action.
- **Edit Profile & Role Modal**: Update Full Name, Email, and Operator Role (*Senior Desk Administrator*, *Desk Administrator*, *Training Coordinator*, *Registrar / Auditor*).
- **Storage Diagnostics & Telemetry**: Live `localStorage` byte count, record counters, and deterministic schema key.
- **Operational Data Exports**: One-click download of full JSON database backup snapshot, and formatted CSV spreadsheet roster with accurate discount labels (`Early Bird (15%)`, `Company Group (10%)`, `Standard Rate`).
- **Session Catalog & Governance Reference**: Documentation of room capacities, time slots, collision rules, and pricing discount policies.
- **Danger Zone Reset**: Safe development database reset back to initial seed data, protected by typing `RESET` confirmation.

---

## 9. Data Model & LocalStorage Behavior

### Storage Key: `TRAINING_ENROLLMENT_DESK_DATA`
- **Schema Version**: `1.0.0`
- **Initial Seed Fixtures**: 24 unique participants, 18 confirmed seats, 6 waitlisted entries, 12 partner companies across 4 sessions.
- **Fail-Safe Hydration**: Corrupted JSON or tampered schemas are automatically detected, triggering a non-destructive recovery to default seed fixtures.
- **Route Retention**: Active tab route (`TED_ACTIVE_TAB`) is persisted in `localStorage` and synchronized with URL hash (`#dashboard`, `#enroll`, `#sessions`, `#people`, `#settings`) to prevent redirect on page reload.

---

## 10. Project Structure

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

## 11. Known Boundaries & Extensibility

- **Browser-Local Storage**: Operational data is persisted strictly to the user's browser `localStorage`. For distributed multi-coordinator production deployments, state can be wired to a REST or GraphQL backend repository with zero component rewrites.
- **Baseline Cohort Dates**: Default session dates use `'2025-04-28'` and standard cohort dates for deterministic pricing calculations.
