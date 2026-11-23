export interface SocialPost {
  id: string;
  permalink: string | null;
  postedAt: string;
  caption: string | null;
  /** Image to analyze (for videos, the thumbnail). May expire, so analyze when first seen. */
  imageUrl: string | null;
}

export interface SocialProfile {
  handle: string;
  profilePictureUrl: string | null;
  mediaCount: number | null;
  /** Most recent posts, newest first. */
  posts: SocialPost[];
}

export interface SocialProvider {
  readonly name: string;
  /** Returns null when the account can't be read (private, personal account, not found). */
  fetchProfile(handle: string): Promise<SocialProfile | null>;
}
