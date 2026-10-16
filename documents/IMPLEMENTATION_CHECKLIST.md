# Implementation Checklist: Training Enrollment Desk

This checklist governs the step-by-step development of the **Training Enrollment Desk** across all 8 development phases. Each phase requires completing all implementation tasks, passing testing gates, and receiving operator sign-off before advancing to the subsequent phase.

---

## Phase 1: Planning and Specification (Current Phase)

### Prerequisites:
- [x] Analyze complete assignment requirements, constraints, and edge cases.
- [x] Inspect the approved visual design references (Teal/Slate SaaS UI, Inter font, modals, toasts, cards).

### Deliverables:
- [x] `documents/PROJECT_PLAN.md` (Scope, functional/non-functional requirements, screen workflows, risks).
- [x] `documents/BUSINESS_RULES.md` (Capacity limits, overlap logic, FIFO waitlist, discount precedence).
- [x] `documents/TECHNICAL_ARCHITECTURE.md` (Layers, models, state management, storage, tokens).
- [x] `documents/TEST_STRATEGY.md` (Unit test matrices, integration workflows, persistence recovery).
- [x] `documents/IMPLEMENTATION_CHECKLIST.md` (This phase-by-phase execution checklist).

### Review & Verification Gate:
- [x] Verify exact 4 sessions: HTML & CSS (09:00-11:00, 8 seats, ₹2k), React (09:30-12:00, 6 seats, ₹4k), Testing (13:00-15:00, 6 seats, ₹3k), System Design (15:30-17:30, 4 seats, ₹5k).
- [x] Verify strict decoupling of planning from implementation code.
- [ ] **Await User / Stakeholder Confirmation to proceed to Phase 2.**

---

## Phase 2: Architecture and Directory Setup

### Prerequisites:
- [ ] User confirmation of Phase 1 completion.
- [ ] Existing Vite + React + Tailwind CSS environment verified.

### Implementation Tasks:
- [ ] Create documented folder structure under `src/`:
  - `src/app/` (App container, router, context)
  - `src/components/ui/` (Design system atoms: Button, Input, Select, Badge, Card, Modal, ProgressBar)
  - `src/components/layout/` (Header, Sidebar, MobileNav)
  - `src/components/feedback/` (ToastContainer, SessionConflictModal, PriceBreakdownModal)
  - `src/features/` (dashboard, enrollment, sessions, people, authentication)
  - `src/domain/` (sessions, enrollment, pricing, waitlist)
  - `src/data/` (defaultSessions, fixtures)
  - `src/services/storage/` (localStorageService, schemaValidator)
  - `src/hooks/`, `src/utils/`, `src/styles/`
- [ ] Define central design tokens in Tailwind configuration or CSS custom properties matching UI reference.
- [ ] Create stub exports with documented module boundaries.

### Review Gate:
- [ ] No circular dependencies.
- [ ] No application screens or business logic implemented yet.
- [ ] Update `TECHNICAL_ARCHITECTURE.md` if any structural adjustments occurred.
- [ ] **Await User / Stakeholder Confirmation to proceed to Phase 3.**

---

## Phase 3: Mock Data and LocalStorage Foundation

### Prerequisites:
- [ ] User confirmation of Phase 2 completion.

### Implementation Tasks:
- [ ] Define immutable session definitions in `src/domain/sessions/sessionDefinitions.js`.
- [ ] Create deterministic mock fixtures matching the approved UI reference numbers:
  - 24 unique people.
  - 18 confirmed enrollments across sessions.
  - 6 waitlisted enrollments across sessions.
  - 14 aggregate available seats remaining (out of 24 total).
- [ ] Implement `src/services/storage/localStorageService.js`:
  - Safe hydration with `try/catch` JSON parsing.
  - Schema version check (`version: 1`).
  - Graceful fallback to default seed fixtures on missing or corrupted data.
  - Safe data reset trigger with confirmation.
- [ ] Implement schema validation in `src/services/storage/schemaValidator.js`.

### Testing Gate:
- [ ] Verify cold load initializes seed fixtures into `localStorage`.
- [ ] Verify browser refresh preserves mutated state.
- [ ] Verify invalid JSON injection recovers safely without crashing.
- [ ] **Await User / Stakeholder Confirmation to proceed to Phase 4.**

---

## Phase 4: Pure Domain Business Logic

### Prerequisites:
- [ ] User confirmation of Phase 3 completion.

### Implementation Tasks:
- [ ] **Schedule Overlap Engine** (`src/domain/sessions/sessionOverlap.js`):
  - Overlap calculation for arbitrary intervals.
  - Matrix evaluator flagging HTML/CSS vs React collision.
- [ ] **Enrollment Validator & Lifecycle** (`src/domain/enrollment/`):
  - Email whitespace trimming and lowercasing.
  - Company name normalization.
  - Capacity ceiling verification ($Confirmed + Offered \le Capacity$).
  - Enrollment creation: Confirmed (if open seats) vs Waitlisted (if full).
- [ ] **Waitlist Promotion & Offer Engine** (`src/domain/waitlist/`):
  - Oldest-first FIFO queue retrieval (`createdAt` ascending).
  - Schedule conflict re-validation on promotion.
  - Offer reservation (decrements available capacity).
  - Operator `Accept Offer` (sets `confirmedAt`, calculates price) and `Decline Offer`.
- [ ] **Pricing & Discount Calculator** (`src/domain/pricing/`):
  - Early Bird 15% calculator ($\ge 7$ calendar days before session).
  - Company 10% calculator ($\ge 3$ unique confirmed employees).
  - Discount precedence: Early Bird (15%) priority over Company (10%).
  - Waitlisted pricing rule (₹0 payable).
  - Dynamic company discount recalculation on status changes.

### Testing Gate:
- [ ] Unit tests covering all 12 test matrix cases in `TEST_STRATEGY.md`.
- [ ] Zero DOM or React dependencies in domain modules.
- [ ] **Await User / Stakeholder Confirmation to proceed to Phase 5.**

---

## Phase 5: Screen-by-Screen UI Implementation

### Prerequisites:
- [ ] User confirmation of Phase 4 completion.

### Implementation Tasks (Screen by Screen):
- [ ] **Stage 5.1: App Shell & Layout**:
  - Sidebar with logo, navigation links, and admin avatar.
  - Header with title, search input, date badge, and user pill.
  - Mobile responsive drawer and bottom tab navigation.
- [ ] **Stage 5.2: Dashboard Screen**:
  - 4 Stat cards (Total People, Confirmed, Waitlisted, Available Seats) derived from live data.
  - Session Capacity & Occupancy panel with progress bars.
  - Upcoming sessions list with room tags and status badges.
- [ ] **Stage 5.3: Enroll People Screen**:
  - Trainee information form (Name, Email with normalization hint, Company).
  - Session selection checklist with available seat counts and time badges.
  - Selected sessions side panel with price summary and "Check & Enroll" CTA.
  - Integration with Session Conflict Modal and Toast feedback.
- [ ] **Stage 5.4: Session Management & Roster Screen**:
  - Top session summary cards with occupancy rates.
  - Search and filter bar (by session, by status: Confirmed, Waitlisted, Offered, Cancelled).
  - Roster table with action buttons (Price Breakdown, Accept/Decline Offer, Cancel Seat).
  - Pagination controls.
- [ ] **Stage 5.5: Trainee Directory Screen**:
  - Searchable list of unique participants and individual enrollment history.
- [ ] **Stage 5.6: Interaction Dialogs & Feedback**:
  - Session Conflict Modal.
  - Price Breakdown Modal with itemized discounts.
  - Toast notification system with auto-dismiss.
  - Operator Login Modal for demo authentication.

### Review Gate:
- [ ] Stop after each screen to verify responsive layouts, interactive controls, and visual fidelity against reference designs.
- [ ] **Await User / Stakeholder Confirmation to proceed to Phase 6.**

---

## Phase 6: Per-Screen Review and Documentation

### Prerequisites:
- [ ] User confirmation of Phase 5 completion.

### Tasks:
- [ ] Functional inspection of all buttons, filters, dropdowns, and modals.
- [ ] Accessibility audit: focus traps, ARIA attributes, color contrast, keyboard navigation.
- [ ] Create screen documentation under `documents/SCREEN_NOTES/`:
  - `Dashboard.md`
  - `EnrollPeople.md`
  - `SessionManagement.md`
  - `PeopleDirectory.md`
  - `ModalsAndFeedback.md`
- [ ] **Await User / Stakeholder Confirmation to proceed to Phase 7.**

---

## Phase 7: Full Test, Audit, and Regression Verification

### Prerequisites:
- [ ] User confirmation of Phase 6 completion.

### Tasks:
- [ ] Execute full unit and integration test suite.
- [ ] Run edge case testing (concurrent overlaps, waitlist promotions, company discount revocation).
- [ ] Run production build (`npm run build`) and verify zero errors.
- [ ] Update `documents/TEST_STRATEGY.md` with final pass/fail counts.
- [ ] Create `documents/FINAL_REVIEW.md`.
- [ ] **Await User / Stakeholder Confirmation to proceed to Phase 8.**

---

## Phase 8: Final Documentation and Submission Readiness

### Prerequisites:
- [ ] User confirmation of Phase 7 completion.

### Tasks:
- [ ] Update root `README.md` with comprehensive documentation (tech stack, scripts, architecture, features, storage contract, setup guide).
- [ ] Verify clean git status and commit readiness.
- [ ] Final reporting to user with transparent summary of deliverables and scope of verification.
