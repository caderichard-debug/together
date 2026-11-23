import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | undefined;

/** Lazily created so the API server can boot (and serve data) without an API key. */
export function claude(): Anthropic {
  client ??= new Anthropic();
  return client;
}

/**
 * Server-side refusal fallback: if the primary model declines a request,
 * the API re-runs it on a fallback model inside the same call.
 */
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01' as const;
