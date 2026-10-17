import { useContext } from 'react';
import { EnrollmentContext } from './enrollmentContextDef.js';

/**
 * Custom hook to consume the central EnrollmentContext
 * @returns {object} EnrollmentContext value
 */
export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
}

export default useEnrollment;
