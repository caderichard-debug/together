import { loveIslandUsaS6 } from './loveIslandUsaS6';
import { loveIslandUsaS7 } from './loveIslandUsaS7';
import type { Couple, Islander, Season } from './types';

export * from './types';

/** Bundled seed data, newest season first. The app shows this until the server responds. */
export const seedSeasons: Season[] = [loveIslandUsaS7, loveIslandUsaS6];

export function findCouple(
  seasons: Season[],
  coupleId: string,
): { season: Season; couple: Couple } | undefined {
  for (const season of seasons) {
    const couple = season.couples.find((c) => c.id === coupleId);
    if (couple) return { season, couple };
  }
  return undefined;
}

export function coupleIslanders(season: Season, couple: Couple): [Islander, Islander] {
  const byId = (id: string) => season.islanders.find((i) => i.id === id) ?? { id, name: id };
  return [byId(couple.islanderIds[0]), byId(couple.islanderIds[1])];
}

export function coupleName(season: Season, couple: Couple): string {
  const [a, b] = coupleIslanders(season, couple);
  return `${firstName(a.name)} & ${firstName(b.name)}`;
}

export function firstName(name: string): string {
  return name.split(' ')[0];
}

/** Statuses that count as "still together" for the season score. */
export const STILL_ON: Couple['status'][] = ['together', 'engaged', 'married', 'complicated'];
