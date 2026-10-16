import { getSessionById } from './sessionDefinitions.js';

/**
 * Convert HH:MM 24h string to total minutes from midnight
 * @param {string} timeStr e.g. "09:30"
 * @returns {number}
 */
export function timeStringToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Determine if two session schedules overlap
 * Overlap condition: StartA < EndB and StartB < EndA
 * @param {object} sessionA
 * @param {object} sessionB
 * @returns {boolean}
 */
export function sessionsOverlap(sessionA, sessionB) {
  if (!sessionA || !sessionB) return false;
  if (sessionA.id === sessionB.id) return false; // Not an overlap with itself

  const startA = timeStringToMinutes(sessionA.startTime);
  const endA = timeStringToMinutes(sessionA.endTime);
  const startB = timeStringToMinutes(sessionB.startTime);
  const endB = timeStringToMinutes(sessionB.endTime);

  return startA < endB && startB < endA;
}

/**
 * Find if a person has an existing confirmed or offered session that conflicts with targetSessionId
 * @param {string} targetSessionId
 * @param {string} personId
 * @param {Array<object>} enrollments
 * @param {Array<object>} [sessions]
 * @returns {{ hasConflict: boolean, conflictingSession: object|null, conflictingEnrollment: object|null }}
 */
export function checkPersonScheduleConflict(targetSessionId, personId, enrollments = [], sessions = []) {
  const targetSession = sessions.find(s => s.id === targetSessionId) || getSessionById(targetSessionId);
  if (!targetSession) {
    return { hasConflict: false, conflictingSession: null, conflictingEnrollment: null };
  }

  // Active seats held by this person: Confirmed or Offered
  const activeEnrollments = enrollments.filter(e =>
    e.personId === personId &&
    (e.status === 'Confirmed' || e.status === 'Offered') &&
    e.sessionId !== targetSessionId
  );

  for (const enr of activeEnrollments) {
    const existingSession = sessions.find(s => s.id === enr.sessionId) || getSessionById(enr.sessionId);
    if (existingSession && sessionsOverlap(targetSession, existingSession)) {
      return {
        hasConflict: true,
        conflictingSession: existingSession,
        conflictingEnrollment: enr
      };
    }
  }

  return { hasConflict: false, conflictingSession: null, conflictingEnrollment: null };
}

/**
 * Check if a batch of session IDs selected in the same form conflict with each other
 * @param {Array<string>} sessionIds
 * @param {Array<object>} [sessions]
 * @returns {{ hasInternalConflict: boolean, pair: [object, object]|null }}
 */
export function checkBatchInternalConflict(sessionIds = [], sessions = []) {
  if (!sessionIds || sessionIds.length < 2) {
    return { hasInternalConflict: false, pair: null };
  }

  const sessionObjects = sessionIds
    .map(id => sessions.find(s => s.id === id) || getSessionById(id))
    .filter(Boolean);

  for (let i = 0; i < sessionObjects.length; i++) {
    for (let j = i + 1; j < sessionObjects.length; j++) {
      if (sessionsOverlap(sessionObjects[i], sessionObjects[j])) {
        return {
          hasInternalConflict: true,
          pair: [sessionObjects[i], sessionObjects[j]]
        };
      }
    }
  }

  return { hasInternalConflict: false, pair: null };
}
