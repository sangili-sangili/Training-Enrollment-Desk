# Screen 1 & 2 Notes: Application Shell & Dashboard

## 1. Screen Responsibility
The **Dashboard** screen (`/` or `ROUTES.DASHBOARD`) is the primary landing view for the Training Enrollment Desk. It provides an immediate, high-level operational overview of overall training program performance, total participant registrations, aggregate confirmed and waitlisted seats, live physical capacity utilization per session, and an upcoming session timetable.

---

## 2. Components and Their Responsibilities

1. **`Header.jsx`**
   - Brand logo, application title, global date filter selector (defaults to `'ALL'`), theme toggle (Light / Dark mode), notification bell with unread count, and operator profile dropdown.

2. **`Sidebar.jsx` & `MobileNav.jsx`**
   - Main navigation tabs (`Dashboard`, `Enroll People`, `Sessions`, `People`, `Settings`) with icons and active route indicators.
   - Mobile responsive drawer and bottom bar for small screens.

3. **`StatCardsGrid.jsx`**
   - Four top-level metric cards with distinct multi-colored circular decorative accents:
     - Total People (24)
     - Confirmed Enrollments (18)
     - Waitlisted Candidates (6)
     - Available Open Seats (derived from capacity - confirmed/offered)

4. **`CapacityProgressPanel.jsx`**
   - Visual progress bars showing occupancy rate per session (e.g. `8/8 seats (100%)`, `5/6 seats (83%)`).
   - Animated striped progress bars with color-coded status badges (`Full`, `Almost Full`, `Available`).
   - Quick action to jump directly to session roster or enroll form.

5. **`UpcomingSessionsList.jsx`**
   - Timetable list of upcoming sessions with time slots, assigned physical rooms, trainer names, and status indicators.

---

## 3. Hooks Used & State Ownership
- **`useEnrollment()`**: Consumes `people`, `enrollments`, `sessions`, `trainingDate`, `setTrainingDate`, and `theme`.
- **Derived State**: All stat card values and occupancy percentages are derived dynamically on every render from live persisted data. No duplicate or stale state is stored.

