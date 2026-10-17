# Screen 5 Notes: Trainee Directory & People Registry

## 1. Screen Responsibility
The **Trainee Directory / People Registry** screen (`/people` or `ROUTES.PEOPLE`) provides an individual-centric view of all participants registered in the Training Enrollment Desk. It enables coordinators to analyze attendee distribution across partner companies, track cumulative tuition investment per person, toggle between Table and Visual Card Grid views, view detailed session enrollment histories, and pre-fill participant credentials when registering them for additional courses.

---

## 2. Components and Their Responsibilities

1. **`PeopleView.jsx`**
   - Main container managing multi-criteria filtering, table/grid layout toggle, and trainee details modal.
2. **`PeopleSummaryCards.jsx`**
   - 4 metric cards: Total Trainees, Active Seats, Client Companies, and Total Tuition Invested.
3. **`PeopleFilterToolbar.jsx`**
   - Search by name/email/company, Company dropdown selector, Status filter (`Confirmed`, `Waitlisted`, `Multi-Session`), Table vs Grid switcher.
4. **`PeopleTable.jsx` & `PeopleCardGrid.jsx`**
   - Responsive table and responsive card grid rendering trainee identity, contact, corporate affiliation, enrolled session tags, and lifetime tuition.
5. **`TraineeDetailsModal.jsx`**
   - Comprehensive drawer/modal displaying full profile, company affiliation, tuition ledger, and list of all enrolled courses with direct price breakdown and cancellation controls.
6. **Pre-fill Trainee Workflow**
   - Clicking `+ Enroll` passes trainee details to `EnrollView`, auto-populating their name, email, and company for streamlined multi-session registration.

