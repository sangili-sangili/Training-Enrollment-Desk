# Architectural & Business Decisions: Training Enrollment Desk

This document details the core business logic trade-offs, pricing precedence policies, and edge-case boundaries implemented in the **Training Enrollment Desk**.

---

## 1. Which Discount Wins When Both Apply, and Why

When an individual qualifies for both the **Early Bird Discount (15%)** (enrolled $\ge 7$ full calendar days prior to the session date) and the **Corporate Group Discount (10%)** ($\ge 3$ confirmed participants from the same normalized company in that session), **the Early Bird Discount (15%) always wins**.

### Rationale:
1. **Maximum Financial Benefit to the Trainee / Client**: The primary objective of an incentive structure is to reward customer commitment. Granting 15% provides the highest savings (e.g., saving ₹600 on React vs. ₹400). Downgrading an early registrant to 10% simply because their colleagues joined later penalizes proactive behavior and introduces customer friction.
2. **Contractual Predictability & Stability**: An early bird discount is locked in at the time of registration. If corporate group membership superseded early bird, a participant’s invoice would unpredictably increase from 15% off to 10% off whenever two colleagues enrolled, violating pricing stability.
3. **Strict Non-Stacking Rule**: As required by system constraints, discounts never stack. Given the mutual exclusivity, selecting the higher-value incentive ensures commercial transparency and aligns with standard event industry conventions.

---

## 2. Which Date Sets the Early-Bird Price for a Waitlisted Seat, and Why

When a waitlisted candidate is offered a vacated seat and accepts it, **the date the seat is confirmed (`confirmationDate` / date of offer acceptance), NOT the original queue registration date, sets the Early Bird eligibility**.

### Rationale:
1. **Economic Purpose of Early Bird**: Early bird incentives exist to reward early financial commitments and advance revenue that allows organizers to secure venues and instructors. A waitlisted candidate pays ₹0 and incurs zero financial commitment while in the queue.
2. **Fair Inventory Value**: If a confirmed seat is vacated 2 days before the training session, that seat represents last-minute inventory. If a waitlisted applicant who joined months prior is promoted 48 hours before the event, granting a 15% discount contradicts the purpose of early bird pricing (which requires $\ge 7$ days advance commitment).
3. **Consistency & Determinism**: If the candidate accepts the offered seat 10 days before the session, they receive the 15% discount. If they accept within 6 days or fewer, they pay the standard tuition fee (or receive the 10% corporate group discount if 3+ colleagues are confirmed).

---

## 3. Two Cases Considered and Chose Not to Support

### Case 1: Partial / Overlapping Attendance ("Soft Overlaps")
- **Considered**: Allowing participants to register for concurrently scheduled sessions (e.g., HTML & CSS 09:00–11:00 and React 09:30–12:00) with a user acknowledgment warning or prorated hours.
- **Chose Not to Support**: Enforced strict hard-block collision prevention ($Start_A < End_B \land Start_B < End_A$).
- **Why**: These are intensive, in-person cohort workshops held in physical rooms (Room A vs. Room B). Double-booking corrupts capacity limits, deprives another participant of a physical desk, and disrupts instructional continuity. Prohibiting overlaps preserves room integrity and avoids partial-attendance disputes.

### Case 2: Direct Seat Transfers / Inter-Company Seat Swapping
- **Considered**: Permitting a company or participant to transfer a confirmed seat directly to a coworker when cancelling, bypassing the waitlist queue.
- **Chose Not to Support**: Enforced strict FIFO waitlist promotion. All vacated seats automatically route to the oldest eligible candidate on the waitlist.
- **Why**: Allowing private transfers creates an unfair queue-jumping loophole where corporations could hoard confirmed seats and rotate staff internally, invalidating the transparent, chronological waitlist guarantee for public applicants.

---

## 4. What I Decided Myself

Beyond the baseline specifications, I made the following explicit architectural and domain decisions:

1. **Waitlist Conflict Skip-and-Retain**: When a confirmed seat is vacated, the FIFO promoter inspects the oldest waitlisted candidate. If that candidate has since acquired a schedule collision, the system skips them, logs the collision, and offers the seat to the next eligible candidate—**without removing the skipped candidate from the queue** for future opportunities.
2. **Dynamic Retroactive Recalculations**: If a company reaches the 3-person threshold, all earlier colleagues on standard tuition are retroactively updated to 10% off. Conversely, if a cancellation drops the company count to 2, the remaining colleagues revert to standard base tuition (unless individually eligible for Early Bird).
3. **Email Case-Insensitive Canonicalization**: All emails are normalized via `.trim().toLowerCase()` before identity resolution, ensuring `Jane.Doe@Acme.com` and `jane.doe@acme.com` map to the identical trainee record.
4. **Self-Healing Storage Hydration**: Implemented schema validation (`v1.0.0`) wrapped in try/catch handlers. If `localStorage` is corrupted or tampered with, the system performs a non-destructive recovery to default seed fixtures rather than crashing the client interface.
5. **No Stacked Discounts Guarantee**: Unified the pricing engine (`src/domain/pricing/priceBreakdown.js` via `calculatePriceBreakdown`) into a single pure function returning an itemized audit trail (`originalPrice`, `finalPrice`, `appliedDiscount`, `discountPercent`, `discountAmount`, `discountReason`) to ensure zero rounding drift.
