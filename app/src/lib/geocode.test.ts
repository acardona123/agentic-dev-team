import {
  buildSearchRequest,
  GEOCODER_USER_AGENT,
  isSameQuery,
  isSearchable,
  searchAddress,
  toCandidates,
  type FetchLike,
} from './geocode';

const twoResults = [
  { display_name: '10 Downing Street, London, SW1A 2AA', lat: '51.5034', lon: '-0.1276' },
  { display_name: 'Downing Street, Farnham, Surrey', lat: '51.2148', lon: '-0.7986' },
];

function stubFetch(
  response: Partial<{ ok: boolean; status: number; body: unknown }>,
): { fetchImpl: FetchLike; calls: { url: string; headers: Record<string, string> }[] } {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, headers: init.headers });
    return {
      ok: response.ok ?? true,
      status: response.status ?? 200,
      json: async () => response.body ?? [],
    };
  };
  return { fetchImpl, calls };
}

describe('buildSearchRequest', () => {
  it('sends an identifying User-Agent, not a library default (ADR-0009 obligation 1)', () => {
    expect(buildSearchRequest('London').headers['User-Agent']).toBe(GEOCODER_USER_AGENT);
    expect(GEOCODER_USER_AGENT).toMatch(/AlmostThere/);
  });

  it('builds the request shape ADR-0009 fixes', () => {
    const { url } = buildSearchRequest('10 Downing Street London');
    expect(url).toContain('https://nominatim.openstreetmap.org/search?');
    expect(url).toContain('q=10+Downing+Street+London');
    expect(url).toContain('format=jsonv2');
    expect(url).toContain('limit=5');
    expect(url).toContain('addressdetails=0');
  });

  it('trims the query before encoding it', () => {
    expect(buildSearchRequest('  London  ').url).toContain('q=London&');
  });
});

describe('toCandidates', () => {
  it('maps a successful response to candidates with numeric coordinates', () => {
    expect(toCandidates(twoResults)).toEqual([
      { label: '10 Downing Street, London, SW1A 2AA', latitude: 51.5034, longitude: -0.1276 },
      { label: 'Downing Street, Farnham, Surrey', latitude: 51.2148, longitude: -0.7986 },
    ]);
  });

  it('parses lat/lon that arrive as strings', () => {
    const [candidate] = toCandidates(twoResults);
    expect(typeof candidate.latitude).toBe('number');
    expect(typeof candidate.longitude).toBe('number');
  });

  it('maps an empty response to no candidates', () => {
    expect(toCandidates([])).toEqual([]);
  });

  it('drops rows with an unusable label or unparseable coordinates', () => {
    expect(
      toCandidates([
        { display_name: 'ok', lat: '1', lon: '2' },
        { display_name: '', lat: '1', lon: '2' },
        { display_name: 'no lat', lon: '2' },
        { display_name: 'junk lat', lat: 'north', lon: '2' },
        null,
        'nonsense',
      ]),
    ).toEqual([{ label: 'ok', latitude: 1, longitude: 2 }]);
  });

  it('maps a non-array payload to no candidates', () => {
    expect(toCandidates({ error: 'Unable to geocode' })).toEqual([]);
    expect(toCandidates(undefined)).toEqual([]);
  });
});

describe('isSameQuery / isSearchable', () => {
  it('treats whitespace and case differences as the same query', () => {
    expect(isSameQuery('  London ', 'london')).toBe(true);
    expect(isSameQuery('London  Bridge', 'london bridge')).toBe(true);
  });

  it('treats different text as a different query', () => {
    expect(isSameQuery('London', 'Londonderry')).toBe(false);
  });

  it('rejects blank queries as not worth a request', () => {
    expect(isSearchable('   ')).toBe(false);
    expect(isSearchable('London')).toBe(true);
  });
});

describe('searchAddress', () => {
  it('returns results and sends the User-Agent header on the wire', async () => {
    const { fetchImpl, calls } = stubFetch({ body: twoResults });
    const outcome = await searchAddress('10 Downing Street London', fetchImpl);

    expect(outcome).toEqual({ kind: 'results', candidates: toCandidates(twoResults) });
    expect(calls).toHaveLength(1);
    expect(calls[0].headers['User-Agent']).toBe(GEOCODER_USER_AGENT);
  });

  it('reports empty when the service matches nothing', async () => {
    const { fetchImpl } = stubFetch({ body: [] });
    expect(await searchAddress('zzzzzzzz', fetchImpl)).toEqual({ kind: 'empty' });
  });

  it('reports error on a rate-limit or server error rather than throwing', async () => {
    for (const status of [429, 500, 503]) {
      const { fetchImpl } = stubFetch({ ok: false, status });
      expect(await searchAddress('London', fetchImpl)).toEqual({ kind: 'error' });
    }
  });

  it('reports error when the network call rejects', async () => {
    const fetchImpl: FetchLike = async () => {
      throw new Error('Network request failed');
    };
    expect(await searchAddress('London', fetchImpl)).toEqual({ kind: 'error' });
  });

  it('reports error when the body is not valid JSON', async () => {
    const fetchImpl: FetchLike = async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    });
    expect(await searchAddress('London', fetchImpl)).toEqual({ kind: 'error' });
  });

  it('does not call the service for a blank query', async () => {
    const { fetchImpl, calls } = stubFetch({ body: twoResults });
    expect(await searchAddress('   ', fetchImpl)).toEqual({ kind: 'empty' });
    expect(calls).toHaveLength(0);
  });

  it('aborts a request that hangs past the timeout', async () => {
    const fetchImpl: FetchLike = (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
      });
    expect(await searchAddress('London', fetchImpl, 5)).toEqual({ kind: 'error' });
  });
});
