import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Couple, Islander, Season, Signal, TimelineEvent } from '../../src/data/types';
import { config } from './config';
import { applyPublishedEvent, type Db, type EventRow, listEvents } from './db';
import type { RefreshSummary } from './pipeline/refresh';

function toTimelineEvent(e: EventRow): TimelineEvent {
  return {
    date: e.date,
    title: e.title,
    detail: e.detail ?? undefined,
    kind: e.kind,
    origin: e.origin,
    confidence: e.confidence ?? undefined,
    sourceUrl: e.source_url ?? undefined,
    sourceLabel: e.source_label ?? undefined,
  };
}

export function loadSeasons(db: Db): Season[] {
  const seasons = db.prepare('SELECT id, meta FROM seasons ORDER BY sort_order').all() as { id: string; meta: string }[];
  return seasons.map(({ id, meta }) => {
    const islanders = (
      db.prepare('SELECT id, name, role FROM islanders WHERE season_id = ?').all(id) as {
        id: string;
        name: string;
        role: string | null;
      }[]
    ).map((i): Islander => ({ id: i.id, name: i.name, role: i.role ?? undefined }));

    const couples = (
      db.prepare('SELECT * FROM couples WHERE season_id = ?').all(id) as {
        id: string;
        islander_a: string;
        islander_b: string;
        status: Couple['status'];
        headline: string;
        finale_placement: number | null;
        sources: string;
        last_verified: string;
      }[]
    ).map(
      (c): Couple => ({
        id: c.id,
        islanderIds: [c.islander_a, c.islander_b],
        status: c.status,
        headline: c.headline,
        finalePlacement: c.finale_placement ?? undefined,
        sources: JSON.parse(c.sources),
        lastVerified: c.last_verified,
        timeline: listEvents(db, c.id).map(toTimelineEvent),
        signals: db
          .prepare('SELECT date, type, summary, severity FROM signals WHERE couple_id = ? ORDER BY date DESC LIMIT 10')
          .all(c.id) as unknown as Signal[],
      }),
    );
    return { id, ...(JSON.parse(meta) as Omit<Season, 'id' | 'islanders' | 'couples'>), islanders, couples };
  });
}

export function createApi(db: Db, refresh: (coupleId?: string) => Promise<RefreshSummary>) {
  const app = new Hono();
  app.use('/api/*', cors());

  app.get('/health', (c) => c.json({ ok: true }));

  app.get('/api/seasons', (c) => {
    c.header('Cache-Control', 'public, max-age=300');
    return c.json({ seasons: loadSeasons(db), generatedAt: new Date().toISOString() });
  });

  // ---- Admin: review queue and manual refresh. Disabled unless ADMIN_TOKEN is set.
  app.use('/admin/*', async (c, next) => {
    if (!config.adminToken || c.req.header('authorization') !== `Bearer ${config.adminToken}`) {
      return c.json({ error: 'unauthorized' }, 401);
    }
    await next();
  });

  app.get('/admin/pending', (c) =>
    c.json({ pending: db.prepare("SELECT * FROM events WHERE review = 'pending' ORDER BY created_at DESC").all() }),
  );

  app.post('/admin/events/:id/:action{approve|reject}', (c) => {
    const id = Number(c.req.param('id'));
    const action = c.req.param('action');
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as unknown as EventRow | undefined;
    if (!event) return c.json({ error: 'not found' }, 404);
    if (event.review !== 'pending') return c.json({ error: `already ${event.review}` }, 409);

    const review = action === 'approve' ? 'published' : 'rejected';
    db.prepare('UPDATE events SET review = ? WHERE id = ?').run(review, id);
    if (review === 'published') applyPublishedEvent(db, { ...event, review });
    return c.json({ id, review });
  });

  app.get('/admin/runs', (c) => c.json({ runs: db.prepare('SELECT * FROM runs ORDER BY id DESC LIMIT 20').all() }));

  app.post('/admin/refresh', async (c) => {
    const coupleId = c.req.query('couple') ?? undefined;
    return c.json(await refresh(coupleId));
  });

  return app;
}
