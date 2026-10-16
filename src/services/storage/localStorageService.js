import { INITIAL_STORAGE_PAYLOAD } from '../../data/seedFixtures.js';
import { validateStorageSchema } from './schemaValidator.js';
import { migrateStorageSchema, CURRENT_SCHEMA_VERSION } from './migrationService.js';

export const STORAGE_KEY = 'TRAINING_ENROLLMENT_DESK_DATA';

/**
 * Check if browser localStorage is accessible
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load and safely hydrate training desk data
 * @returns {{
 *   people: Array<object>,
 *   enrollments: Array<object>,
 *   version: number,
 *   lastUpdated: string,
 *   isHydratedFromSeed: boolean,
 *   error: string|null
 * }}
 */
export function loadStorageData() {
  if (!isStorageAvailable()) {
    console.warn('[Storage] localStorage unavailable. Operating in in-memory session mode.');
    return {
      people: [...INITIAL_STORAGE_PAYLOAD.people],
      enrollments: [...INITIAL_STORAGE_PAYLOAD.enrollments],
      version: CURRENT_SCHEMA_VERSION,
      lastUpdated: new Date().toISOString(),
      isHydratedFromSeed: true,
      error: 'STORAGE_UNAVAILABLE'
    };
  }

  try {
    const rawData = window.localStorage.getItem(STORAGE_KEY);

    // First-run: Initialize with seed fixtures
    if (!rawData) {
      saveStorageData({
        people: INITIAL_STORAGE_PAYLOAD.people,
        enrollments: INITIAL_STORAGE_PAYLOAD.enrollments
      });

      return {
        people: [...INITIAL_STORAGE_PAYLOAD.people],
        enrollments: [...INITIAL_STORAGE_PAYLOAD.enrollments],
        version: CURRENT_SCHEMA_VERSION,
        lastUpdated: new Date().toISOString(),
        isHydratedFromSeed: true,
        error: null
      };
    }

    // Attempt JSON parse
    let parsed;
    try {
      parsed = JSON.parse(rawData);
    } catch (parseError) {
      console.error('[Storage] Corrupted JSON detected. Recovering with default seed fixtures.', parseError);
      saveStorageData({
        people: INITIAL_STORAGE_PAYLOAD.people,
        enrollments: INITIAL_STORAGE_PAYLOAD.enrollments
      });

      return {
        people: [...INITIAL_STORAGE_PAYLOAD.people],
        enrollments: [...INITIAL_STORAGE_PAYLOAD.enrollments],
        version: CURRENT_SCHEMA_VERSION,
        lastUpdated: new Date().toISOString(),
        isHydratedFromSeed: true,
        error: 'CORRUPTED_JSON'
      };
    }

    // Apply schema migration if applicable
    const { data: migratedData, wasMigrated } = migrateStorageSchema(parsed);

    // Validate schema
    const validation = validateStorageSchema(migratedData);
    if (!validation.isValid) {
      console.error('[Storage] Invalid storage schema. Recovering with seed fixtures. Violations:', validation.errors);
      saveStorageData({
        people: INITIAL_STORAGE_PAYLOAD.people,
        enrollments: INITIAL_STORAGE_PAYLOAD.enrollments
      });

      return {
        people: [...INITIAL_STORAGE_PAYLOAD.people],
        enrollments: [...INITIAL_STORAGE_PAYLOAD.enrollments],
        version: CURRENT_SCHEMA_VERSION,
        lastUpdated: new Date().toISOString(),
        isHydratedFromSeed: true,
        error: 'SCHEMA_VIOLATION'
      };
    }

    // If migrated, persist updated schema
    if (wasMigrated) {
      saveStorageData({
        people: migratedData.people,
        enrollments: migratedData.enrollments
      });
    }

    return {
      people: migratedData.people,
      enrollments: migratedData.enrollments,
      version: migratedData.version || CURRENT_SCHEMA_VERSION,
      lastUpdated: migratedData.lastUpdated || new Date().toISOString(),
      isHydratedFromSeed: false,
      error: null
    };
  } catch (error) {
    console.error('[Storage] Unexpected error loading storage. Falling back to seed.', error);
    return {
      people: [...INITIAL_STORAGE_PAYLOAD.people],
      enrollments: [...INITIAL_STORAGE_PAYLOAD.enrollments],
      version: CURRENT_SCHEMA_VERSION,
      lastUpdated: new Date().toISOString(),
      isHydratedFromSeed: true,
      error: 'UNEXPECTED_FAILURE'
    };
  }
}

/**
 * Persist people and enrollments into localStorage
 * @param {{ people: Array<object>, enrollments: Array<object> }} param0
 * @returns {boolean} success
 */
export function saveStorageData({ people, enrollments }) {
  if (!isStorageAvailable()) return false;

  try {
    const payload = {
      version: CURRENT_SCHEMA_VERSION,
      lastUpdated: new Date().toISOString(),
      people: Array.isArray(people) ? people : [],
      enrollments: Array.isArray(enrollments) ? enrollments : []
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('[Storage] Failed to save state to localStorage:', err);
    return false;
  }
}

/**
 * Safely reset persisted data back to default baseline fixtures
 * Requires explicit confirmed=true flag to guard against accidental invocation
 * @param {boolean} confirmed
 * @returns {boolean} success
 */
export function resetStorageData(confirmed = false) {
  if (!confirmed) {
    console.warn('[Storage] Reset aborted: explicit confirmation required.');
    return false;
  }

  return saveStorageData({
    people: INITIAL_STORAGE_PAYLOAD.people,
    enrollments: INITIAL_STORAGE_PAYLOAD.enrollments
  });
}

/**
 * Clear storage key entirely
 */
export function clearStorageData() {
  if (isStorageAvailable()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
