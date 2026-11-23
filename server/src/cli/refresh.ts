// One-off refresh, for cron or manual runs: `npm run refresh [-- <couple-id>]`
import { config } from '../config';
import { openDb } from '../db';
import { realDeps } from '../pipeline/deps';
import { runRefresh } from '../pipeline/refresh';
import { syncSeed } from '../seed';

const db = openDb(config.databasePath);
syncSeed(db);
const summary = await runRefresh(db, realDeps(), process.argv[2]);
console.log(JSON.stringify(summary, null, 2));
