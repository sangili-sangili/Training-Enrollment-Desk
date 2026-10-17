# Screen 6 Notes: Workspace Settings & System Telemetry

## 1. Screen Responsibility
The **Workspace Settings & System Telemetry** screen (`/settings` or `ROUTES.SETTINGS`) serves as the administrative governance and diagnostic dashboard for the Training Enrollment Desk. It provides the desk coordinator with real-time visibility into browser `localStorage` capacity, schema validation health, participant and enrollment counts, operational data export tools (JSON backup, CSV spreadsheet roster, print views), and an explicit, safe reset mechanism guarded by confirmation input.

---

## 2. Components and Their Responsibilities

1. **`SettingsView.jsx`**
   - Main container component mounted in `App.jsx` when `activeTab === ROUTES.SETTINGS`.
   - Organizes the layout into logical operational cards: Operator Identity, Storage Telemetry, Data Export, Session Catalog Reference, and Danger Zone.
   - Manages state for the `SafeResetModal`.

2. **`OperatorProfileCard.jsx`**
   - Displays the active desk operator's avatar with initials, full name, email, and security role (`Desk Administrator`).
   - Shows active session badge indicator.
   - Provides action triggers for `Edit Profile` (opening `ProfileModal`) and `Sign Out` (clearing authentication and redirecting to `LoginView`).

3. **`StorageDiagnosticsCard.jsx`**
   - Computes live byte size of `localStorage.getItem('TRAINING_ENROLLMENT_DESK_DATA')`.
   - Summarizes active participant records, confirmed seats, waitlisted candidates, offered seats, and physical catalog capacity.
   - Displays schema version (`v1.0.0`) and health badge (`Healthy & Synchronized`).

4. **`DataExportCard.jsx`**
   - Generates downloadable JSON backup (`training-enrollment-backup-<date>.json`) containing the complete data model.
   - Formats and generates downloadable CSV roster (`training-enrollment-roster-<date>.csv`) with escaped columns for Excel/Sheets.

5. **`SessionRulesReferenceCard.jsx`**
   - Tabular reference of the 4 immutable catalog sessions: HTML & CSS (09:00-11:00, Room A), React (09:30-12:00, Room B), Testing (13:00-15:00, Room A), System Design (15:30-17:30, Room B).
   - Highlights the schedule overlap between HTML & CSS and React.
   - Documents the discount policies: Early Bird (15%), Corporate Group (10%), discount precedence, and ₹0 waitlist rule.

6. **`SafeResetModal.jsx`**
   - Accessible ARIA dialog protecting against accidental data destruction.
   - Explains that resetting will restore baseline fixtures (24 people, 18 confirmed, 6 waitlisted).
   - Enforces typing `"RESET"` to enable the confirmation button.
   - Supports Escape key dismissal and focus trapping.

---

## 3. Hooks Used and Why
- **`useEnrollment()`**: Consumes global enrollment state (`people`, `enrollments`, `sessions`, `operator`, `handleResetData`, `logout`, `setProfileModalOpen`, `addToast`).
- **`useState()`**: Local state for `resetModalOpen` and `confirmInput` in `SafeResetModal`.
- **`useMemo()`**: Derives exact storage byte count and seat breakdowns in `StorageDiagnosticsCard` without recalculating on unrelated renders.
- **`useEffect()`**: Registers and cleans up global Escape key listener for `SafeResetModal`.

---

## 4. State Ownership and Derived State
- **Global State**: `people`, `enrollments`, `sessions`, and `operator` credentials stored in `EnrollmentContext`.
- **Derived Telemetry**: Storage byte usage, confirmed/waitlisted/offered counts, and physical capacity are calculated on the fly during rendering.
- **Local State**: Reset confirmation string and dialog visibility.

---

## 5. Domain Functions Called and Persistence Flow
- **`resetStorageData(true)`**: Clears corrupted/modified records and writes clean `INITIAL_STORAGE_PAYLOAD` into `localStorage`.
- **`loadStorageData()`**: Hydrates restored state back into React state in `EnrollmentContext`.
- **`logout()`**: Sets `TED_AUTH` to `'false'`, immediately triggering client session termination.

---

## 6. Accessibility & Responsive Considerations
- Accessible ARIA dialog roles (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
- High contrast color palette meeting WCAG 2.1 AA requirements.
- Responsive CSS grid adapting from single column on mobile to 6-column telemetry on desktop.
- Visible focus rings (`focus:ring-2`, `focus:ring-red-500`) on all interactive inputs.

