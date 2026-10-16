/**
 * Storage Schema Validator
 * Enforces structural integrity of stored records.
 */

const VALID_STATUSES = ['Confirmed', 'Waitlisted', 'Offered', 'Cancelled'];

/**
 * Validate storage payload structure
 * @param {any} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateStorageSchema(data) {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { isValid: false, errors: ['Storage data must be a non-null object.'] };
  }

  if (typeof data.version !== 'number' || data.version < 1) {
    errors.push('Missing or invalid schema version.');
  }

  if (!Array.isArray(data.people)) {
    errors.push('Missing or non-array "people" property.');
  } else {
    data.people.forEach((person, idx) => {
      if (!person || typeof person !== 'object') {
        errors.push(`Person at index ${idx} is not an object.`);
      } else {
        if (!person.id || typeof person.id !== 'string') errors.push(`Person at index ${idx} missing string id.`);
        if (!person.email || typeof person.email !== 'string') errors.push(`Person at index ${idx} missing string email.`);
        if (!person.fullName || typeof person.fullName !== 'string') errors.push(`Person at index ${idx} missing string fullName.`);
      }
    });
  }

  if (!Array.isArray(data.enrollments)) {
    errors.push('Missing or non-array "enrollments" property.');
  } else {
    data.enrollments.forEach((enrollment, idx) => {
      if (!enrollment || typeof enrollment !== 'object') {
        errors.push(`Enrollment at index ${idx} is not an object.`);
      } else {
        if (!enrollment.id || typeof enrollment.id !== 'string') errors.push(`Enrollment at index ${idx} missing string id.`);
        if (!enrollment.personId || typeof enrollment.personId !== 'string') errors.push(`Enrollment at index ${idx} missing string personId.`);
        if (!enrollment.sessionId || typeof enrollment.sessionId !== 'string') errors.push(`Enrollment at index ${idx} missing string sessionId.`);
        if (!VALID_STATUSES.includes(enrollment.status)) {
          errors.push(`Enrollment at index ${idx} has invalid status "${enrollment.status}".`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
