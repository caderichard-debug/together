import type { Season } from './types';

/**
 * Love Island USA, Season 6 (2024).
 *
 * Hand-checked seed data (2026-11-22). The server keeps timelines current
 * after this; edit here only to correct the baseline.
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
    { id: 'nicole', name: 'Nicole Jacky' },
    { id: 'kendall', name: 'Kendall Washington' },
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
          detail: 'Split the $100,000 prize.',
          kind: 'milestone',
        },
        { date: '2024-08', title: 'Confirmed relationship at the reunion', kind: 'milestone' },
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
        { date: '2025', title: 'Moved in together', detail: 'Living together in California.', kind: 'milestone' },
        { date: '2026-02', title: 'Grammys red carpet together', kind: 'update' },
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
        { date: '2025-07', title: 'Starred in Love Island: Beyond the Villa', kind: 'milestone' },
        { date: '2025-07-27', title: 'Broke up', detail: 'Reports differ on who ended things.', kind: 'split' },
        { date: '2025-07-29', title: 'Both confirmed the split publicly', kind: 'update' },
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
      id: 'nicole-kendall',
      islanderIds: ['nicole', 'kendall'],
      status: 'split',
      finalePlacement: 4,
      headline: 'Broke up days after a tense reunion.',
      lastVerified: '2026-11-22',
      timeline: [
        { date: '2024-06', title: 'Coupled up in the villa', kind: 'villa' },
        { date: '2024-07-21', title: 'Finished fourth in the finale', kind: 'milestone' },
        {
          date: '2024-08',
          title: 'Broke up after the reunion',
          detail: 'Nicole said Kendall ended things days after the reunion aired.',
          kind: 'split',
        },
      ],
      sources: [
        {
          label: 'Marie Claire — what happened with Kendall and Nicole',
          url: 'https://www.marieclaire.com/culture/tv-shows/are-nicole-jacky-kendall-washington-love-island-usa-still-together',
        },
      ],
    },
    {
      id: 'kaylor-aaron',
      islanderIds: ['kaylor', 'aaron'],
      status: 'split',
      headline: 'Left the villa together just before the finale, done by the reunion.',
      lastVerified: '2026-11-22',
      timeline: [
        { date: '2024-06', title: 'Coupled up in the villa', kind: 'villa' },
        { date: '2024-07', title: 'Dumped from the villa before the finale', kind: 'villa' },
        {
          date: '2024-08',
          title: 'Broke up',
          detail: 'Kaylor confirmed they were "done" before the reunion was filmed.',
          kind: 'split',
        },
      ],
      sources: [
        {
          label: 'TV Insider — Kaylor confirms Aaron split before reunion',
          url: 'https://tvinsider.com/1148088/love-island-usa-kaylor-aaron-split-reunion-reaction',
        },
        {
          label: 'Marie Claire — are Kaylor and Aaron still dating?',
          url: 'https://www.marieclaire.com/culture/tv-shows/are-kaylor-martin-aaron-evans-love-island-usa-still-together',
        },
      ],
    },
  ],
};
