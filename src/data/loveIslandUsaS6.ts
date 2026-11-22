import type { Season } from './types';

/**
 * Love Island USA, Season 6 (2024) — the four finalist couples.
 *
 * Statuses were checked against news coverage on 2026-11-22. Reality TV
 * relationships change fast, so every couple carries `lastVerified` and the
 * sources used. Update both when a status changes.
 */
export const loveIslandUsaS6: Season = {
  id: 'love-island-usa-6',
  showName: 'Love Island USA',
  seasonNumber: 6,
  network: 'Peacock',
  airDates: 'Jun – Jul 2024',
  location: 'Fiji',
  islanders: [
    { id: 'serena', name: 'Serena Page' },
    { id: 'kordell', name: 'Kordell Beckham' },
    { id: 'leah', name: 'Leah Kateb' },
    { id: 'miguel', name: 'Miguel Harichi' },
    { id: 'jana', name: 'JaNa Craig' },
    { id: 'kenny', name: 'Kenny Rodriguez' },
    { id: 'kaylor', name: 'Kaylor Martin' },
    { id: 'aaron', name: 'Aaron Evans' },
  ],
  couples: [
    {
      id: 'serena-kordell',
      islanderIds: ['serena', 'kordell'],
      status: 'together',
      finalePlacement: 1,
      headline: 'Season winners, still going strong two years on.',
      lastVerified: '2026-11-22',
      timeline: [
        { date: '2024-06', title: 'Coupled up in the villa', kind: 'villa' },
        {
          date: '2024-07-21',
          title: 'Won Love Island USA Season 6',
          detail: 'Took home the $100,000 prize.',
          kind: 'milestone',
        },
        {
          date: '2024-08',
          title: 'Confirmed relationship at the reunion',
          kind: 'milestone',
        },
        {
          date: '2026-01',
          title: 'Marriage talk',
          detail: 'Serena said a wedding will happen "when he gets on one knee".',
          kind: 'update',
        },
        {
          date: '2026-08',
          title: 'Shut down engagement rumors',
          detail: 'Took a trip to Italy together, choosing travel over wedding planning for now.',
          kind: 'update',
        },
      ],
      sources: [
        {
          label: 'theGrio — engagement rumors & Italy trip (Aug 2026)',
          url: 'https://thegrio.com/2026/08/07/serena-page-kordell-beckham-engagement-italy-trip/',
        },
        {
          label: 'The Tab — two years after Love Island USA (Jun 2026)',
          url: 'https://thetab.com/realityshrine/2026/06/10/inside-serena-and-kordells-wholesome-relationship-two-years-after-love-island-usa/',
        },
      ],
    },
    {
      id: 'leah-miguel',
      islanderIds: ['leah', 'miguel'],
      status: 'together',
      finalePlacement: 2,
      headline: 'Made it official at the reunion and now live together in California.',
      lastVerified: '2026-11-22',
      timeline: [
        { date: '2024-06', title: 'Coupled up in the villa', kind: 'villa' },
        { date: '2024-07-21', title: 'Runners-up in the finale', kind: 'milestone' },
        {
          date: '2024-08',
          title: 'Made it official at the reunion',
          detail: 'Announced they were officially in a relationship.',
          kind: 'milestone',
        },
        {
          date: '2025',
          title: 'Moved in together',
          detail: 'Living together in California.',
          kind: 'milestone',
        },
        {
          date: '2026-02',
          title: 'Grammys red carpet together',
          kind: 'update',
        },
      ],
      sources: [
        {
          label: 'TV Insider — living together & wedding update',
          url: 'https://www.tvinsider.com/swooon/1282361/leah-kateb-miguel-harichi-living-together-wedding-update-love-island-usa/',
        },
        {
          label: 'USA Network — Leah & Miguel dating',
          url: 'https://usanetwork.com/usa-insider/love-island-usa-leah-kateb-miguel-harichi-dating',
        },
      ],
    },
    {
      id: 'jana-kenny',
      islanderIds: ['jana', 'kenny'],
      status: 'split',
      finalePlacement: 3,
      headline: 'Split in July 2025, weeks after their spinoff Beyond the Villa debuted.',
      lastVerified: '2026-11-22',
      timeline: [
        { date: '2024-06', title: 'Coupled up in the villa', kind: 'villa' },
        { date: '2024-07-21', title: 'Finished third in the finale', kind: 'milestone' },
        {
          date: '2025-07',
          title: 'Starred in Love Island: Beyond the Villa',
          kind: 'milestone',
        },
        {
          date: '2025-07-27',
          title: 'Broke up',
          detail: 'Reports differ on who ended things.',
          kind: 'split',
        },
        {
          date: '2025-07-29',
          title: 'Both confirmed the split publicly',
          kind: 'update',
        },
      ],
      sources: [
        {
          label: 'NBC News — JaNa & Kenny speak out after split',
          url: 'https://www.nbcnews.com/pop-culture/pop-culture-news/love-island-usa-stars-jana-craig-kenny-rodriguez-speak-split-rcna221897',
        },
        {
          label: 'The Daily Beast — split weeks after Beyond the Villa',
          url: 'https://www.thedailybeast.com/love-island-usa-couple-jana-craig-and-kenny-rodriguez-split-weeks-after-debuting-new-show-beyond-the-villa',
        },
      ],
    },
    {
      id: 'kaylor-aaron',
      islanderIds: ['kaylor', 'aaron'],
      status: 'split',
      finalePlacement: 4,
      headline: 'Split within weeks of leaving the villa.',
      lastVerified: '2026-11-22',
      timeline: [
        { date: '2024-06', title: 'Coupled up in the villa', kind: 'villa' },
        { date: '2024-07-21', title: 'Finished fourth in the finale', kind: 'milestone' },
        {
          date: '2024-08',
          title: 'Broke up',
          kind: 'split',
        },
      ],
      sources: [
        {
          label: 'TV Insider — which Season 6 couples are still together',
          url: 'https://tvinsider.com/gallery/love-island-usa-couples-still-together',
        },
      ],
    },
  ],
};
