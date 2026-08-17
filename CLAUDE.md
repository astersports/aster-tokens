# CLAUDE.md — aster-tokens (`@aster/tokens`)

> **RULES only.** Compressed 2026-08-18 from 207 lines against
> [the doc doctrine](https://github.com/astersports/aster-io/blob/main/docs/DOC_DOCTRINE.md);
> **nothing deleted.** This library has no `docs/` directory on purpose: it is a public package,
> so [`README.md`](README.md) **is** the reference — and it is a *guarded* one, because
> `contrast-guard.mjs` re-derives every `N:1` claim written in it. Facts live there; this file
> is only what an agent must not get wrong.
> **Canonical estate truth:** `astersports/aster-io` → [`WHAT_IS_BUILT.md`](https://github.com/astersports/aster-io/blob/main/docs/WHAT_IS_BUILT.md).
> Read it before claiming what any Aster product is or does; this file governs *this library only*.

**This is a SHARED library, and this repo is PUBLIC.** A change here lands in every consumer at
their next re-pin. That is why the bar is higher than in an app repo, and why the release gate
exists.

`@aster/tokens` **v0.4.0** — not a stylesheet, a **contract**. One light palette and one type
system, defined once, read by five repos, **enforced in CI on both sides**. Values-only: no
components, no runtime dependencies, no side-effecting selectors. Consumed as a git dependency
(`github:astersports/aster-tokens#<sha-or-tag>`), same mechanism as `@aster/weather`.

## 1. The rules that carry consequence

- **A font or colour change cannot ship by merely merging.** `contrast-guard.mjs` re-measures
  every documented ratio in CI against the **named ground**, and `auto-tag.yml` **holds the tag**
  on any minor/major until the merge commit carries `[release-approved]`. That hold is the
  feature.
- **Never hand-edit a contrast figure.** Change the value and let the guard print the real
  number. **An `AA`/`AAA` claim carrying no computed figure fails the build** — an unfalsifiable
  claim outlives a wrong number, because there is nothing in it to check.
- **Adding a contrast claim means adding the pair to `CANON` (or `BELOW`)** in
  `contrast-guard.mjs`, in the same commit.
- **A face added to `surface-classes.json` is added to `FLEET_FACES` in the same commit**, or
  the declaration is unenforceable everywhere else. `assertNoForbiddenFaces` iterates
  `FLEET_FACES`, so an unlisted face is **invisible to the scan** — this shipped once, with
  Figtree. See gap 1.
- **A deviation ADDS to a surface's allowed faces; it never replaces the class families**, which
  stay required.
- **Changing a value means bumping the version.** Retiring or declaring approved font families
  *is* design surface, so it is a MINOR, not a patch.
- **Version-bump PRs are never auto-merged.**

## 2. ⚠ Do not overclaim what the guard enforces

- **Deviation scope is NOT enforced here.** `approvedFamiliesForSurface` returns one `allowed`
  set **per surface**, not per scope — Figtree is allowed anywhere in `aster-io`, not only under
  `.ah`. The guard catches a face crossing a **repo** boundary, never a **selector** boundary.
- **Retired faces are unscannable.** `Bricolage Grotesque` and `Geist` are in no `allowed` set
  and also not in `FLEET_FACES`, so a reappearance would not be flagged. Making a retired face
  permanently forbidden is a policy call for the owner, not a doc edit.
- **`surface-classes.json`'s version string lags `package.json`** (0.3.2 vs 0.4.0). Content is
  right, string is stale, no guard asserts it.

Detail: [`README.md` §4](README.md#4--known-gaps-in-the-guard).

## 3. Read consumer pins from the consumers, never from a table

**Consumers pin by SHA.** To learn what a repo is on, read `package.json` on **its
`origin/main`** — not from a doc here. The pin table in this repo has now gone stale twice
between sessions.

As verified 2026-08-18: **aster-io is on `6c83711` = v0.4.0** (Figtree live on astersports.io);
aster-sports, aster-studio, nova-select and st-patricks-armonk are on `a1c10f6` = v0.3.1. The
previous version of this file asserted no consumer was on v0.4.0 and that aster-io's re-pin was
"a branch, not `main`" — **that branch merged** (aster-io #180).

Rollback = re-pin the previous SHA. Every hop is versioned, reviewable, reversible.

## 4. Type and scale floors

Two surface classes routed by **job**, not by repo taste — **editorial** (Instrument Serif /
IBM Plex Sans / IBM Plex Mono) for marketing and brand, **app** (Inter / Inter / IBM Plex Mono,
with `'cv05','cv08'`) for product. Scale `--atk-scale-1..6` = **34 / 24 / 20 / 17 / 15 / 12 px**
in both.

- **17px is the readable-body floor** — anything a user reads.
- **15px is the dense-table-cell minimum.**
- **12px is a label-only floor** — uppercase tags and timestamps, **never a sentence**.

Routing table, the three live deviations, and why `night` was removed rather than repurposed:
[`README.md` §2–3](README.md#2-type--two-classes-routed-by-job).

## 5. Two colour facts that are easy to get wrong

- **`--atk-brass` (`#B9871F`) is a DARK-ground colour.** AA on navy; on light it is 3.10:1 on
  `--atk-ground` — **non-text UI only** (icons, borders, large text), never body copy, and below
  3:1 on the tinted and secondary surfaces. For gold text on light use `--atk-gold-text`
  (`#8F6708`, 4.94:1).
- **`--atk-text-muted` (`#6B7488`) is AA on exactly two grounds** — `--atk-ground` and
  `--atk-panel`. It is **below AA** on `--atk-surface-secondary`, `--atk-gold-tint` and
  `--atk-surface-tertiary`; use `--atk-text-secondary` there.

## 6. Working here

Branch, PR into `main`, keep `main` green. CI runs `drift-guard`, `contrast-guard`, and the SFGC
consumer-guard tests. `drift-guard.mjs` is the third leg of the contract: `tokens.css` ↔
`tokens.js` and `typography.css` ↔ `typography.js` must agree, every value must match the
ratified canon, and `surface-classes.json` must route every repo to a known class.

| | |
|---|---|
| **Canonical estate truth** · cross-repo state | `aster-io` → `docs/WHAT_IS_BUILT.md` · `docs/ESTATE_STATE.md` |
| Surface classes, deviations, `night`, the release gate, palette | [`README.md`](README.md) §2–3, §5 |
| Guard gaps and live consumer pins | [`README.md`](README.md) §4, §7 |
