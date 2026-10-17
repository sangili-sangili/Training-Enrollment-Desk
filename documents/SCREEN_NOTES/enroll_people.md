# Screen 3 Notes: Enroll People Workflow

## 1. Screen Responsibility
The **Enroll People** screen (`/enroll` or `ROUTES.ENROLL`) provides a registration workflow allowing operators to enter participant details, select one or more training sessions, evaluate real-time seat availability, identify schedule collisions before submission, and view transparent itemized pricing breakdowns including Early Bird (15%) and Corporate Group (10%) discounts.

---

## 2. Components and Their Responsibilities

1. **`EnrollView.jsx`**
   - Coordinates form submission, validation, conflict detection, returning trainee detection, and routing to Confirmed vs Waitlist.
   - Synchronizes with pre-filled trainee data when navigated from People Directory (`+ Enroll`).

2. **`ParticipantInputForm.jsx`**
   - Inputs for Full Name, Email Address, and Company.
   - Real-time normalization previews (trimmed lowercase email, trimmed company name).
   - Validation feedback for missing or malformed inputs.

3. **`SessionChecklist.jsx`**
   - Interactive multi-select checklist of all 4 sessions.
   - Dynamic collision warning banners when selecting overlapping sessions (e.g. HTML & CSS with React).
   - Live seat capacity counter (`Available: X seats` or `Waitlist queue`).

4. **`EnrollmentSummaryCard.jsx`**
   - Side panel computing subtotal, applied discount, and total tuition due.
   - Submit CTA `Check & Complete Enrollment`.

5. **`ConflictModal.jsx`**
   - Pop-up modal explaining exact time window collisions (e.g. 09:30-11:00) when a participant has an existing confirmed seat or selected an intra-batch conflict.

