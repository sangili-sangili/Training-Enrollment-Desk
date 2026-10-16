Phase 1

Act as a senior software engineer with 10+ years of experience in React architecture, frontend engineering, business workflow design, code review, performance optimization, and automated testing.

I am developing a Training Enrollment Desk as a technical assessment demonstrating my 2+ years of software development experience.

## Objective

Before writing any application code, analyze the complete assignment requirements and the approved UI design reference.

Create the following documents inside a root-level `documents/` directory:

1. `documents/PROJECT_PLAN.md`
2. `documents/BUSINESS_RULES.md`
3. `documents/TECHNICAL_ARCHITECTURE.md`
4. `documents/TEST_STRATEGY.md`
5. `documents/IMPLEMENTATION_CHECKLIST.md`

Do not implement React components, CSS, business logic, or application features in this phase.

## Planning requirements

### PROJECT_PLAN.md
Document:
- Project objective and scope.
- Functional requirements.
- Non-functional requirements.
- Screen inventory and user workflows.
- Development phases and dependencies.
- Acceptance criteria for each screen.
- Risks and edge cases.
- Definition of done.

### BUSINESS_RULES.md
Explicitly document:
- One normalized email per person.
- Multiple session enrollments per person.
- Session overlap detection and conflict messages.
- Session capacity and seat reservation rules.
- Confirmed, waitlisted, offered, and cancelled states.
- Cancellation and oldest-eligible-waitlist offer workflow.
- Offer acceptance and decline.
- Early-bird and company discount eligibility.
- Discount precedence and price calculations.
- Enrollment-date versus confirmation-date pricing.
- Company discount recalculation when enrollment status changes.
- Behavior when localStorage data is missing or corrupted.

Use the exact four sessions, time ranges, capacities, and prices from the assignment.

Identify any ambiguous requirements and recommend explicit decisions. Do not silently invent business rules.

### TECHNICAL_ARCHITECTURE.md
Describe:
- Recommended React + Vite + JavaScript architecture.
- Component, page, domain, service, and persistence boundaries.
- State management strategy.
- Data models and relationships.
- Function responsibilities and module dependencies.
- LocalStorage schema and versioning strategy.
- Error handling and validation strategy.
- Performance considerations and rendering strategy.
- Accessibility and responsive design.
- Testing architecture.
- Dependency management.

Prefer straightforward architecture over unnecessary enterprise abstractions.

### TEST_STRATEGY.md
Plan:
- Pure business logic unit tests.
- Component interaction tests.
- Integration tests for enrollment workflows.
- LocalStorage persistence tests.
- Regression tests.
- Edge cases and boundary conditions.
- Production build verification.

Include specific business scenarios and their expected outcomes.

### IMPLEMENTATION_CHECKLIST.md
Create an ordered checklist that can be completed phase by phase. Include prerequisites, implementation tasks, review gates, testing gates, and completion criteria.

## Mandatory business constraints

The planning must preserve these requirements:

- HTML and CSS: 09:00–11:00, Room A, 8 seats, ₹2,000.
- React: 09:30–12:00, Room B, 6 seats, ₹4,000.
- Testing: 13:00–15:00, Room A, 6 seats, ₹3,000.
- System Design: 15:30–17:30, Room B, 4 seats, ₹5,000.
- Overlapping confirmed sessions are prohibited for the same person.
- A full session cannot exceed its capacity.
- Waitlisted people are not charged.
- Offered seats are not confirmed until accepted by the operator.
- A cancelled confirmed seat is offered to the oldest eligible waitlisted person.
- Early bird is 15% when eligible at least seven calendar days before the session.
- Company discount is 10% when at least three unique people from the same normalized company are confirmed in that session.
- Apply only one discount. Recommend early bird when both qualify and document the reasoning.
- For immediate confirmation, use the original enrollment date for early-bird eligibility. For an accepted waitlist offer, use the confirmation date.
- Mock data and localStorage only. No backend.

## Design reference

Use the previously approved UI design direction:
- Professional SaaS dashboard.
- Teal and green accents.
- Inter typography.
- Responsive desktop and mobile layouts.
- Enrollment forms, session management, search and filters.
- Toast notifications, authentication screen, modal dialogs, and accessible status badges.

The approved visual design is a reference, not permission to change business requirements.

## Rules

- Inspect the existing project and assignment files before making recommendations.
- Keep all decisions traceable to requirements or explicitly labelled proposals.
- Do not claim tests have passed when no tests have been run.
- Do not create unnecessary documents or duplicate the same information across documents.
- Do not install dependencies in this phase.
- Do not begin implementation.

At completion, summarize the documents created, the key architectural recommendations, unresolved questions, and the next implementation phase.


Phase 2


Read all documents in `documents/`, inspect the existing Vite + React project, and act as a senior frontend architect.

Your task is to establish the final project structure for the Training Enrollment Desk.

## Requirements

1. Follow `PROJECT_PLAN.md`, `BUSINESS_RULES.md`, and `TECHNICAL_ARCHITECTURE.md`.
2. Keep React components separate from business rules and persistence.
3. Use JavaScript and JSX, not TypeScript.
4. Use the existing dependency setup where possible. Do not reinstall or upgrade working dependencies without a reason.
5. Do not implement the actual application screens yet.
6. Create only the necessary directories, foundational configuration, and documented module boundaries.
7. Update the architecture document if the inspected project requires a justified adjustment.

## Suggested structure

Use this as a starting point, not a rigid requirement:

src/
  app/
    App.jsx
    routes.jsx
  components/
    ui/
    layout/
    feedback/
  features/
    dashboard/
    enrollment/
    sessions/
    people/
    authentication/
  domain/
    sessions/
    enrollment/
    pricing/
    waitlist/
  data/
    sessions.js
    fixtures/
  services/
    storage/
  hooks/
  utils/
  styles/
  tests/
    unit/
    integration/

documents/
  PROJECT_PLAN.md
  BUSINESS_RULES.md
  TECHNICAL_ARCHITECTURE.md
  TEST_STRATEGY.md
  IMPLEMENTATION_CHECKLIST.md

README.md

## Architecture rules

- Put pure business rules in domain modules.
- Put localStorage access behind a small persistence service.
- Keep static session definitions separate from mutable enrollment data.
- Keep reusable UI components independent of business-specific calculations.
- Use feature-level components for enrollment and session workflows.
- Avoid creating generic abstractions until a real reuse requirement exists.
- Avoid giant components, deeply nested ternaries, duplicated business logic, and oversized utility files.
- Avoid unnecessary global state libraries, custom hooks, wrapper components, and helper functions.
- Keep imports understandable and avoid circular dependencies.
- Use one consistent naming convention.

## Output

Create the agreed structure and any necessary foundational files. Update `TECHNICAL_ARCHITECTURE.md` with the actual structure.

Do not implement the business logic or complete screens in this phase. Report each file created and explain its responsibility briefly.


Phase 3

Read the planning documents and inspect the current project structure.

Implement the data foundation for Training Enrollment Desk using deterministic mock data and browser localStorage only.

## Implement

1. Static definitions for the four training sessions.
2. A consistent data model for people and enrollments.
3. Separate mock fixtures for development and testing.
4. A localStorage persistence service.
5. Data initialization and safe hydration.
6. Schema versioning and basic migration handling.
7. Data validation and safe handling of corrupted storage.
8. Stable IDs and ISO timestamps.
9. A documented reset mechanism for development data, with confirmation before destructive reset.

## Data rules

- Normalize emails and company names consistently.
- One person can have multiple enrollment records.
- Each enrollment belongs to exactly one person and one session.
- Store status, enrollment date, waitlist date, offer date, and confirmation date where applicable.
- Keep session definitions separate from enrollment records.
- Persist all state needed to reconstruct the workflow after a refresh.
- Never store duplicate derived totals as independent mutable state.
- Avoid overwriting existing valid user data when the application starts.
- Seed data only when required by the initialization strategy.
- Ensure the fixtures obey capacity, overlap, and status rules.
- Never store passwords or pretend localStorage provides secure authentication.

## Data access design

Provide small, focused functions for loading, saving, validating, and resetting persisted data. Handle JSON parsing failures and invalid schemas gracefully.

Use a single documented storage schema. Avoid spreading direct localStorage calls throughout components.

## Tests

Test:
- First-run initialization.
- Valid data hydration.
- Refresh persistence.
- Invalid JSON recovery.
- Duplicate email normalization.
- Stable enrollment relationships.
- Session definitions and capacities.
- Safe reset behavior.

Run the relevant tests and fix failures.

Do not implement the full UI or duplicate business logic in this phase. Update the architecture and test documents if necessary, and summarize the storage schema and verification results.


phase 4

Read `BUSINESS_RULES.md`, `TECHNICAL_ARCHITECTURE.md`, and `TEST_STRATEGY.md`.

Implement the Training Enrollment Desk's pure business logic in JavaScript. Do not implement the full UI in this phase.

## Required domain modules

Create focused modules for:

- Session overlap and conflict identification.
- Enrollment validation.
- Capacity and reserved-offer calculations.
- Enrollment creation.
- Cancellation.
- Waitlist ordering.
- Seat offer creation.
- Offer acceptance and decline.
- Early-bird eligibility.
- Company discount eligibility.
- Price breakdown.
- Search and filtering if these are genuinely domain-independent.

Adjust the module names to the agreed architecture.

## Important implementation details

### Enrollment
- Normalize email.
- Reuse existing people by email.
- Prevent duplicate enrollments in the same session.
- Identify conflicting confirmed sessions.
- Return structured success or error results.

### Capacity and offers
- Never exceed capacity.
- A pending offer must reserve a seat.
- Only one outstanding offer should reserve a particular available seat.
- Acceptance must revalidate eligibility, overlap, and capacity.
- Cancellation must free the confirmed seat.
- Select the oldest eligible waitlisted enrollment.
- Declining an offer must allow the next eligible person to receive an offer.
- Handle invalid state transitions explicitly.

### Pricing
- Use explicit session dates and deterministic date inputs.
- Use calendar-day rules consistently for early-bird eligibility.
- Use original enrollment date for immediate confirmation.
- Use confirmation date for an accepted waitlist offer.
- Apply early bird at 15%, otherwise company discount at 10%, otherwise no discount.
- Count unique confirmed people from the same normalized company and session.
- Exclude waitlisted, offered, and cancelled enrollments.
- Include the current person when calculating whether their confirmation reaches the company threshold.
- Recalculate the price when relevant enrollment statuses change.
- Do not charge unconfirmed enrollments.

### Code quality
- Prefer pure functions and explicit arguments.
- Do not access React state or localStorage from pure domain functions.
- Avoid unnecessary abstractions and redundant calculations.
- Do not use broad catch blocks that silently hide errors.
- Use consistent result structures and meaningful names.
- Keep business rules readable enough for a reviewer to understand quickly.

## Tests

Implement unit tests for every domain function, including boundary cases and invalid transitions.

Run the tests and correct the implementation rather than weakening assertions.

Update `BUSINESS_RULES.md` or `TEST_STRATEGY.md` if implementation exposes a genuine ambiguity. Do not silently change agreed behavior.

At completion, report the domain functions created, test results, and any unresolved business decisions.


phase 5

Read all planning documents and inspect the approved Training Enrollment Desk UI reference.

Implement the application UI in small, reviewable stages. Do not generate every screen in one giant component.

## Design system

Use the approved design direction:
- Primary teal: `#009688`
- Hover teal: `#007F76`
- Active dark teal: `#115569`
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Border: `#E2E8F0`
- Primary text: `#0F172A`
- Secondary text: `#64748B`
- Success: `#10B981`
- Warning: `#F59E0B`
- Information: `#3B82F6`
- Error: `#EF4444`
- Font: Inter

Verify these tokens against the approved design reference and define them centrally rather than scattering hex values throughout components.

Implement reusable form controls, buttons, cards, badges, dialogs, toasts, page headers, empty states, and responsive navigation where they genuinely reduce duplication.

## Screens

Implement in this order:

1. Application shell and navigation.
2. Dashboard.
3. Enrollment form.
4. Session management and enrollment table.
5. Search, filters, and people view.
6. Login screen only if a local demo login is part of the approved plan.
7. Confirmation modals, price breakdown modal, toast notifications, and other required interaction states.

## Integration requirements

- Connect the UI to the data and domain modules already implemented.
- Use actual persisted data, not hardcoded dashboard counts.
- Make every visible action functional.
- Use shared functions for business logic.
- Show clear validation errors and success feedback.
- Keep form state local where possible.
- Use derived values instead of maintaining redundant copies of the same state.
- Handle loading-free client-side updates and persistence errors appropriately.
- Preserve all enrollment rules during edits and status changes.

## Responsive behavior

- Desktop: sidebar navigation and readable data tables.
- Tablet: flexible grids and compact navigation.
- Mobile: responsive navigation, stacked forms, usable session cards, and accessible table alternatives.
- Avoid horizontal overflow and tiny controls.
- Provide visible keyboard focus and accessible labels.

## Visual quality

Follow the approved design, including spacing, typography, teal accents, status colors, subtle shadows, modal styling, and toast positioning.

Use restrained transitions and animation. Respect reduced-motion preferences. Avoid unnecessary animation libraries.

## Performance

- Keep component responsibilities small.
- Avoid extracting a component or hook solely to satisfy a rule without a practical benefit.
- Use memoization only where it prevents meaningful repeated work or referential instability.
- Avoid effects for values that can be derived during rendering.
- Avoid effect-driven state synchronization loops.
- Keep list keys stable.
- Ensure event handlers do not trigger duplicate submissions.
- Do not sacrifice readability for premature optimization.

Implement one screen at a time. After each screen, stop and report the files changed, user workflows completed, tests run, and remaining issues. Do not proceed to the next screen until the current screen passes its review gate.


phase 6

Review the currently implemented screen against its acceptance criteria in `PROJECT_PLAN.md`.

Do not add new features or redesign the screen unless a defect or requirement mismatch demands it.

## 1. Functional verification

Test every visible control:
- Buttons.
- Forms and validation.
- Search fields.
- Filters.
- Dropdowns.
- Modal open, close, confirm, and cancel actions.
- Toast notifications.
- Navigation.
- Loading, empty, error, and success states.
- Mobile interactions.

Verify that the UI uses the actual domain functions and persisted data.

## 2. Code review

Inspect the screen and related modules for:
- Duplicate logic.
- Unused imports, variables, functions, and dependencies.
- Incorrect effect dependencies.
- Effects that should be derived calculations.
- Unnecessary state.
- Unnecessary component rerenders.
- Unstable list keys.
- Duplicate event submissions.
- Stale state and closure problems.
- Incorrect error handling.
- Accessibility issues.
- Responsive layout defects.
- Violations of business rules.

Use React DevTools or profiling tools if available and useful. Do not claim to have measured rendering performance unless you actually measured it.

Do not add useMemo, useCallback, memo, or custom hooks automatically. Explain their purpose where they are used.

## 3. Tests

Write or update tests for the screen's important behavior. Use the existing testing tools and naming conventions.

Run the relevant tests and fix failures before completing the review.

## 4. Documentation

Create or update:

`documents/SCREEN_NOTES/<screen-name>.md`

Include:
- Screen responsibility.
- Components and their responsibilities.
- Hooks used and why.
- State ownership and derived state.
- Domain functions called and their input/output behavior.
- Persistence flow.
- User interaction flow.
- Validation and error states.
- Accessibility and responsive considerations.
- Test cases and results.
- Performance decisions.
- Known limitations.

Document only hooks and functions that actually exist in the implementation. Do not invent usage or claim unverified improvements.

## 5. Completion report

Summarize:
- Files reviewed or changed.
- Tests executed and their actual results.
- Bugs fixed.
- Unnecessary code removed.
- Remaining issues.

Do not proceed to another screen until the current screen's acceptance criteria and tests pass.

phase 7

Perform a full quality audit of the completed Training Enrollment Desk.

Read all planning documents and screen notes. Inspect the implementation rather than assuming the code matches the documentation.

Do not add features or perform a broad refactor without identifying a concrete defect or maintainability problem.

## Test categories

### Business logic
- Overlapping confirmed sessions.
- Non-overlapping sessions.
- Duplicate email and duplicate enrollment.
- Full session capacity.
- Reserved seats for offers.
- Cancellation and seat release.
- Waitlist ordering.
- Offer acceptance and decline.
- Ineligible waitlisted applicants.
- Early-bird boundaries.
- Company discount threshold.
- Discount precedence.
- Price recalculation.
- Confirmation-date pricing.

### Persistence
- Initial load.
- Refresh.
- Invalid storage.
- Schema migration behavior.
- State updates after cancellation and confirmation.
- Recovery from persistence errors.

### UI and integration
- Complete enrollment workflow.
- Existing-person enrollment.
- Search and combined filters.
- Modal interactions.
- Toast feedback.
- Navigation.
- Mobile layouts.
- Keyboard accessibility.
- Empty and error states.

### Code quality
- Unused and duplicate functions.
- Unnecessary dependencies.
- Incorrect React effect usage.
- Redundant state.
- Unnecessary rerenders.
- Inconsistent business logic.
- Broken imports.
- Console errors and warnings.
- Misleading comments.
- Inaccessible controls.
- Hardcoded values that should be derived.

## Commands and verification

Inspect `package.json` and use the actual available scripts.

Run:
1. Full unit test suite.
2. Integration tests.
3. Production build.
4. Linting if configured.
5. Additional static checks only when supported by the project.

Do not install new tooling unless needed and justified.

Fix defects and rerun the affected tests. Then rerun the complete suite and production build.

Do not modify test assertions simply to make incorrect business behavior pass.

## Deliverables

Update `documents/TEST_STRATEGY.md` with:
- Tests executed.
- Actual pass/fail counts.
- Failures and fixes.
- Uncovered cases.
- Remaining limitations.

Create `documents/FINAL_REVIEW.md` with:
- Architecture review.
- Business-rule review.
- UI and accessibility review.
- Performance review.
- Dependency and security review.
- Verification results.
- Known limitations.

Never claim a test, audit, or performance measurement was completed unless it actually was.


phase 8
Perform the final documentation and submission review for the completed Training Enrollment Desk.

Inspect the actual source code, package.json, lockfile, configuration files, tests, and planning documents before updating documentation.

## README.md

Update the existing README rather than replacing it with generic boilerplate.

Include only features and tools that are genuinely implemented.

Required sections:
1. Project overview.
2. Actual technology stack.
3. Prerequisites.
4. Installation steps.
5. Development command.
6. Test command.
7. Production build command.
8. Implemented application features.
9. Data model and localStorage behavior.
10. Project structure.
11. Testing approach.
12. Known limitations.

Verify every command against package.json and the current project configuration.

## Dependencies

- Do not add libraries merely because they are commonly used.
- Do not remove dependencies without checking their actual usage.
- Identify unused dependencies and remove them only when safe.
- Keep package.json and the lockfile consistent.
- Do not claim that the application uses a backend, database, authentication provider, or library that is not actually implemented.

## Architecture and code review

Verify:
- Planning documents match the final implementation.
- Business logic is separated from React components.
- No duplicate email or enrollment rules exist in multiple locations.
- No unused functions or dead files remain.
- No hardcoded dashboard totals exist.
- No critical business rule is bypassed by the UI.
- All visible controls work.
- Errors are handled honestly.
- The app is responsive.
- The production build succeeds.
- Tests reflect real business cases.
- No credentials or secrets are committed.

Check the Git diff to ensure unrelated files and accidental changes are not included.

## Final output

Report:
- Actual project structure.
- Major features completed.
- Important architectural decisions.
- Dependencies used and their purpose.
- Test results.
- Production build result.
- Remaining limitations.
- Files ready for GitHub submission.

Do not claim the code is guaranteed bug-free. Report the scope of verification honestly.

Do not create a GitHub branch, push code, or claim remote submission unless those actions have actually been completed.