import { serve } from '@hono/node-server';
import { createApi } from './api';
import { config } from './config';
import { openDb } from './db';
import { realDeps } from './pipeline/deps';
import { runRefresh } from './pipeline/refresh';
import { syncSeed } from './seed';

const db = openDb(config.databasePath);
syncSeed(db);

let running: Promise<unknown> | null = null;
/** One refresh at a time; a second request waits for the current one. */
async function refresh(coupleId?: string) {
  while (running) await running;
  const job = runRefresh(db, realDeps(), coupleId);
  running = job;
  try {
    return await job;
  } finally {
    running = null;
  }
}

serve({ fetch: createApi(db, refresh).fetch, port: config.port }, ({ port }) => {
  console.log(`[together] API on http://localhost:${port}`);
});

if (config.refreshHours > 0) {
  const every = config.refreshHours * 3600_000;
  setInterval(() => {
    refresh()
      .then((s) => console.log('[together] scheduled refresh', s))
      .catch((err) => console.error('[together] refresh failed', err));
  }, every).unref();
  console.log(`[together] auto-refresh every ${config.refreshHours}h`);
}
