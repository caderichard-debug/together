import type { RelationshipStatus } from '../data/types';

export const colors = {
  background: '#FFF6F2',
  surface: '#FFFFFF',
  text: '#2A1B21',
  textMuted: '#7A6870',
  border: '#F1DCD6',
  brand: '#E8436B',
  brandSoft: '#FDE3EA',
  sunset: '#FF8A5B',
};

export const statusMeta: Record<
  RelationshipStatus,
  { label: string; emoji: string; color: string; background: string }
> = {
  together: { label: 'Together', emoji: '❤️', color: '#B4204A', background: '#FDE3EA' },
  engaged: { label: 'Engaged', emoji: '💍', color: '#7A4B00', background: '#FFF0C9' },
  married: { label: 'Married', emoji: '💒', color: '#5B2A86', background: '#EFE3FB' },
  complicated: { label: "It's complicated", emoji: '🤔', color: '#6B5A00', background: '#FAF3C8' },
  split: { label: 'Split', emoji: '💔', color: '#4F5965', background: '#E9ECEF' },
};

export function placementLabel(placement?: number): string | undefined {
  if (!placement) return undefined;
  if (placement === 1) return '🏆 Winners';
  const suffix = placement === 2 ? 'nd' : placement === 3 ? 'rd' : 'th';
  return `${placement}${suffix} place`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats YYYY, YYYY-MM or YYYY-MM-DD without timezone surprises. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!m) return String(y);
  if (!d) return `${MONTHS[m - 1]} ${y}`;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
