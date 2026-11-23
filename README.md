# Together

A reality TV relationship status tracker. Are they still together? 💔❤️

Covers **Love Island USA Seasons 6 and 7**. An Expo (React Native) app shows each couple's status, a relationship timeline and sources. A small Node server keeps the timelines up to date with Claude: it researches news, and it can watch the cast's Instagram for tells like deleted couple photos.

```
┌────────────┐   GET /api/seasons   ┌──────────────────────────────────────────┐
│  Expo app  │ ───────────────────▶ │  server/  (Hono + SQLite)                │
│ (iOS/And/  │                      │   every 12h:                             │
│   web)     │ ◀── bundled seed     │    • Claude + web search → news events   │
└────────────┘     data if offline  │    • Instagram posts → Claude vision     │
                                    │      → deleted-photo & sentiment signals │
                                    └──────────────────────────────────────────┘
```

## App

```bash
npm install
npx expo start                 # press i / a / w, or scan the QR code with Expo Go
EXPO_PUBLIC_API_URL=http://localhost:8787 npx expo start   # use live server data
```

Without `EXPO_PUBLIC_API_URL` the app runs on its bundled seed data. With it, the app loads live data, caches it for offline use, and supports pull-to-refresh.

- A season picker, and a "still together" score per season
- Filters: All, Together, Split, Following (☆ follow, saved on the device)
- Couple screen: status, timeline with **AI** and **RUMOR** tags and a per-event source, a **👀 Rumor mill** for social signals, and sources

`npm run typecheck` · `npm run lint`

## Server

```bash
cd server
npm install
ANTHROPIC_API_KEY=sk-ant-... npm run dev       # API on :8787, refreshes every 12h
npm run refresh                                # one-off refresh of every couple
npm run refresh -- serena-kordell              # just one couple
npm test
```

On first boot the server loads the app's seed data (`src/data/`) into SQLite. From then on, the database is the source of truth.

### How timelines update

**News (Claude + web search).** For each couple, Claude searches the web (`web_search` server tool) for news since the last check. It reports only events missing from the timeline, through a strict `report_findings` tool, and each event must carry a source URL. Then `src/pipeline/rules.ts` decides what happens to each event:

| Event | What happens |
|---|---|
| Changes status (split, engaged, back together…) | Published only if **confirmed** (by the couple, or by 2+ reputable outlets) **and** confidence ≥ 0.9. Otherwise it goes to the review queue. |
| Other news | Published if confidence ≥ 0.8, otherwise queued |
| Rumor | Published with a RUMOR tag (confidence ≥ 0.3). Never changes status. |
| No URL, or a future or garbled date | Dropped |

A wrong "they split!" is the worst thing this app can show, so status changes are deliberately conservative. Tune the thresholds with `AUTO_PUBLISH_CONFIDENCE` and `STATUS_CHANGE_CONFIDENCE`.

**Social (Instagram + Claude vision).** For each islander with an `instagram` handle, the server:
1. fetches recent posts
2. sends each **new** post to Claude, with the image, the caption and the partner's profile photo as a reference, and records whether it features the partner, plus a sentiment score. Analysis happens when a post is first seen, because a deleted post's image is gone.
3. diffs against the last fetch to find deleted posts. Posts that simply scrolled out of the fetch window don't count.
4. raises signals: *"Leah deleted 2 posts featuring Miguel"*, or a run of negative captions.

Signals appear in the app's Rumor mill. **They never change a couple's status on their own.**

### Instagram access

`SOCIAL_PROVIDER=instagram` uses the official Graph API **business discovery** endpoint. It needs:
- your own Instagram professional account, linked to a Meta app
- a long-lived token (`IG_USER_ID`, `IG_ACCESS_TOKEN`)

It can read public **Business/Creator** accounts only (most reality TV cast use one). Personal accounts can't be read, and the server deliberately doesn't scrape. Instagram's terms forbid scraping, and a scraper breaks constantly.

Add handles in the seed data (`instagram: 'handle'` on an islander) or directly in the `islanders` table. None are set yet; check each one yourself before adding it.

For development, `SOCIAL_PROVIDER=fixture` reads `fixtures/instagram/<handle>.json`. Delete a post from the file between refreshes to see the deletion detector fire.

### Admin API

Set `ADMIN_TOKEN`, then send `Authorization: Bearer <token>` with each request:

| | |
|---|---|
| `GET /admin/pending` | events waiting for review |
| `POST /admin/events/:id/approve` · `/reject` | approve publishes it, applying any status change |
| `POST /admin/refresh[?couple=id]` | run a refresh now |
| `GET /admin/runs` | recent refresh summaries |

### Environment

| Variable | Default | |
|---|---|---|
| `ANTHROPIC_API_KEY` | – | Required for news research and post analysis. Without it the server only serves data. |
| `CLAUDE_MODEL` | `claude-opus-5-5` | |
| `PORT` | `8787` | |
| `DATABASE_PATH` | `together.db` | |
| `REFRESH_HOURS` | `12` | `0` turns off the built-in scheduler (use cron + `npm run refresh`) |
| `ADMIN_TOKEN` | – | Admin routes are disabled when unset |
| `AUTO_PUBLISH_CONFIDENCE` / `STATUS_CHANGE_CONFIDENCE` | `0.8` / `0.9` | |
| `SOCIAL_PROVIDER` | `none` | `instagram`, `fixture` or `none` |
| `IG_USER_ID`, `IG_ACCESS_TOKEN`, `IG_GRAPH_VERSION`, `IG_MEDIA_LIMIT` | – / – / `v23.0` / `50` | |

Claude calls opt into server-side refusal fallbacks (`fallbacks: "default"`).

## Project layout

```
src/                      Expo app
  app/                    Expo Router screens (index = seasons, couple/[id])
  components/  lib/       UI pieces, data + favorites providers, theme
  data/                   Types and hand-checked seed data (shared with the server)
server/src/
  ai/                     Claude: news research (web search), post analysis (vision)
  social/                 Instagram + fixture providers, deletion/sentiment detection
  pipeline/               refresh orchestration and publish rules
  api.ts  db.ts  seed.ts  HTTP API, SQLite schema, seed sync
```

## Updating seed data

Correct the baseline in `src/data/loveIslandUsaS*.ts`. To add a season, create a file next to them and add it to `seedSeasons` in `src/data/index.ts`; the server picks it up on its next start.
