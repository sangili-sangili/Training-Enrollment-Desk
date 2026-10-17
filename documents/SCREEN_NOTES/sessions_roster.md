# Screen 4 Notes: Session Management & Participant Roster

## 1. Screen Responsibility
The **Session Management & Participant Roster** screen (`/sessions` or `ROUTES.SESSIONS`) allows operators to oversee the 4 catalog sessions, monitor occupancy progress, search and filter the full enrollment roster by session and status, review itemized price audits, cancel confirmed seats, and manage the automated FIFO waitlist promotion workflow (accepting/declining offered seats).

---

## 2. Components and Their Responsibilities

1. **`SessionsView.jsx`**
   - Coordinates session cards, filter toolbar, roster table, and interaction modals.
2. **`SessionOverviewCards.jsx`**
   - 4 clickable overview cards with room badges, times, occupancy progress bars, and click-to-filter capability.
3. **`RosterFilterToolbar.jsx`**
   - Search input (searches by participant name, email, or company), Session dropdown filter, Status dropdown filter (`All`, `Confirmed`, `Waitlisted`, `Offered`, `Cancelled`), and `+ New Enrollment` trigger.
4. **`RosterTable.jsx`**
   - Interactive data table rendering participant initials avatar, contact, session title, room, status pill badge, enrolled date, and net price.
   - Action triggers: `Price Audit`, `Cancel Seat`, `Accept Offer`, `Decline Offer`.
5. **`CancelEnrollmentModal.jsx`**
   - Safe cancellation dialog showing what will happen, and highlighting if an eligible waitlisted candidate will automatically receive a seat offer.
6. **`PriceBreakdownModal.jsx`**
   - Itemized tuition modal showing base price, discount name, rate percentage, deduction amount, and final charge.

---

## 3. Automated Test Verification
- Tested via `tests/phase6_sessions_roster_screen.test.js` (14 tests passing).
- Tests session occupancy math, multi-criteria filtering, price breakdown audits, seat cancellation with waitlist promotion, and offer acceptance/decline workflows.
