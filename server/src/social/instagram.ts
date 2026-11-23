import type { SocialPost, SocialProfile, SocialProvider } from './provider';

/**
 * Reads public Instagram professional (Business/Creator) accounts through the
 * official Instagram Graph API "business discovery" endpoint.
 *
 * Requirements: your own Instagram professional account linked to a Facebook
 * app with the instagram_basic + instagram_manage_insights permissions, and a
 * long-lived access token. Personal (non-professional) accounts can't be read
 * this way, and this provider deliberately does not scrape.
 */
export class InstagramBusinessDiscovery implements SocialProvider {
  readonly name = 'instagram';

  constructor(
    private readonly opts: { igUserId: string; accessToken: string; graphVersion: string; mediaLimit: number },
  ) {}

  async fetchProfile(handle: string): Promise<SocialProfile | null> {
    const media = `media.limit(${this.opts.mediaLimit}){id,caption,media_type,media_url,thumbnail_url,permalink,timestamp}`;
    const fields = `business_discovery.username(${handle}){username,profile_picture_url,media_count,${media}}`;
    const url = new URL(`https://graph.facebook.com/${this.opts.graphVersion}/${this.opts.igUserId}`);
    url.searchParams.set('fields', fields);
    url.searchParams.set('access_token', this.opts.accessToken);

    const res = await fetch(url);
    if (!res.ok) {
      // 400 with error code 110 = not a professional account / not found.
      console.warn(`[instagram] ${handle}: HTTP ${res.status}`);
      return null;
    }
    const body = (await res.json()) as {
      business_discovery?: {
        username: string;
        profile_picture_url?: string;
        media_count?: number;
        media?: {
          data: {
            id: string;
            caption?: string;
            media_type: string;
            media_url?: string;
            thumbnail_url?: string;
            permalink?: string;
            timestamp: string;
          }[];
        };
      };
    };
    const bd = body.business_discovery;
    if (!bd) return null;

    const posts: SocialPost[] = (bd.media?.data ?? []).map((m) => ({
      id: m.id,
      permalink: m.permalink ?? null,
      postedAt: m.timestamp,
      caption: m.caption ?? null,
      imageUrl: (m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url) ?? null,
    }));
    return {
      handle: bd.username,
      profilePictureUrl: bd.profile_picture_url ?? null,
      mediaCount: bd.media_count ?? null,
      posts,
    };
  }
}
