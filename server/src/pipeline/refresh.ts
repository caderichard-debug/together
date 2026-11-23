import type { RelationshipStatus } from '../../../src/data/types';
import type { Findings, ResearchInput } from '../ai/newsResearch';
import type { PostAnalysis, PostToAnalyze } from '../ai/postAnalysis';
import { applyPublishedEvent, type Db, type EventRow, getCouple, insertEvent, listEvents, now, type PostRow } from '../db';
import { deletionSignal, findDeletedPosts, sentimentSignal } from '../social/detect';
import type { SocialProvider } from '../social/provider';
import { decideEvent, type Thresholds, clamp01 } from './rules';

type Image = NonNullable<PostToAnalyze['image']>;

/** Everything with side effects outside the database, injectable for tests. */
export interface RefreshDeps {
  research: ((input: ResearchInput) => Promise<Findings | null>) | null;
  analyzePost: ((post: PostToAnalyze) => Promise<PostAnalysis | null>) | null;
  social: SocialProvider | null;
  fetchImage: (url: string) => Promise<Image | null>;
  thresholds: Thresholds;
  socialFetchLimit: number;
  /** Cap on Claude vision calls per islander per run. */
  maxNewPostsPerIslander: number;
  today?: string;
  log?: (msg: string) => void;
}

export interface RefreshSummary {
  couples: number;
  eventsPublished: number;
  eventsPending: number;
  statusChanges: string[];
  postsAnalyzed: number;
  deletionsDetected: number;
  signals: number;
  errors: string[];
}

interface SeasonMeta {
  showName: string;
  seasonNumber: number;
}

export async function runRefresh(db: Db, deps: RefreshDeps, onlyCoupleId?: string): Promise<RefreshSummary> {
  const log = deps.log ?? (() => {});
  const today = deps.today ?? now().slice(0, 10);
  const summary: RefreshSummary = {
    couples: 0,
    eventsPublished: 0,
    eventsPending: 0,
    statusChanges: [],
    postsAnalyzed: 0,
    deletionsDetected: 0,
    signals: 0,
    errors: [],
  };
  const runId = Number(db.prepare('INSERT INTO runs (started_at) VALUES (?)').run(now()).lastInsertRowid);

  const couples = db
    .prepare(`SELECT c.id, c.season_id, s.meta FROM couples c JOIN seasons s ON s.id = c.season_id ${onlyCoupleId ? 'WHERE c.id = ?' : ''}`)
    .all(...(onlyCoupleId ? [onlyCoupleId] : [])) as { id: string; season_id: string; meta: string }[];

  for (const row of couples) {
    summary.couples++;
    const meta = JSON.parse(row.meta) as SeasonMeta;
    const islanders = db
      .prepare('SELECT id, name, instagram FROM islanders WHERE season_id = ?')
      .all(row.season_id) as { id: string; name: string; instagram: string | null }[];
    const couple = getCouple(db, row.id)!;
    const a = islanders.find((i) => i.id === couple.islander_a)!;
    const b = islanders.find((i) => i.id === couple.islander_b)!;

    if (deps.research) {
      try {
        await refreshNews(db, deps, summary, couple.id, meta, a.name, b.name, today);
      } catch (err) {
        summary.errors.push(`news ${couple.id}: ${String(err)}`);
      }
    }

    if (deps.social && deps.analyzePost) {
      for (const [owner, partner] of [
        [a, b],
        [b, a],
      ] as const) {
        if (!owner.instagram) continue;
        try {
          await refreshSocial(db, deps, summary, couple.id, owner, partner, today);
        } catch (err) {
          summary.errors.push(`social ${owner.instagram}: ${String(err)}`);
        }
      }
    }
    log(`[refresh] ${couple.id} done`);
  }

  db.prepare('UPDATE runs SET finished_at = ?, summary = ? WHERE id = ?').run(now(), JSON.stringify(summary), runId);
  return summary;
}

async function refreshNews(
  db: Db,
  deps: RefreshDeps,
  summary: RefreshSummary,
  coupleId: string,
  meta: SeasonMeta,
  nameA: string,
  nameB: string,
  today: string,
): Promise<void> {
  const couple = getCouple(db, coupleId)!;
  const known = listEvents(db, coupleId).concat(listEvents(db, coupleId, 'pending'));
  const findings = await deps.research!({
    showName: meta.showName,
    seasonNumber: meta.seasonNumber,
    nameA,
    nameB,
    currentStatus: couple.status,
    knownEvents: known.map((e) => ({ date: e.date, title: e.title })),
    since: couple.last_researched_at?.slice(0, 10) ?? null,
    today,
  });
  db.prepare('UPDATE couples SET last_researched_at = ? WHERE id = ?').run(now(), coupleId);
  if (!findings) return;

  // Oldest first, so a later reconciliation lands after an earlier split.
  const events = [...findings.events].sort((x, y) => x.date.localeCompare(y.date));
  for (const found of events) {
    const status = getCouple(db, coupleId)!.status as RelationshipStatus;
    const decision = decideEvent(found, status, today, deps.thresholds);
    if (decision.review === 'skip') continue;

    const { inserted, id } = insertEvent(db, {
      couple_id: coupleId,
      date: found.date,
      title: found.title,
      detail: found.detail,
      kind: found.kind,
      origin: 'ai-news',
      confidence: clamp01(found.confidence),
      source_url: found.source_url,
      source_label: found.source_label,
      proposed_status: decision.proposedStatus,
      review: decision.review,
    });
    if (!inserted) continue;

    if (decision.review === 'published') {
      summary.eventsPublished++;
      const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id!) as unknown as EventRow;
      applyPublishedEvent(db, row);
      if (decision.proposedStatus) summary.statusChanges.push(`${coupleId}: ${status} → ${decision.proposedStatus}`);
    } else {
      summary.eventsPending++;
    }
  }
}

async function refreshSocial(
  db: Db,
  deps: RefreshDeps,
  summary: RefreshSummary,
  coupleId: string,
  owner: { id: string; name: string; instagram: string | null },
  partner: { id: string; name: string; instagram: string | null },
  today: string,
): Promise<void> {
  const profile = await deps.social!.fetchProfile(owner.instagram!);
  if (!profile) return;
  const ownerFirst = owner.name.split(' ')[0];
  const partnerFirst = partner.name.split(' ')[0];

  const known = db
    .prepare('SELECT * FROM posts WHERE islander_id = ? AND couple_id = ?')
    .all(owner.id, coupleId) as unknown as PostRow[];
  const knownIds = new Set(known.map((p) => p.id));
  const stamp = now();

  // Analyze new posts now: once a post is deleted its image is gone.
  let partnerRef: Image | null = null;
  if (partner.instagram) {
    const partnerProfile = await deps.social!.fetchProfile(partner.instagram);
    if (partnerProfile?.profilePictureUrl) partnerRef = await deps.fetchImage(partnerProfile.profilePictureUrl);
  }
  let analyzed = 0;
  for (const post of profile.posts) {
    if (knownIds.has(post.id)) {
      db.prepare('UPDATE posts SET last_seen = ? WHERE id = ?').run(stamp, post.id);
      continue;
    }
    if (analyzed >= deps.maxNewPostsPerIslander) continue; // picked up next run
    analyzed++;
    const image = post.imageUrl ? await deps.fetchImage(post.imageUrl) : null;
    const result = await deps.analyzePost!({
      ownerName: owner.name,
      partnerName: partner.name,
      caption: post.caption,
      image: image ?? undefined,
      partnerReference: partnerRef ?? undefined,
    });
    summary.postsAnalyzed++;
    db.prepare(
      `INSERT INTO posts (id, islander_id, couple_id, permalink, posted_at, caption, features_partner,
         partner_confidence, sentiment, analysis_note, first_seen, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      post.id,
      owner.id,
      coupleId,
      post.permalink,
      post.postedAt,
      post.caption,
      result?.features_partner ? 1 : 0,
      clamp01(result?.partner_confidence ?? 0),
      result?.sentiment ?? null,
      result?.note ?? null,
      stamp,
      stamp,
    );
  }

  const deleted = findDeletedPosts(
    known.map((p) => ({
      id: p.id,
      postedAt: p.posted_at,
      featuresPartner: p.features_partner === 1,
      partnerConfidence: p.partner_confidence,
      deleted: p.deleted_detected_at !== null,
    })),
    profile.posts,
    deps.socialFetchLimit,
  );
  for (const p of deleted) db.prepare('UPDATE posts SET deleted_detected_at = ? WHERE id = ?').run(stamp, p.id);
  summary.deletionsDetected += deleted.length;

  const recent = db
    .prepare(
      'SELECT sentiment FROM posts WHERE islander_id = ? AND couple_id = ? AND deleted_detected_at IS NULL ORDER BY posted_at DESC LIMIT 8',
    )
    .all(owner.id, coupleId) as { sentiment: number | null }[];

  const signals = [
    ['deleted_posts', deletionSignal(ownerFirst, partnerFirst, deleted)],
    ['sentiment', sentimentSignal(ownerFirst, recent.map((r) => r.sentiment))],
  ] as const;
  for (const [type, signal] of signals) {
    if (!signal) continue;
    const res = db
      .prepare('INSERT OR IGNORE INTO signals (couple_id, date, type, summary, severity) VALUES (?, ?, ?, ?, ?)')
      .run(coupleId, today, type, signal.summary, signal.severity);
    summary.signals += Number(res.changes);
  }
}
