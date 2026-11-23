function num(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  port: num('PORT', 8787),
  databasePath: process.env.DATABASE_PATH ?? 'together.db',
  /** Protects /admin routes. Admin routes are disabled when unset. */
  adminToken: process.env.ADMIN_TOKEN,
  /** Hours between automatic refreshes. 0 disables the in-process scheduler. */
  refreshHours: num('REFRESH_HOURS', 12),

  /** Claude model used for news research and post analysis. */
  model: process.env.CLAUDE_MODEL ?? 'claude-opus-5-5',

  /**
   * AI events at or above this confidence are published straight to the timeline.
   * Below it they wait in /admin/pending for review.
   */
  autoPublishConfidence: num('AUTO_PUBLISH_CONFIDENCE', 0.8),
  /** A status change (e.g. together → split) needs this confidence, and a confirmed source. */
  statusChangeConfidence: num('STATUS_CHANGE_CONFIDENCE', 0.9),

  social: {
    /** 'instagram' (Graph API business discovery), 'fixture' (local JSON for dev) or 'none'. */
    provider: (process.env.SOCIAL_PROVIDER ?? 'none') as 'instagram' | 'fixture' | 'none',
    fixtureDir: process.env.SOCIAL_FIXTURE_DIR ?? 'fixtures/instagram',
    instagram: {
      /** Your own Instagram professional account ID that makes business-discovery calls. */
      igUserId: process.env.IG_USER_ID,
      accessToken: process.env.IG_ACCESS_TOKEN,
      graphVersion: process.env.IG_GRAPH_VERSION ?? 'v23.0',
      mediaLimit: num('IG_MEDIA_LIMIT', 50),
    },
  },
};
