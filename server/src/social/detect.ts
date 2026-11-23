import type { SocialPost } from './provider';

export interface KnownPost {
  id: string;
  postedAt: string;
  featuresPartner: boolean;
  partnerConfidence: number;
  deleted: boolean;
}

/**
 * Finds posts that were visible before and are gone now.
 *
 * The API only returns the newest N posts, so a post that scrolled past the
 * window is not a deletion. Only posts newer than the oldest post in the
 * current fetch can be judged.
 */
export function findDeletedPosts(known: KnownPost[], current: SocialPost[], fetchLimit: number): KnownPost[] {
  if (current.length === 0) return []; // empty fetch = API hiccup or wiped account; don't guess
  const currentIds = new Set(current.map((p) => p.id));
  const oldestVisible = current.reduce((min, p) => (p.postedAt < min ? p.postedAt : min), current[0].postedAt);
  const windowIsFull = current.length >= fetchLimit;

  return known.filter(
    (p) => !p.deleted && !currentIds.has(p.id) && (!windowIsFull || p.postedAt >= oldestVisible),
  );
}

export interface DeletionSignal {
  summary: string;
  severity: number;
}

/**
 * Turns deletions into a signal. Deleting posts that feature the partner is
 * the classic tell; deleting unrelated posts means little.
 */
export function deletionSignal(
  ownerFirstName: string,
  partnerFirstName: string,
  deleted: KnownPost[],
  minPartnerConfidence = 0.6,
): DeletionSignal | null {
  const withPartner = deleted.filter((p) => p.featuresPartner && p.partnerConfidence >= minPartnerConfidence);
  if (withPartner.length === 0) return null;
  const n = withPartner.length;
  const severity = Math.min(1, 0.35 + 0.15 * n);
  return {
    summary: `${ownerFirstName} deleted ${n} post${n === 1 ? '' : 's'} featuring ${partnerFirstName}`,
    severity,
  };
}

/** Average relationship sentiment across recent analyzed posts, or null if none say anything. */
export function sentimentSignal(
  ownerFirstName: string,
  sentiments: (number | null)[],
): DeletionSignal | null {
  const values = sentiments.filter((s): s is number => s !== null);
  if (values.length < 2) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg > -0.25) return null;
  return {
    summary: `${ownerFirstName}'s recent posts read negatively about the relationship`,
    severity: Math.min(1, Math.abs(avg)),
  };
}
