import { researchCouple } from '../ai/newsResearch';
import { analyzePost } from '../ai/postAnalysis';
import { config } from '../config';
import { FixtureProvider } from '../social/fixture';
import { InstagramBusinessDiscovery } from '../social/instagram';
import type { SocialProvider } from '../social/provider';
import type { RefreshDeps } from './refresh';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function fetchImage(url: string): Promise<{ data: string; mediaType: (typeof IMAGE_TYPES)[number] } | null> {
  try {
    const res = await fetch(url);
    const type = res.headers.get('content-type')?.split(';')[0] as (typeof IMAGE_TYPES)[number] | undefined;
    if (!res.ok || !type || !IMAGE_TYPES.includes(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_IMAGE_BYTES) return null;
    return { data: buf.toString('base64'), mediaType: type };
  } catch {
    return null;
  }
}

function socialProvider(): SocialProvider | null {
  const s = config.social;
  if (s.provider === 'fixture') return new FixtureProvider(s.fixtureDir);
  if (s.provider === 'instagram') {
    const { igUserId, accessToken } = s.instagram;
    if (!igUserId || !accessToken) {
      console.warn('[social] SOCIAL_PROVIDER=instagram but IG_USER_ID / IG_ACCESS_TOKEN are missing; social monitoring off');
      return null;
    }
    return new InstagramBusinessDiscovery({ ...s.instagram, igUserId, accessToken });
  }
  return null;
}

export function hasClaudeCredentials(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export function realDeps(): RefreshDeps {
  const ai = hasClaudeCredentials();
  if (!ai) console.warn('[refresh] ANTHROPIC_API_KEY not set; news research and post analysis are off');
  return {
    research: ai ? researchCouple : null,
    analyzePost: ai ? analyzePost : null,
    social: socialProvider(),
    fetchImage,
    thresholds: {
      autoPublishConfidence: config.autoPublishConfidence,
      statusChangeConfidence: config.statusChangeConfidence,
    },
    socialFetchLimit: config.social.instagram.mediaLimit,
    maxNewPostsPerIslander: 12,
    log: console.log,
  };
}
