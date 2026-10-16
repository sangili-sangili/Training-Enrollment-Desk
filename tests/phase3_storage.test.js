import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock browser window.localStorage for Node test environment
const mockStorage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear()
  }
};

import { SESSION_DEFINITIONS, TOTAL_DESK_CAPACITY, getSessionById } from '../src/domain/sessions/sessionDefinitions.js';
import { SEED_PEOPLE, SEED_ENROLLMENTS, INITIAL_STORAGE_PAYLOAD } from '../src/data/seedFixtures.js';
import { validateStorageSchema } from '../src/services/storage/schemaValidator.js';
import {
  loadStorageData,
  saveStorageData,
  resetStorageData,
  STORAGE_KEY
} from '../src/services/storage/localStorageService.js';

describe('Phase 3: Data Foundation & LocalStorage Persistence', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('1. Session definitions and capacities are exact', () => {
    assert.equal(SESSION_DEFINITIONS.length, 4);
    assert.equal(TOTAL_DESK_CAPACITY, 24);

    const html = getSessionById('SES-HTML');
    assert.deepEqual(html, {
      id: 'SES-HTML',
      title: 'HTML and CSS',
      startTime: '09:00',
      endTime: '11:00',
      room: 'Room A',
      capacity: 8,
      basePrice: 2000,
      description: html.description
    });

    const react = getSessionById('SES-REACT');
    assert.equal(react.capacity, 6);
    assert.equal(react.basePrice, 4000);
    assert.equal(react.startTime, '09:30');
    assert.equal(react.endTime, '12:00');

    const testing = getSessionById('SES-TEST');
    assert.equal(testing.capacity, 6);
    assert.equal(testing.basePrice, 3000);

    const sysDes = getSessionById('SES-SYSDES');
    assert.equal(sysDes.capacity, 4);
    assert.equal(sysDes.basePrice, 5000);
  });

  it('2. Seed fixtures align with UI reference metrics (24 people, 18 confirmed, 6 waitlisted)', () => {
    assert.equal(SEED_PEOPLE.length, 24);
    assert.equal(SEED_ENROLLMENTS.length, 24);

    const confirmed = SEED_ENROLLMENTS.filter(e => e.status === 'Confirmed');
    const waitlisted = SEED_ENROLLMENTS.filter(e => e.status === 'Waitlisted');

    assert.equal(confirmed.length, 18);
    assert.equal(waitlisted.length, 6);

    // Verify session capacity invariants in seed data
    const htmlConfirmed = confirmed.filter(e => e.sessionId === 'SES-HTML').length;
    const reactConfirmed = confirmed.filter(e => e.sessionId === 'SES-REACT').length;
    const testConfirmed = confirmed.filter(e => e.sessionId === 'SES-TEST').length;
    const sysDesConfirmed = confirmed.filter(e => e.sessionId === 'SES-SYSDES').length;

    assert.equal(htmlConfirmed, 6); // 6/8
    assert.equal(reactConfirmed, 5); // 5/6
    assert.equal(testConfirmed, 4); // 4/6
    assert.equal(sysDesConfirmed, 3); // 3/4
  });

  it('3. First-run initialization seeds storage safely', () => {
    assert.equal(mockStorage.has(STORAGE_KEY), false);

    const loaded = loadStorageData();
    assert.equal(loaded.isHydratedFromSeed, true);
    assert.equal(loaded.people.length, 24);
    assert.equal(loaded.enrollments.length, 24);
    assert.equal(loaded.error, null);

    // Verify written to storage
    assert.equal(mockStorage.has(STORAGE_KEY), true);
  });

  it('4. Refresh persistence restores previously saved state', () => {
    const customPeople = [
      { id: 'PER-999', fullName: 'Test User', email: 'test@user.com', company: 'TestCo', createdAt: new Date().toISOString() }
    ];
    const customEnrollments = [
      { id: 'ENR-999', personId: 'PER-999', sessionId: 'SES-HTML', status: 'Confirmed', originalPrice: 2000, finalPrice: 2000 }
    ];

    saveStorageData({ people: customPeople, enrollments: customEnrollments });

    const reloaded = loadStorageData();
    assert.equal(reloaded.isHydratedFromSeed, false);
    assert.equal(reloaded.people.length, 1);
    assert.equal(reloaded.people[0].email, 'test@user.com');
    assert.equal(reloaded.enrollments.length, 1);
    assert.equal(reloaded.enrollments[0].id, 'ENR-999');
  });

  it('5. Invalid JSON recovers gracefully from default seed without crashing', () => {
    mockStorage.set(STORAGE_KEY, '{ malformed_broken_json :::: 123');

    const result = loadStorageData();
    assert.equal(result.isHydratedFromSeed, true);
    assert.equal(result.error, 'CORRUPTED_JSON');
    assert.equal(result.people.length, 24);
    assert.equal(result.enrollments.length, 24);
  });

  it('6. Schema validation catches missing or malformed fields', () => {
    const invalidPayload = {
      version: 1,
      people: [{ id: 'PER-1' /* missing email and fullName */ }],
      enrollments: 'not-an-array'
    };

    const validation = validateStorageSchema(invalidPayload);
    assert.equal(validation.isValid, false);
    assert.ok(validation.errors.length >= 2);
  });

  it('7. Schema validation failure falls back to seed data safely', () => {
    mockStorage.set(STORAGE_KEY, JSON.stringify({ version: -1, people: null, enrollments: [] }));

    const result = loadStorageData();
    assert.equal(result.isHydratedFromSeed, true);
    assert.equal(result.error, 'SCHEMA_VIOLATION');
    assert.equal(result.people.length, 24);
  });

  it('8. Safe reset behavior requires explicit confirmation guard', () => {
    // Save custom state
    saveStorageData({ people: [], enrollments: [] });

    // Attempt reset without confirmation
    const abortReset = resetStorageData(false);
    assert.equal(abortReset, false);

    // Confirm reset
    const confirmedReset = resetStorageData(true);
    assert.equal(confirmedReset, true);

    const reloaded = loadStorageData();
    assert.equal(reloaded.people.length, 24);
    assert.equal(reloaded.enrollments.length, 24);
  });
});
