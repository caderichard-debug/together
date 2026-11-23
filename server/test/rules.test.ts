import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { FoundEvent } from '../src/ai/newsResearch';
import { decideEvent } from '../src/pipeline/rules';

const t = { autoPublishConfidence: 0.8, statusChangeConfidence: 0.9 };
const today = '2026-11-23';
const base: FoundEvent = {
  date: '2026-10-01',
  title: 'Spotted at a wedding together',
  detail: null,
  kind: 'update',
  source_url: 'https://example.com/a',
  source_label: 'Example',
  confidence: 0.85,
  confirmed: false,
  implies_status: null,
};

test('confident update is published without changing status', () => {
  assert.deepEqual(decideEvent(base, 'together', today, t), {
    review: 'published',
    proposedStatus: null,
    reason: 'confident',
  });
});

test('low-confidence update waits for review', () => {
  assert.equal(decideEvent({ ...base, confidence: 0.5 }, 'together', today, t).review, 'pending');
});

test('unconfirmed split goes to review even at high confidence', () => {
  const d = decideEvent({ ...base, kind: 'split', implies_status: 'split', confidence: 0.95 }, 'together', today, t);
  assert.equal(d.review, 'pending');
  assert.equal(d.proposedStatus, 'split');
});

test('confirmed, confident split is published and changes status', () => {
  const d = decideEvent(
    { ...base, kind: 'split', implies_status: 'split', confidence: 0.95, confirmed: true },
    'together',
    today,
    t,
  );
  assert.equal(d.review, 'published');
  assert.equal(d.proposedStatus, 'split');
});

test('event restating the current status is not a status change', () => {
  const d = decideEvent({ ...base, implies_status: 'together' }, 'together', today, t);
  assert.equal(d.review, 'published');
  assert.equal(d.proposedStatus, null);
});

test('rumors publish but never change status', () => {
  const d = decideEvent({ ...base, kind: 'rumor', implies_status: 'split', confidence: 0.4 }, 'together', today, t);
  assert.deepEqual([d.review, d.proposedStatus], ['published', null]);
  assert.equal(decideEvent({ ...base, kind: 'rumor', confidence: 0.1 }, 'together', today, t).review, 'skip');
});

test('events without a URL or with a future/garbled date are dropped', () => {
  assert.equal(decideEvent({ ...base, source_url: '' }, 'together', today, t).review, 'skip');
  assert.equal(decideEvent({ ...base, date: '2027-01-01' }, 'together', today, t).review, 'skip');
  assert.equal(decideEvent({ ...base, date: 'last week' }, 'together', today, t).review, 'skip');
});
