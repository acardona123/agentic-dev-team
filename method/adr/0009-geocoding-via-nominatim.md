# 0009 — Geocoding provider: OpenStreetMap Nominatim, called directly with `fetch`
**Status:** Accepted · **Date:** 2026-08-25

## Context
`CLAUDE.md`'s `## Tech` list has said "Geocoding: OpenStreetMap Nominatim, no API key"
since the Phase 0 scaffolding commit. No ADR ever justified it and Alex was never asked.
S1 (address search) is the first story that actually calls a geocoder, so the choice has
to be made properly now, before code depends on it.

**The usage pattern is the whole argument.** A user geocodes *one* destination at the
start of a journey and never again for that trip. Order of magnitude: a handful of
requests per user per day, from a phone, on a human's timescale. This is not a
throughput problem, it is a single blocking call on a cold path. Anything that solves
it by adding an account, a billing relationship, or a secret we cannot keep is paying a
structural cost for a problem we do not have.

The second constraint is that we ship a **client-side mobile app**. There is no server
of ours in the path. Any API key we use is in the app bundle, i.e. readable by anyone
with the APK — the mobile equivalent of shipping your private key in `.rodata`. Vendors
mitigate this with referrer/bundle-ID restrictions on the key; the free tiers of the
realistic candidates mostly do not include that restriction feature (see below).

## Decision
Use the public **Nominatim** instance at `https://nominatim.openstreetmap.org/search`,
called directly with the built-in `fetch`. No API key, no account, no client library.

Request shape: `GET /search?q=<query>&format=jsonv2&limit=5&addressdetails=0`.
Response fields we consume: `display_name` (label), `lat`, `lon` (both **strings** —
parse them, do not assume numbers).

### What this obliges our code to do
These are policy requirements, not style preferences. Violating them gets the app's IP
blocked, which presents as "search silently stopped working" and is very hard to
diagnose after the fact. Verified against
<https://operations.osmfoundation.org/policies/nominatim/> on 2026-08-25.

1. **Send an identifying `User-Agent` on every request.** A default/library UA is
   explicitly insufficient and is grounds for blocking. Use a constant such as
   `AlmostThere/0.1 (https://github.com/acardona123/agentic-dev-team)`. React Native's
   `fetch` goes through OkHttp on Android and *does* let us set this header; a browser
   would silently strip it, which is one more reason the geocoding path is a
   phone-target path, not the `expo start --web` target.
2. **One request per explicit user action, never per keystroke.** The policy names
   client-side autocomplete as a prohibited use, in as many words. The absolute ceiling
   is 1 request/second and we should be nowhere near it. S1's AC3 already encodes this;
   it is a policy obligation, not a nice-to-have.
3. **Cache results.** The policy asks that repeated identical queries not be re-sent and
   flags clients that do so as faulty. Holding the last query and its results in memory
   for the session, and not re-firing when the query string is unchanged, satisfies this
   at our volume.
4. **Show attribution in the UI.** The data is ODbL. Wherever results are displayed,
   show "© OpenStreetMap contributors" (or "Search by OpenStreetMap / Nominatim") in
   legible text. This is a visible acceptance criterion, not a README line.
5. **Handle failure as a normal outcome.** Public shared infrastructure: expect HTTP
   429, 5xx and timeouts. Treat a non-200 the same as a network failure — a plain
   message, no crash, no infinite spinner.

### Why `fetch` and not a client library
`fetch` is in the React Native runtime already. A Nominatim/geocoding wrapper would buy
us typed response objects and save perhaps twenty lines of parsing, at the cost of a
dependency that must track SDK 54's constraints ([ADR-0007](0007-expo-sdk-pinned-to-expo-go.md))
and that would sit between us and the two headers we are legally obliged to control.
**Without it we write:** one `async` function that builds a URL, sets `User-Agent`,
awaits the JSON, and maps it to `{ label, lat, lon }` — which is exactly the pure
mapping function S1's AC6 already requires to be unit-testable in `app/src/lib/`.

## Trade-off
We are a guest on donated infrastructure with **no SLA and no support channel**. It can
be slow, it can rate-limit us, and if we misbehave the remedy is a silent IP block with
no notification. Nominatim's search quality on loose, conversational queries is also
weaker than Google's — it is a structured gazetteer lookup, not a fuzzy intent matcher.
Expect "10 Downing Street London" to work and "the big Tesco near the station" not to.

**Revisit when** any of: (a) we see 429s or blocks in normal single-user use;
(b) real-world use shows users cannot find their stop because the matching is too
literal; (c) the app is distributed beyond a handful of people, at which point a shared
public instance stops being a fair use of someone else's donation and a paid provider
behind *our own* proxy becomes the honest answer. Note that (c) is the same trigger that
makes API keys viable, because the proxy is where the key would live.

## Alternatives rejected
- **Photon (komoot public instance)** — also OSM-derived, also no key, and it is designed
  for as-you-type search, so it would relax the one constraint that shapes S1's UI. But
  its terms state only "be fair — extensive usage will be throttled" and explicitly
  disclaim availability; there is no published contract at all, and self-hosting is the
  recommended path for anything real. Trading a documented policy for an undocumented one
  is not an improvement. **Reasonable second choice** if Nominatim's literal matching
  turns out to be the thing that fails users.
- **LocationIQ** — Nominatim-compatible API, generous free tier (5 000 req/day,
  2 req/s), which is orders of magnitude more headroom than we need. Rejected because it
  requires an account and an API key, and the free plan does **not** include IP/HTTP
  restrictions on that key — so the key ships unprotected in the APK and anyone can spend
  our quota. Paying to fix a volume problem we do not have.
- **MapTiler / Mapbox geocoding** — same key-in-the-bundle problem, plus a billing
  account behind the free tier. Mapbox additionally restricts caching/storage of results,
  which collides with obligation 3 above. Both are the right answer once there is a
  backend to hold the key; today there is no backend.
- **Google Places / Geocoding API** — best match quality by a distance, and the only one
  that would handle vague queries well. Requires a Google Cloud project with a credit
  card on file, per-request billing after the free allowance, and a key in the client.
  For a learning project with one user, attaching a billing account to a public app
  bundle is an unforced risk.
- **Self-hosting Nominatim** — removes every policy constraint and costs a server, a
  planet import, and an ops surface. Comically disproportionate to one lookup per
  journey, and directly against "fewest moving parts".
- **No geocoding at all (type raw lat/lon)** — genuinely considered, since it is zero
  dependencies and zero policy. Rejected because the use case is "you are on a bus in an
  unfamiliar city": nobody has coordinates to hand. Typing an address *is* the feature.
