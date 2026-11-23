import { DatabaseSync } from 'node:sqlite';
import type { Couple, EventOrigin, RelationshipStatus, TimelineEvent } from '../../src/data/types';

export type Db = DatabaseSync;

export type EventReview = 'published' | 'pending' | 'rejected';

export interface EventRow {
  id: number;
  couple_id: string;
  date: string;
  title: string;
  detail: string | null;
  kind: NonNullable<TimelineEvent['kind']>;
  origin: EventOrigin;
  confidence: number | null;
  source_url: string | null;
  source_label: string | null;
  /** If set, publishing this event changes the couple's status. */
  proposed_status: RelationshipStatus | null;
  review: EventReview;
  dedupe_key: string;
  created_at: string;
}

export interface PostRow {
  id: string;
  islander_id: string;
  couple_id: string;
  permalink: string | null;
  posted_at: string;
  caption: string | null;
  features_partner: number;
  partner_confidence: number;
  sentiment: number | null;
  analysis_note: string | null;
  first_seen: string;
  last_seen: string;
  deleted_detected_at: string | null;
}

export function openDb(path: string): Db {
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS seasons (
      id TEXT PRIMARY KEY,
      sort_order INTEGER NOT NULL,
      meta TEXT NOT NULL            -- JSON: Season without islanders/couples
    );

    CREATE TABLE IF NOT EXISTS islanders (
      id TEXT NOT NULL,
      season_id TEXT NOT NULL REFERENCES seasons(id),
      name TEXT NOT NULL,
      role TEXT,
      instagram TEXT,
      PRIMARY KEY (season_id, id)
    );

    CREATE TABLE IF NOT EXISTS couples (
      id TEXT PRIMARY KEY,
      season_id TEXT NOT NULL REFERENCES seasons(id),
      islander_a TEXT NOT NULL,
      islander_b TEXT NOT NULL,
      status TEXT NOT NULL,
      headline TEXT NOT NULL,
      finale_placement INTEGER,
      sources TEXT NOT NULL,        -- JSON: Source[]
      last_verified TEXT NOT NULL,
      last_researched_at TEXT       -- when news research last ran for this couple
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      couple_id TEXT NOT NULL REFERENCES couples(id),
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT,
      kind TEXT NOT NULL,
      origin TEXT NOT NULL,
      confidence REAL,
      source_url TEXT,
      source_label TEXT,
      proposed_status TEXT,
      review TEXT NOT NULL,
      dedupe_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE (couple_id, dedupe_key)
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      islander_id TEXT NOT NULL,
      couple_id TEXT NOT NULL REFERENCES couples(id),
      permalink TEXT,
      posted_at TEXT NOT NULL,
      caption TEXT,
      features_partner INTEGER NOT NULL DEFAULT 0,
      partner_confidence REAL NOT NULL DEFAULT 0,
      sentiment REAL,
      analysis_note TEXT,
      first_seen TEXT NOT NULL,
      last_seen TEXT NOT NULL,
      deleted_detected_at TEXT
    );

    CREATE TABLE IF NOT EXISTS signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      couple_id TEXT NOT NULL REFERENCES couples(id),
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      summary TEXT NOT NULL,
      severity REAL NOT NULL,
      UNIQUE (couple_id, date, type, summary)
    );

    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      summary TEXT
    );
  `);
  return db;
}

export function now(): string {
  return new Date().toISOString();
}

/** Normalises a title so the same story from two runs collapses to one event. */
export function dedupeKey(date: string, title: string): string {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .sort();
  return `${date.slice(0, 7)}|${words.join(' ')}`;
}

export function insertEvent(
  db: Db,
  e: Omit<EventRow, 'id' | 'created_at' | 'dedupe_key'> & { dedupe_key?: string },
): { inserted: boolean; id?: number } {
  const result = db
    .prepare(
      `INSERT OR IGNORE INTO events
        (couple_id, date, title, detail, kind, origin, confidence, source_url, source_label,
         proposed_status, review, dedupe_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      e.couple_id,
      e.date,
      e.title,
      e.detail,
      e.kind,
      e.origin,
      e.confidence,
      e.source_url,
      e.source_label,
      e.proposed_status,
      e.review,
      e.dedupe_key ?? dedupeKey(e.date, e.title),
      now(),
    );
  return result.changes > 0
    ? { inserted: true, id: Number(result.lastInsertRowid) }
    : { inserted: false };
}

export function getCouple(db: Db, id: string) {
  return db.prepare('SELECT * FROM couples WHERE id = ?').get(id) as
    | {
        id: string;
        season_id: string;
        islander_a: string;
        islander_b: string;
        status: RelationshipStatus;
        headline: string;
        finale_placement: number | null;
        sources: string;
        last_verified: string;
        last_researched_at: string | null;
      }
    | undefined;
}

export function listEvents(db: Db, coupleId: string, review: EventReview = 'published'): EventRow[] {
  return db
    .prepare('SELECT * FROM events WHERE couple_id = ? AND review = ? ORDER BY date DESC, id DESC')
    .all(coupleId, review) as unknown as EventRow[];
}

/** Applies a published event to its couple: status change, headline, sources, last verified. */
export function applyPublishedEvent(db: Db, event: EventRow): void {
  const couple = getCouple(db, event.couple_id);
  if (!couple) return;
  const sources = JSON.parse(couple.sources) as Couple['sources'];
  if (event.source_url && !sources.some((s) => s.url === event.source_url)) {
    sources.unshift({ label: event.source_label ?? event.source_url, url: event.source_url });
  }
  const status = event.proposed_status ?? couple.status;
  const headline = event.proposed_status
    ? `${event.title}${event.detail ? ` — ${event.detail}` : ''}`
    : couple.headline;
  db.prepare(
    'UPDATE couples SET status = ?, headline = ?, sources = ?, last_verified = ? WHERE id = ?',
  ).run(status, headline, JSON.stringify(sources.slice(0, 8)), now().slice(0, 10), couple.id);
}
