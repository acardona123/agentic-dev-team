// Geocoding against the public Nominatim instance, per ADR-0009. No client
// library: the two things we are obliged to control (the User-Agent and the
// query shape) are exactly what a wrapper would sit on top of. Pure module —
// no React, no Expo; `fetch` is injected so the policy obligations are testable.

/**
 * Identifies this app to Nominatim. ADR-0009 obligation 1: a default/library
 * User-Agent is grounds for an IP block, which presents as "search silently
 * stopped working".
 */
export const GEOCODER_USER_AGENT =
  'AlmostThere/0.1 (https://github.com/acardona123/agentic-dev-team)';

export const NOMINATIM_SEARCH_ENDPOINT =
  'https://nominatim.openstreetmap.org/search';

/** How many matches we ask for. ADR-0009 fixes the request shape. */
export const SEARCH_RESULT_LIMIT = 5;

/** A place the user could pick as their target. */
export type Candidate = {
  /** Human-readable label, straight from Nominatim's `display_name`. */
  label: string;
  latitude: number;
  longitude: number;
};

export type SearchOutcome =
  | { kind: 'results'; candidates: Candidate[] }
  | { kind: 'empty' }
  | { kind: 'error' };

/** Everything needed to issue the request, so a test can assert the headers. */
export type GeocodeRequest = {
  url: string;
  headers: Record<string, string>;
};

/** ADR-0009: GET /search?q=&format=jsonv2&limit=5&addressdetails=0 */
export function buildSearchRequest(query: string): GeocodeRequest {
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'jsonv2',
    limit: String(SEARCH_RESULT_LIMIT),
    addressdetails: '0',
  });
  return {
    url: `${NOMINATIM_SEARCH_ENDPOINT}?${params.toString()}`,
    headers: { 'User-Agent': GEOCODER_USER_AGENT },
  };
}

/**
 * Nominatim returns lat/lon as strings (ADR-0009). Anything we cannot parse is
 * dropped rather than surfaced as NaN coordinates the alarm would later trust.
 */
export function toCandidates(payload: unknown): Candidate[] {
  if (!Array.isArray(payload)) return [];
  const candidates: Candidate[] = [];
  for (const entry of payload) {
    if (typeof entry !== 'object' || entry === null) continue;
    const row = entry as Record<string, unknown>;
    const label = row.display_name;
    const latitude = Number(row.lat);
    const longitude = Number(row.lon);
    if (typeof label !== 'string' || label.length === 0) continue;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    candidates.push({ label, latitude, longitude });
  }
  return candidates;
}

/**
 * ADR-0009 obligation 3: identical repeated queries must not be re-sent.
 * Comparison is on the trimmed, case-folded text, so "  London " is the same
 * query as "london".
 */
export function isSameQuery(a: string, b: string): boolean {
  return normaliseQuery(a) === normaliseQuery(b);
}

export function normaliseQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** A blank query is never worth a request to someone else's donated server. */
export function isSearchable(query: string): boolean {
  return normaliseQuery(query).length > 0;
}

/** Minimal shape of `fetch` we depend on, so tests need no DOM types. */
export type FetchLike = (
  url: string,
  init: { headers: Record<string, string>; signal?: AbortSignal },
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

export const SEARCH_TIMEOUT_MS = 10_000;

/**
 * ADR-0009 obligation 5: a non-200, a timeout and a thrown network error are
 * all the same ordinary outcome — `{ kind: 'error' }`. Never throws.
 */
export async function searchAddress(
  query: string,
  fetchImpl: FetchLike,
  timeoutMs: number = SEARCH_TIMEOUT_MS,
): Promise<SearchOutcome> {
  if (!isSearchable(query)) return { kind: 'empty' };

  const { url, headers } = buildSearchRequest(query);
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { headers, signal: abort.signal });
    if (!response.ok) return { kind: 'error' };
    const candidates = toCandidates(await response.json());
    return candidates.length === 0
      ? { kind: 'empty' }
      : { kind: 'results', candidates };
  } catch {
    return { kind: 'error' };
  } finally {
    clearTimeout(timer);
  }
}
