// The session cache behind ADR-0009 obligation 3 ("don't re-send identical
// queries"). Kept out of the component so the one rule that matters — what is
// and is not worth remembering — is a pure function with tests. No React, no Expo.

import { isSameQuery, type SearchOutcome } from './geocode';

/**
 * What the geocoder actually *answered*. An `error` is a failure to reach it,
 * not an answer, so it never lands here: caching one would make an address
 * unrecoverable for the whole session once the network blips, which on a bus in
 * an unfamiliar city is precisely when it blips. An `empty` result is a real
 * answer from the server, so it is cached — re-asking is the wasteful repeat
 * obligation 3 flags.
 */
export type CachedOutcome = Exclude<SearchOutcome, { kind: 'error' }>;

export type SearchCache = { query: string; outcome: CachedOutcome } | null;

export function isCacheable(outcome: SearchOutcome): outcome is CachedOutcome {
  return outcome.kind !== 'error';
}

/** Returns the cache to hold next. An uncacheable outcome leaves it untouched. */
export function rememberOutcome(
  cache: SearchCache,
  query: string,
  outcome: SearchOutcome,
): SearchCache {
  return isCacheable(outcome) ? { query, outcome } : cache;
}

/** The answer we may re-show without a request, or `undefined` if we must ask. */
export function cachedOutcomeFor(cache: SearchCache, query: string): CachedOutcome | undefined {
  if (cache === null) return undefined;
  return isSameQuery(cache.query, query) ? cache.outcome : undefined;
}
