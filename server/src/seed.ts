import { seedSeasons } from '../../src/data/index';
import { type Db, dedupeKey, insertEvent } from './db';

/**
 * Loads the app's bundled seed data into the database.
 *
 * Idempotent: seasons and islanders are upserted, couples are inserted once
 * (so server-side status changes survive restarts), and editorial events are
 * de-duplicated by key.
 */
export function syncSeed(db: Db): void {
  seedSeasons.forEach((season, index) => {
    const { islanders, couples, ...meta } = season;
    db.prepare(
      `INSERT INTO seasons (id, sort_order, meta) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, meta = excluded.meta`,
    ).run(season.id, index, JSON.stringify(meta));

    for (const i of islanders) {
      db.prepare(
        `INSERT INTO islanders (id, season_id, name, role, instagram) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(season_id, id) DO UPDATE SET name = excluded.name, role = excluded.role,
           instagram = COALESCE(excluded.instagram, islanders.instagram)`,
      ).run(i.id, season.id, i.name, i.role ?? null, i.instagram ?? null);
    }

    for (const c of couples) {
      db.prepare(
        `INSERT OR IGNORE INTO couples
          (id, season_id, islander_a, islander_b, status, headline, finale_placement, sources, last_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        c.id,
        season.id,
        c.islanderIds[0],
        c.islanderIds[1],
        c.status,
        c.headline,
        c.finalePlacement ?? null,
        JSON.stringify(c.sources),
        c.lastVerified,
      );
      for (const e of c.timeline) {
        insertEvent(db, {
          couple_id: c.id,
          date: e.date,
          title: e.title,
          detail: e.detail ?? null,
          kind: e.kind ?? 'update',
          origin: 'editorial',
          confidence: null,
          source_url: e.sourceUrl ?? null,
          source_label: e.sourceLabel ?? null,
          proposed_status: null,
          review: 'published',
          dedupe_key: `seed|${dedupeKey(e.date, e.title)}`,
        });
      }
    }
  });
}
