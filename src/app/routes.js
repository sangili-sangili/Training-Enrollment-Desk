/**
 * Application Navigation & Tab Routes
 */
export const ROUTES = {
  DASHBOARD: 'dashboard',
  ENROLL: 'enroll',
  SESSIONS: 'sessions',
  PEOPLE: 'people',
  SETTINGS: 'settings'
};

export const NAV_ITEMS = [
  { id: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
  { id: ROUTES.ENROLL, label: 'Enroll People', icon: 'user-plus' },
  { id: ROUTES.SESSIONS, label: 'Sessions', icon: 'calendar' },
  { id: ROUTES.PEOPLE, label: 'People', icon: 'users' },
  { id: ROUTES.SETTINGS, label: 'Settings', icon: 'settings' }
];
