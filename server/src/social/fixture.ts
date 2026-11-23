import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SocialProfile, SocialProvider } from './provider';

/**
 * Reads profiles from `<dir>/<handle>.json` (a SocialProfile). Edit a file
 * between refreshes — e.g. remove a post — to exercise the deletion detector
 * without touching a real account.
 */
export class FixtureProvider implements SocialProvider {
  readonly name = 'fixture';
  constructor(private readonly dir: string) {}

  async fetchProfile(handle: string): Promise<SocialProfile | null> {
    try {
      return JSON.parse(await readFile(join(this.dir, `${handle}.json`), 'utf8')) as SocialProfile;
    } catch {
      return null;
    }
  }
}
