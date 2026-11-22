# Together

A reality TV relationship status tracker. Are they still together? 💔❤️

Starts with **Love Island USA Season 6**: the four finalist couples, their current status, a timeline of their relationship, and the news sources behind it.

Built with Expo (React Native) and Expo Router, so it runs on iOS, Android and web.

## Run it

```bash
npm install
npx expo start          # then press i / a / w, or scan the QR code with Expo Go
```

```bash
npm run typecheck
npx expo export --platform web   # static web build in dist/
```

## Features

- Season overview with a "still together" score
- Filter couples: All, Together, Split, Following
- Follow (☆) couples; saved on the device with AsyncStorage
- Couple detail: status, finale placement, relationship timeline, sources and the date the status was last checked

## Project layout

```
src/
  app/                 Expo Router screens
    _layout.tsx        Stack navigator and providers
    index.tsx          Season screen (couple list)
    couple/[id].tsx    Couple detail
  components/          CoupleCard, StatusBadge, Avatar
  data/
    types.ts           Season / Couple / Islander / TimelineEvent types
    loveIslandUsaS6.ts Season data
    index.ts           Season registry and lookup helpers
  lib/                 Theme and favorites store
```

## Updating data

Statuses live in `src/data/loveIslandUsaS6.ts`. When a couple's status changes:

1. Update `status` and `headline`.
2. Add a `timeline` event (`kind: 'split'` for breakups).
3. Add a source link and bump `lastVerified`.

To add another season, create a new file next to it and add it to `seasons` in `src/data/index.ts`.
The home screen currently shows `seasons[0]`; a season picker is the next step.
