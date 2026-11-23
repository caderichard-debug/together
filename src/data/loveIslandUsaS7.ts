import type { Season } from './types';

/**
 * Love Island USA, Season 7 (2025) — the four finalist couples.
 *
 * Hand-checked seed data (2026-11-22). Split dates for Huda & Chris and
 * Iris & Pepe weren't confirmed, so their timelines only give the year;
 * the server's news research fills in detail as it finds it.
 */
export const loveIslandUsaS7: Season = {
  id: 'love-island-usa-7',
  showName: 'Love Island USA',
  seasonNumber: 7,
  network: 'Peacock',
  airDates: 'Jun – Jul 2025',
  location: 'Fiji',
  islanders: [
    { id: 'amaya', name: 'Amaya Espinal' },
    { id: 'bryan', name: 'Bryan Arenales' },
    { id: 'olandria', name: 'Olandria Carthen' },
    { id: 'nic', name: 'Nic Vansteenberghe' },
    { id: 'huda', name: 'Huda Mustafa' },
    { id: 'chris', name: 'Chris Seeley' },
    { id: 'iris', name: 'Iris Kendall' },
    { id: 'pepe', name: 'Pepe Garcia' },
  ],
  couples: [
    {
      id: 'amaya-bryan',
      islanderIds: ['amaya', 'bryan'],
      status: 'split',
      finalePlacement: 1,
      headline: 'Won the season, split about a month later.',
      lastVerified: '2026-11-22',
      timeline: [
        { date: '2025-06', title: 'Coupled up in the villa', kind: 'villa' },
        { date: '2025-07-13', title: 'Won Love Island USA Season 7', kind: 'milestone' },
        { date: '2025-08', title: 'Broke up', detail: 'Cited different visions for the future.', kind: 'split' },
      ],
      sources: [
        {
          label: 'TV Insider — which Season 7 couples are still together',
          url: 'https://www.tvinsider.com/swooon/gallery/love-island-usa-season-7-couples-still-together-relationship-updates/',
        },
      ],
    },
    {
      id: 'olandria-nic',
      islanderIds: ['olandria', 'nic'],
      status: 'split',
      finalePlacement: 2,
      headline: 'Fan favorites split a year after the villa; still close friends.',
      lastVerified: '2026-11-22',
      timeline: [
        { date: '2025-06', title: 'Coupled up in the villa', kind: 'villa' },
        { date: '2025-07-13', title: 'Runners-up in the finale', kind: 'milestone' },
        {
          date: '2026-07-22',
          title: 'Broke up',
          detail: 'Distance and busy schedules were reported as the reason.',
          kind: 'split',
        },
        { date: '2026-07', title: 'Nic confirmed: "The rumors are true"', kind: 'update' },
      ],
      sources: [
        {
          label: 'TMZ — Olandria and Nic break up (Jul 2026)',
          url: 'https://www.tmz.com/2026/07/22/love-island-olandria-carthen-nic-vansteenberghe-break-up/',
        },
        {
          label: 'theGrio — Nic’s split statement',
          url: 'https://thegrio.com/2026/07/27/nic-vansteenberghe-olandria-carthen-split-statement/',
        },
      ],
    },
    {
      id: 'huda-chris',
      islanderIds: ['huda', 'chris'],
      status: 'split',
      finalePlacement: 3,
      headline: 'No longer together.',
      lastVerified: '2026-11-22',
      timeline: [
        { date: '2025-06', title: 'Coupled up in the villa', kind: 'villa' },
        { date: '2025-07-13', title: 'Finished third in the finale', kind: 'milestone' },
        { date: '2025', title: 'Broke up', kind: 'split' },
      ],
      sources: [
        {
          label: 'TV Insider — which Season 7 couples are still together',
          url: 'https://www.tvinsider.com/swooon/gallery/love-island-usa-season-7-couples-still-together-relationship-updates/',
        },
      ],
    },
    {
      id: 'iris-pepe',
      islanderIds: ['iris', 'pepe'],
      status: 'split',
      finalePlacement: 4,
      headline: 'Went their separate ways after the show.',
      lastVerified: '2026-11-22',
      timeline: [
        { date: '2025-06', title: 'Coupled up in the villa', kind: 'villa' },
        { date: '2025-07-13', title: 'Finished fourth in the finale', kind: 'milestone' },
        { date: '2025', title: 'Broke up', kind: 'split' },
      ],
      sources: [
        {
          label: 'L’Officiel — Season 7 couples: where are they now',
          url: 'https://www.lofficielusa.com/pop-culture/love-island-usa-season-7-couples-where-are-they-now-olandria-carthen-nic-vansteenberghe-chelley-ace-iris-tj-breakups-pr-relationships',
        },
      ],
    },
  ],
};
