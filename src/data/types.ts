export type RelationshipStatus = 'together' | 'engaged' | 'married' | 'split' | 'complicated';

export interface Islander {
  id: string;
  name: string;
  /** Short note shown under the name, e.g. "OG Islander" or "Bombshell". */
  role?: string;
}

export interface TimelineEvent {
  /** ISO date. Use YYYY-MM-DD when the day is known, YYYY-MM when only the month is. */
  date: string;
  title: string;
  detail?: string;
  /** Marks an event that changed the couple's status. */
  kind?: 'villa' | 'milestone' | 'split' | 'update';
}

export interface Source {
  label: string;
  url: string;
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
