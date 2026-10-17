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

  let confirmedCount = 0;
  let offeredCount = 0;
  let waitlistedCount = 0;

  for (let i = 0; i < enrollments.length; i++) {
    const enr = enrollments[i];
    if (enr.sessionId === sessionId) {
      if (enr.status === 'Confirmed') confirmedCount++;
      else if (enr.status === 'Offered') offeredCount++;
      else if (enr.status === 'Waitlisted') waitlistedCount++;
    }
  }

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
