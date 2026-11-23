import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deletionSignal, findDeletedPosts, type KnownPost, sentimentSignal } from '../src/social/detect';
import type { SocialPost } from '../src/social/provider';

const post = (id: string, postedAt: string): SocialPost => ({ id, postedAt, permalink: null, caption: null, imageUrl: null });
const known = (id: string, postedAt: string, featuresPartner = true): KnownPost => ({
  id,
  postedAt,
  featuresPartner,
  partnerConfidence: 0.9,
  deleted: false,
});

test('a missing post inside the visible window is a deletion', () => {
  const k = [known('1', '2026-01-01'), known('2', '2026-02-01'), known('3', '2026-03-01')];
  const current = [post('3', '2026-03-01'), post('1', '2026-01-01')];
  assert.deepEqual(findDeletedPosts(k, current, 50).map((p) => p.id), ['2']);
});

test('posts that scrolled out of a full window are not deletions', () => {
  const k = [known('old', '2025-01-01'), known('2', '2026-02-01')];
  const current = [post('3', '2026-03-01'), post('2', '2026-02-01')];
  // limit 2 and 2 returned: the window is full, so "old" may simply be beyond it
  assert.deepEqual(findDeletedPosts(k, current, 2), []);
});

test('when the window is not full, anything missing was deleted', () => {
  const k = [known('old', '2025-01-01'), known('2', '2026-02-01')];
  assert.deepEqual(findDeletedPosts(k, [post('2', '2026-02-01')], 50).map((p) => p.id), ['old']);
});

test('an empty fetch never counts as mass deletion', () => {
  assert.deepEqual(findDeletedPosts([known('1', '2026-01-01')], [], 50), []);
});

test('already-flagged deletions are not reported twice', () => {
  assert.deepEqual(findDeletedPosts([{ ...known('1', '2026-01-01'), deleted: true }], [post('2', '2026-02-01')], 50), []);
});

test('deletion signal only fires for posts featuring the partner', () => {
  assert.equal(deletionSignal('Sarah', 'Joe', [known('1', '2026-01-01', false)]), null);
  const s = deletionSignal('Sarah', 'Joe', [known('1', '2026-01-01'), known('2', '2026-01-02')]);
  assert.equal(s?.summary, 'Sarah deleted 2 posts featuring Joe');
  assert.ok(s!.severity > 0.5);
});

test('sentiment signal needs at least two negative-leaning posts', () => {
  assert.equal(sentimentSignal('Sarah', [-0.9]), null);
  assert.equal(sentimentSignal('Sarah', [0.8, 0.6, null]), null);
  assert.ok(sentimentSignal('Sarah', [-0.6, -0.4]));
});
