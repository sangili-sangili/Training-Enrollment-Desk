import { checkPersonScheduleConflict } from '../sessions/sessionOverlap.js';

/**
 * Get all waitlisted enrollments for a session sorted in FIFO order (oldest enrolledAt first)
 * @param {string} sessionId
 * @param {Array<object>} enrollments
 * @returns {Array<object>}
 */
export function getWaitlistedCandidatesForSession(sessionId, enrollments = []) {
  return enrollments
    .filter(e => e.sessionId === sessionId && e.status === 'Waitlisted')
    .sort((a, b) => {
      const timeA = new Date(a.enrolledAt).getTime() || 0;
      const timeB = new Date(b.enrolledAt).getTime() || 0;
      return timeA - timeB;
    });
}

/**
 * Find the oldest waitlisted candidate who does NOT currently have a schedule conflict
 * @param {{
 *   sessionId: string,
 *   enrollments: Array<object>,
 *   sessions?: Array<object>
 * }} params
 * @returns {{
 *   candidate: object|null,
 *   skipped: Array<{ candidate: object, conflictingSession: object }>
 * }}
 */
export function findOldestEligibleWaitlistCandidate({
  sessionId,
  enrollments = [],
  sessions = []
}) {
  const queue = getWaitlistedCandidatesForSession(sessionId, enrollments);
  const skipped = [];

  for (const candidate of queue) {
    const conflictCheck = checkPersonScheduleConflict(sessionId, candidate.personId, enrollments, sessions);
    if (conflictCheck.hasConflict) {
      skipped.push({
        candidate,
        conflictingSession: conflictCheck.conflictingSession
      });
    } else {
      return {
        candidate,
        skipped
      };
    }
  }

  return {
    candidate: null,
    skipped
  };
}
