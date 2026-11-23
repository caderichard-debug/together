import type { RelationshipStatus } from '../../../src/data/types';
import type { FoundEvent } from '../ai/newsResearch';
import type { EventReview } from '../db';

export interface Thresholds {
  autoPublishConfidence: number;
  statusChangeConfidence: number;
}

export interface Decision {
  review: EventReview | 'skip';
  /** Status to apply when published; null = no status change. */
  proposedStatus: RelationshipStatus | null;
  reason: string;
}

const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

/**
 * Decides what happens to an AI-found news event.
 *
 * - Events must have a source URL and a sane date.
 * - Anything that changes a couple's status needs a confirmed report and high
 *   confidence; otherwise it goes to the review queue. A wrong "they split!"
 *   is the worst thing this app can show.
 * - Rumors are published (labelled as rumors) but never change status.
 */
export function decideEvent(
  event: FoundEvent,
  currentStatus: RelationshipStatus,
  today: string,
  t: Thresholds,
): Decision {
  if (!/^https?:\/\//.test(event.source_url)) {
    return { review: 'skip', proposedStatus: null, reason: 'no source URL' };
  }
  if (!DATE_RE.test(event.date) || event.date.slice(0, 10) > today) {
    return { review: 'skip', proposedStatus: null, reason: `bad date ${event.date}` };
  }
  const confidence = clamp01(event.confidence);

  if (event.kind === 'rumor') {
    return confidence >= 0.3
      ? { review: 'published', proposedStatus: null, reason: 'rumor (no status change)' }
      : { review: 'skip', proposedStatus: null, reason: 'rumor too weak' };
  }

  const changesStatus = event.implies_status !== null && event.implies_status !== currentStatus;
  if (changesStatus) {
    const ok = event.confirmed && confidence >= t.statusChangeConfidence;
    return {
      review: ok ? 'published' : 'pending',
      proposedStatus: event.implies_status,
      reason: ok ? 'confirmed status change' : 'status change needs review',
    };
  }

  return confidence >= t.autoPublishConfidence
    ? { review: 'published', proposedStatus: null, reason: 'confident' }
    : { review: 'pending', proposedStatus: null, reason: 'low confidence' };
}

export function clamp01(n: number): number {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
}
