// End-to-end pipeline test against an in-memory database. The Claude calls and
// the social provider are stubbed, so this checks our logic, not model output.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Findings } from '../src/ai/newsResearch';
import { loadSeasons } from '../src/api';
import { getCouple, listEvents, openDb } from '../src/db';
import { type RefreshDeps, runRefresh } from '../src/pipeline/refresh';
import { syncSeed } from '../src/seed';
import type { SocialProfile } from '../src/social/provider';

function setup() {
  const db = openDb(':memory:');
  syncSeed(db);
  return db;
}

function deps(overrides: Partial<RefreshDeps>): RefreshDeps {
  return {
    research: null,
    analyzePost: null,
    social: null,
    fetchImage: async () => null,
    thresholds: { autoPublishConfidence: 0.8, statusChangeConfidence: 0.9 },
    socialFetchLimit: 50,
    maxNewPostsPerIslander: 12,
    today: '2026-11-23',
    ...overrides,
  };
}

test('seed sync is idempotent', () => {
  const db = setup();
  syncSeed(db);
  const n = (db.prepare('SELECT COUNT(*) AS n FROM events').get() as { n: number }).n;
  syncSeed(db);
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM events').get() as { n: number }).n, n);
  assert.equal(loadSeasons(db).length, 2);
});

test('confirmed engagement is published and updates the couple; weak split waits', async () => {
  const db = setup();
  const findings: Findings = {
    events: [
      {
        date: '2026-11-01',
        title: 'Got engaged in Paris',
        detail: 'Kordell proposed on a trip.',
        kind: 'milestone',
        source_url: 'https://example.com/engaged',
        source_label: 'Example — engaged',
        confidence: 0.95,
        confirmed: true,
        implies_status: 'engaged',
      },
    ],
    current_status: { status: 'engaged', confidence: 0.9, reasoning: 'stub' },
  };
  const summary = await runRefresh(db, deps({ research: async () => findings }), 'serena-kordell');
  assert.deepEqual(summary.statusChanges, ['serena-kordell: together → engaged']);
  const couple = getCouple(db, 'serena-kordell')!;
  assert.equal(couple.status, 'engaged');
  assert.match(couple.sources, /example\.com\/engaged/);

  // Same story again next run: de-duplicated.
  await runRefresh(db, deps({ research: async () => findings }), 'serena-kordell');
  assert.equal(listEvents(db, 'serena-kordell').filter((e) => e.title === 'Got engaged in Paris').length, 1);

  const weakSplit: Findings = {
    events: [{ ...findings.events[0], title: 'Reportedly split', kind: 'split', confirmed: false, implies_status: 'split' }],
    current_status: findings.current_status,
  };
  const s2 = await runRefresh(db, deps({ research: async () => weakSplit }), 'leah-miguel');
  assert.equal(s2.eventsPending, 1);
  assert.equal(getCouple(db, 'leah-miguel')!.status, 'together');
});

test('deleting photos of the partner raises a signal but leaves status alone', async () => {
  const db = setup();
  db.prepare("UPDATE islanders SET instagram = 'leah.test' WHERE id = 'leah'").run();

  const p = (id: string, day: string) => ({
    id,
    postedAt: `2026-0${day}-01T00:00:00Z`,
    permalink: null,
    caption: `post ${id}`,
    imageUrl: null,
  });
  let profile: SocialProfile = {
    handle: 'leah.test',
    profilePictureUrl: null,
    mediaCount: 3,
    posts: [p('c', '3'), p('b', '2'), p('a', '1')],
  };
  const d = deps({
    social: { name: 'stub', fetchProfile: async (h) => (h === 'leah.test' ? profile : null) },
    // Posts a and b feature Miguel; c doesn't.
    analyzePost: async (post) => ({
      features_partner: post.caption !== 'post c',
      partner_confidence: 0.9,
      sentiment: 0.5,
      note: 'stub',
    }),
  });

  const first = await runRefresh(db, d, 'leah-miguel');
  assert.equal(first.postsAnalyzed, 3);
  assert.equal(first.signals, 0);

  profile = { ...profile, posts: [p('c', '3')] }; // a and b deleted
  const second = await runRefresh(db, d, 'leah-miguel');
  assert.equal(second.postsAnalyzed, 0, 'no re-analysis of known posts');
  assert.equal(second.deletionsDetected, 2);

  const season = loadSeasons(db).find((s) => s.id === 'love-island-usa-6')!;
  const couple = season.couples.find((c) => c.id === 'leah-miguel')!;
  assert.equal(couple.signals?.[0]?.summary, 'Leah deleted 2 posts featuring Miguel');
  assert.equal(couple.status, 'together');
});
