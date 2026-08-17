# CLAUDE.md — aster-tokens (`@aster/tokens`)

## The estate this belongs to

**Aster Sports** is a creative company focused on **AAU basketball** whose platform is
**not limited to it** — the St. Patrick parish build is the proof, and it is one of the
five surfaces this package routes.

**Canonical estate truth lives in the `astersports.io` repo → `docs/WHAT_IS_BUILT.md`.**
Read it before making a claim about what any Aster product is or does. This file is
grounding for *this library only*.

**This is a SHARED library, and this repo is PUBLIC.** A change here lands in every
consumer at their next re-pin. That is why the bar is higher than in an app repo, and why
the release gate exists — see [The property that matters](#the-property-that-matters).

---

## What this package is

`@aster/tokens` **v0.4.0** — not a stylesheet, a **contract**. One light palette and one
type system, defined once, read by five repos, and **enforced in CI on both sides**.

Values-only: no components, no runtime dependencies, no side-effecting selectors. Consumed
as a git dependency (`github:astersports/aster-tokens#<sha-or-tag>`), same mechanism as
`@aster/weather`.

## Two surface classes, routed by JOB

| | **editorial** (marketing / brand) | **app** (product) |
|---|---|---|
| Display | Instrument Serif — `--atk-ed-display` | Inter — `--atk-app-display` |
| Body | IBM Plex Sans — `--atk-ed-body` | Inter — `--atk-app-body` |
| Mono/data | IBM Plex Mono — `--atk-ed-mono` | IBM Plex Mono — `--atk-app-mono` |
| Legibility | `normal` (Plex has no cv05/cv08) | `'cv05','cv08'` (Inter only) |

**Scale `--atk-scale-1..6` = 34 / 24 / 20 / 17 / 15 / 12 px**, both classes.
**17px is the readable-body floor** — anything a user reads. 15px is the dense-table-cell
minimum. **12px is a label-only floor** — uppercase tags and timestamps, never a sentence.

### Surface routing (`surface-classes.json`)

| Surface | Class |
|---|---|
| `aster-io` | editorial |
| `nova-select` | editorial |
| `aster-sports` | app |
| `aster-studio` | app |
| `st-patricks-armonk` | app + parish deviation |
| `aster-weather` | **deliberately `outOfScope`** — headless, no UI or type surface |

`aster-weather`'s exclusion is declared, not an omission: it sits in the `outOfScope` block
so the audit's coverage is provably complete at five in-scope repos.

## Approved deviations — three live, one retired

A deviation **adds** to a surface's allowed faces; it never replaces the class families,
which stay required.

| Name | Surface | Scope | Faces | Approved |
|---|---|---|---|---|
| `storefront` | aster-io | `.ah` — the astersports.io marketing surface (`client/src/styles/home.css` + `register.css`) | body → **Figtree**; display stays Instrument Serif, mono stays IBM Plex Mono | **Frank 2026-08-16** |
| `broadcast` | aster-sports | `.bc-root` — Records + Livescore only | Barlow Condensed / Barlow | Frank 2026-07-19 |
| parish | st-patricks-armonk | whole surface | Fraunces headings, parish palette, `html{font-size:112.5%}` rem lift | Frank 2026-07-19 (R6) |

`storefront` is **body face only**, and deliberately so: the display serif is the brand
signature with a cross-repo blast radius and is not touched; the mono is kept because it is
what makes figures and statuses read as instrument panel everywhere. **One surface leading,
not a new estate standard** — do not propagate without a fresh ruling.

### The retired one: `night`, and why it was REMOVED rather than repurposed

`night` (Bricolage Grotesque + Geist, aster-io) was declared in v0.3.2 on 2026-08-15. The
dark front door it described was reverted on 2026-08-16 and `night.css` deleted, so the
deviation had **zero consumers** and its scope string named a file that no longer existed.

It would have been cheaper to rename it and swap the faces. That was rejected: its
`approvedBy` stamp read *Frank 2026-08-15* and approved **Bricolage + Geist for a dark
front door** that was withdrawn the next day. Carrying that stamp onto a different decision
would make `surface-classes.json` — **the one artifact every repo reads to learn what is
sanctioned** — assert an approval that was never given. So `night` was removed and
`storefront` declared fresh, with its own scope, faces, rationale and date.

Retiring it **narrows** the allowlist, which is the only operation here that removes
permission — and therefore the only one that can leave a face renderable with nothing
sanctioning it. `scripts/consumer-guard.test.mjs` asserts Bricolage Grotesque and Geist are
approved for **no** surface.

---

## The property that matters

**A font or colour change cannot ship by merely merging.** Two independent mechanisms:

1. **`scripts/contrast-guard.mjs`** re-measures every documented ratio in CI. Every `N:1`
   claim in `tokens.css` and `README.md` is re-derived from the hex against the **named
   ground** — so a ratio cannot be hand-edited, a hex cannot move without re-measuring, and
   an `AA`/`AAA` claim in prose that carries no computed figure **fails the build**. That
   last rule exists because `--atk-text-muted: /* AA text-rank floor */` shipped for months:
   an unfalsifiable claim outlives a wrong number, because there is nothing in it to check.
   The guard also asserts a `BELOW` list — pairs the docs say fail a floor must really fail
   it, so a hex drift cannot quietly make the documentation under-claim.
2. **`.github/workflows/auto-tag.yml`** classifies any minor or major bump as
   design-carrying and **holds the tag** unless the merge commit message contains
   `[release-approved]` (or an owner force-dispatches). A patch auto-tags. This is why
   retiring a deviation is a MINOR, not a patch: retiring or declaring approved font
   families *is* design surface.

`scripts/drift-guard.mjs` is the third leg: `tokens.css` ↔ `tokens.js` and
`typography.css` ↔ `typography.js` must agree, every value must match the ratified canon,
and `surface-classes.json` must route every repo to a known class.

---

## ⚠ Known gaps — read before trusting the guard

### 1. `FLEET_FACES` must be updated whenever a face is declared (FIXED 2026-08-17)

`assertNoForbiddenFaces` iterates **`FLEET_FACES`**, not the union of faces present in the
CSS. **A face absent from that list is invisible to the scan.** `Figtree` was declared as
aster-io's approved `storefront` body face in v0.4.0 and never added, so it could leak into
any other repo undetected. Reproduced before the fix:

```js
assertNoForbiddenFaces("aster-sports", "font-family:'Figtree'") // => []  (zero failures)
```

Fixed by adding `Figtree` to `FLEET_FACES`, with two regression tests in
`scripts/consumer-guard.test.mjs` — one asserting the leak is now flagged on all four other
surfaces, one asserting **every** face named anywhere in `surface-classes.json` is in the
scan's candidate set, so the next deviation cannot repeat the omission. Both fail if the
`FLEET_FACES` line is reverted.

**Rule:** a face added to `surface-classes.json` is added to `FLEET_FACES` in the same
commit, or the declaration is unenforceable everywhere else.

> Consumers pin by SHA, so **nothing changes for them until they re-pin**. Verified safe:
> no repo outside aster-io renders Figtree today, so no consumer's CI turns red on re-pin.

### 2. Deviation scope is NOT enforced by this package

`approvedFamiliesForSurface` returns one `allowed` set **per surface**, not per scope.
Figtree is therefore allowed anywhere in `aster-io`, not only under `.ah`. The guard can
catch a face crossing a **repo** boundary; it cannot catch one crossing a **selector**
boundary. Enforcing `.ah`-only is a consumer-side concern and is not solved here — do not
claim the contract enforces it.

### 3. Retired faces are still unscannable

`Bricolage Grotesque` and `Geist` are in no surface's `allowed` set, but they are also not
in `FLEET_FACES` — so a reappearance would not be flagged either. Verified absent from all
five repos today. Flagged, not fixed: making a retired face permanently forbidden is a
policy call for the owner, not a doc edit.

### 4. `surface-classes.json` version string lags

`surface-classes.json` says `"version": "0.3.2"` while `package.json` says `0.4.0`. The
file's own `ruling` field documents the v0.4.0 change correctly, so the content is right
and only the version string is stale. Nothing reads that field programmatically — no guard
asserts it — but it is the kind of drift this package exists to make impossible, so it
should be corrected on the next release rather than left.

---

## Colour facts that are easy to get wrong

- **`--atk-brass` (`#B9871F`) is a DARK-ground colour.** AA on navy — 4.73:1 on
  `--atk-navy-ui`, 5.67:1 on `--atk-navy-night`. On light it is only 3.10:1 on
  `--atk-ground` (3.21:1 on `--atk-panel`): **non-text UI only** — icons, borders, large
  text — never body copy. On the tinted and secondary surfaces it drops below 3:1 and is
  not usable at all. For gold text on light, use `--atk-gold-text` (`#8F6708`, 4.94:1).
- **`--atk-text-muted` (`#6B7488`) is AA on exactly two grounds:** `--atk-ground` (4.53:1)
  and `--atk-panel` (4.69:1). It is **below AA** on `--atk-surface-secondary`,
  `--atk-gold-tint` and `--atk-surface-tertiary`. Use `--atk-text-secondary` there.
- Every figure above is re-measured in CI. Do not hand-edit one — change the value and let
  the guard print the real number.

---

## Consumer pins (verified 2026-08-17)

| Repo | Pinned SHA | = version |
|---|---|---|
| aster-io | `b44d154` | **v0.3.2** |
| aster-sports | `a1c10f6` | v0.3.1 |
| aster-studio | `a1c10f6` | v0.3.1 |
| nova-select | `a1c10f6` | v0.3.1 |
| st-patricks-armonk | `a1c10f6` | v0.3.1 |

**No consumer is on v0.4.0 yet.** aster-io's re-pin to `6c83711` (v0.4.0) exists on the
unmerged branch `chore/figtree-repin`; its `main` is still on v0.3.2. Anyone stating
"aster-io is on v0.4.0" is describing a branch, not `main`.

Consumers pin by **SHA**, not tag. Rollback = re-pin the previous SHA. Every hop is
versioned, reviewable, reversible — and version-bump PRs are **never auto-merged**.

---

## Working here

- Branch, PR into `main`, keep `main` green. CI runs drift-guard, contrast-guard, and the
  SFGC consumer-guard tests.
- Changing a value means bumping the version — and a minor/major will be **held** until the
  merge commit carries `[release-approved]`. That hold is the feature.
- Adding a face anywhere means adding it to `FLEET_FACES` in the same commit.
- Adding a contrast claim means adding the pair to `CANON` (or `BELOW`) in
  `contrast-guard.mjs`. A claim with no measured figure will fail the build, by design.
