export type RelationshipStatus = 'together' | 'engaged' | 'married' | 'split' | 'complicated';

export interface Islander {
  id: string;
  name: string;
  /** Short note shown under the name, e.g. "OG Islander" or "Bombshell". */
  role?: string;
  /** Instagram username (no @). Only set for public accounts; enables social monitoring on the server. */
  instagram?: string;
}

/** Where a timeline event came from. */
export type EventOrigin = 'editorial' | 'ai-news' | 'ai-social';

export interface TimelineEvent {
  /** ISO date. Use YYYY-MM-DD when the day is known, YYYY-MM when only the month is, YYYY for the year. */
  date: string;
  title: string;
  detail?: string;
  kind?: 'villa' | 'milestone' | 'split' | 'update' | 'rumor';
  /** Defaults to 'editorial' (hand-written seed data). */
  origin?: EventOrigin;
  /** 0–1, set on AI-generated events. */
  confidence?: number;
  sourceUrl?: string;
  sourceLabel?: string;
}

export interface Source {
  label: string;
  url: string;
}

/** A soft signal from social media. Signals never change a couple's status on their own. */
export interface Signal {
  date: string;
  type: 'deleted_posts' | 'sentiment' | 'posting_gap';
  summary: string;
  /** How strongly this hints at trouble, 0–1. */
  severity: number;
}

export interface Couple {
  id: string;
  islanderIds: [string, string];
  status: RelationshipStatus;
  /** One-line summary of where things stand. */
  headline: string;
  /** Finale placement, 1 = winners. Omit for couples who didn't make the final. */
  finalePlacement?: number;
  timeline: TimelineEvent[];
  sources: Source[];
  /** ISO date the status was last checked against reporting. */
  lastVerified: string;
  /** Filled in by the server. */
  signals?: Signal[];
}

export interface Season {
  id: string;
  showName: string;
  seasonNumber: number;
  network: string;
  /** e.g. "Jun – Jul 2024" */
  airDates: string;
  location: string;
  islanders: Islander[];
  couples: Couple[];
}
