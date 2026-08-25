import type { SearchOutcome } from './geocode';
import {
  cachedOutcomeFor,
  isCacheable,
  rememberOutcome,
  type SearchCache,
} from './searchCache';

const results: SearchOutcome = {
  kind: 'results',
  candidates: [{ label: '10 Downing Street, London', latitude: 51.5034, longitude: -0.1276 }],
};
const empty: SearchOutcome = { kind: 'empty' };
const error: SearchOutcome = { kind: 'error' };

describe('isCacheable', () => {
  it('caches what the geocoder answered — results and "nothing matched"', () => {
    expect(isCacheable(results)).toBe(true);
    expect(isCacheable(empty)).toBe(true);
  });

  it('never caches a failure to reach the geocoder', () => {
    expect(isCacheable(error)).toBe(false);
  });
});

describe('rememberOutcome', () => {
  it('stores a result set against its query', () => {
    expect(rememberOutcome(null, 'London', results)).toEqual({ query: 'London', outcome: results });
  });

  it('stores an empty answer, so the same query is not re-sent (ADR-0009 obligation 3)', () => {
    expect(rememberOutcome(null, 'zzzz', empty)).toEqual({ query: 'zzzz', outcome: empty });
  });

  it('leaves the cache untouched on an error', () => {
    expect(rememberOutcome(null, 'London', error)).toBeNull();
    const held: SearchCache = { query: 'Paris', outcome: results };
    expect(rememberOutcome(held, 'London', error)).toBe(held);
  });
});

describe('cachedOutcomeFor', () => {
  it('re-shows the previous answer for the same query, ignoring case and spacing', () => {
    const cache = rememberOutcome(null, 'London  Bridge', results);
    expect(cachedOutcomeFor(cache, ' london bridge ')).toEqual(results);
  });

  it('re-shows a cached empty answer', () => {
    expect(cachedOutcomeFor(rememberOutcome(null, 'zzzz', empty), 'zzzz')).toEqual(empty);
  });

  it('asks again for a different query', () => {
    expect(cachedOutcomeFor(rememberOutcome(null, 'London', results), 'Paris')).toBeUndefined();
  });

  it('asks again when nothing is cached', () => {
    expect(cachedOutcomeFor(null, 'London')).toBeUndefined();
  });

  it('after a failed search, the identical query is not short-circuited', () => {
    // The defect this module exists to prevent: network drops, the user is told
    // to retry, network returns, they tap Search on the unchanged text.
    const afterFailure = rememberOutcome(null, '10 Downing Street London', error);
    expect(cachedOutcomeFor(afterFailure, '10 Downing Street London')).toBeUndefined();

    const afterRetry = rememberOutcome(afterFailure, '10 Downing Street London', results);
    expect(cachedOutcomeFor(afterRetry, '10 Downing Street London')).toEqual(results);
  });
});
