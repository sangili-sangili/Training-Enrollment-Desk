import { getSessionById, SESSION_DEFINITIONS } from '../sessions/sessionDefinitions.js';

/**
 * Calculate live occupancy and available seat counts for a specific session
 * @param {string} sessionId
 * @param {Array<object>} enrollments
 * @param {Array<object>} [sessions]
 * @returns {{
 *   sessionId: string,
 *   capacity: number,
 *   confirmedCount: number,
 *   offeredCount: number,
 *   occupiedSeats: number,
 *   availableSeats: number,
 *   waitlistedCount: number,
 *   isFull: boolean
 * }}
 */
export function getSessionOccupancy(sessionId, enrollments = [], sessions = []) {
  const session = sessions.find(s => s.id === sessionId) || getSessionById(sessionId);
  const capacity = session ? session.capacity : 0;

  const sessionEnrollments = enrollments.filter(e => e.sessionId === sessionId);

  const confirmedCount = sessionEnrollments.filter(e => e.status === 'Confirmed').length;
  const offeredCount = sessionEnrollments.filter(e => e.status === 'Offered').length;
  const waitlistedCount = sessionEnrollments.filter(e => e.status === 'Waitlisted').length;

  const occupiedSeats = confirmedCount + offeredCount;
  const availableSeats = Math.max(0, capacity - occupiedSeats);
  const isFull = availableSeats === 0;

  return {
    sessionId,
    capacity,
    confirmedCount,
    offeredCount,
    occupiedSeats,
    availableSeats,
    waitlistedCount,
    isFull
  };
}

/**
 * Calculate aggregate capacity and occupancy across all sessions
 * @param {Array<object>} enrollments
 * @param {Array<object>} [sessions]
 * @returns {Record<string, object>}
 */
export function getAllSessionsOccupancy(enrollments = [], sessions = SESSION_DEFINITIONS) {
  const result = {};
  for (const session of sessions) {
    result[session.id] = getSessionOccupancy(session.id, enrollments, sessions);
  }
  return result;
}
