/**
 * Storage Schema Migration Handler
 * Handles forward migrations across storage schema versions.
 */

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Apply schema migrations if payload version is older
 * @param {object} payload
 * @returns {{ data: object, wasMigrated: boolean }}
 */
export function migrateStorageSchema(payload) {
  if (!payload || typeof payload !== 'object') {
    return { data: payload, wasMigrated: false };
  }

  const version = payload.version || 0;

  if (version === CURRENT_SCHEMA_VERSION) {
    return { data: payload, wasMigrated: false };
  }

  let migrated = { ...payload };

  // Future version migration hooks:
  // if (version < 1) { ... migrate to v1 ... }

  migrated.version = CURRENT_SCHEMA_VERSION;
  migrated.lastUpdated = new Date().toISOString();

  return {
    data: migrated,
    wasMigrated: true
  };
}
