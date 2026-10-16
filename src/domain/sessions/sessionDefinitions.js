/**
 * Session Definitions
 * Immutable catalog of training sessions per assignment specification.
 */
export const SESSION_DEFINITIONS = [
  {
    id: 'SES-HTML',
    title: 'HTML and CSS',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Room A',
    capacity: 8,
    basePrice: 2000,
    description: 'Modern semantic HTML5, CSS Grid, Flexbox, responsive layouts, and accessibility foundations.'
  },
  {
    id: 'SES-REACT',
    title: 'React',
    startTime: '09:30',
    endTime: '12:00',
    room: 'Room B',
    capacity: 6,
    basePrice: 4000,
    description: 'Component architecture, state orchestration, React 19 hooks, and performance tuning.'
  },
  {
    id: 'SES-TEST',
    title: 'Testing',
    startTime: '13:00',
    endTime: '15:00',
    room: 'Room A',
    capacity: 6,
    basePrice: 3000,
    description: 'Automated test suites, unit testing, integration workflows, and mock persistence testing.'
  },
  {
    id: 'SES-SYSDES',
    title: 'System Design',
    startTime: '15:30',
    endTime: '17:30',
    room: 'Room B',
    capacity: 4,
    basePrice: 5000,
    description: 'Distributed architectures, caching, capacity planning, and resilient client-server boundaries.'
  }
];

export const TOTAL_DESK_CAPACITY = SESSION_DEFINITIONS.reduce((acc, s) => acc + s.capacity, 0); // 24

/**
 * Retrieve session definition by unique ID
 * @param {string} sessionId
 * @returns {object|null}
 */
export function getSessionById(sessionId) {
  return SESSION_DEFINITIONS.find(s => s.id === sessionId) || null;
}
