/**
 * Sanity test — kept to satisfy the test script glob pattern.
 * Core AHP logic is tested in ahp.test.ts
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Project sanity', () => {
  it('node test runner works', () => {
    assert.equal(1 + 1, 2);
  });
});
