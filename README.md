# @aster/tokens

**The enforced design contract for the Aster estate.** One light palette and one type
system, defined once here, read by five repos — and re-measured in CI on both sides, so a
value cannot drift and a contrast claim cannot be hand-edited.

Values-only: no components, no runtime dependencies, no side-effecting selectors.

> **Aster Sports** is a creative company focused on **AAU basketball** whose platform is
> **not limited to it** — the St. Patrick parish build is the proof, and it is one of the
> five surfaces this package routes. Canonical estate truth lives in the `astersports.io`
> repo → `docs/WHAT_IS_BUILT.md`.
>
> **This is a shared library, and this repo is public.** A change here reaches every
> consumer at their next re-pin, so the bar is higher than in an app repo — which is
> exactly why the release gate below exists.

**This README is the reference, and it is a guarded one.** `contrast-guard.mjs` re-derives every
`N:1` figure written below from the hex against its named ground, so a ratio here cannot be
hand-edited and an `AA` claim carrying no computed number fails the build. That is why this
package has no `docs/` directory: the facts live here, where CI already checks them. The *rules*
an agent must follow are [`CLAUDE.md`](./CLAUDE.md) — short, because it loads on every turn.
([Why each fact gets one home.](https://github.com/astersports/aster-io/blob/main/docs/DOC_DOCTRINE.md))

Consumed as a git dependency, same mechanism as `@aster/weather`. Consumers pin by **SHA**:

```jsonc
{ "@aster/tokens": "github:astersports/aster-tokens#6c8371182cc74d6156a40f65b579d5c9459f140c" }
```

---

## 1. The property that matters

**A font or colour change cannot ship by merely merging.** That is the whole point of this
package, and it rests on two independent mechanisms plus a backstop.

### `scripts/contrast-guard.mjs` — a ratio cannot be hand-edited

Every `N:1` claim in `tokens.css` and in **this README** is re-derived from the hex against
the **named ground** on every PR. Three assertions:

1. **Measured must equal documented.** Change a hex without re-measuring → fail. Edit a
   figure without changing the hex → fail.
2. **Each pair clears the floor its declared role requires**, and a separate `BELOW` list
   asserts that pairs the docs say fail a floor really do fail it — so a hex drift cannot
   quietly make the documentation *under*-claim.
3. **An `AA`/`AAA` claim in prose must carry a figure the guard computed.** This exists
   because `--atk-text-muted: /* AA text-rank floor */` shipped for months. No `N:1`
   pattern to catch, no ground named, no number at all — and it was false on three of five
   grounds. **A contrast claim without a figure is not a weaker claim; it is an
   unfalsifiable one**, and it outlives a wrong number precisely because there is nothing
   in it to check.

### `.github/workflows/auto-tag.yml` — a design release is held, not merged

A **patch** bump auto-tags (no design surface). A **minor or major** bump is classified as
design-carrying and the tag is **HELD** unless the merge commit message contains
`[release-approved]` — or an owner deliberately force-dispatches the workflow.

This is why retiring a deviation is a MINOR and not a patch: **retiring or declaring
approved font families is design surface.** The gate exists so a face change cannot ship by
merely merging its PR, including by an automated organizer.

### `scripts/drift-guard.mjs` — the mirrors must agree

`tokens.css` ↔ `tokens.js` and `typography.css` ↔ `typography.js` agree per role; every
colour matches the ratified canon; every type role matches the ratified type contract; and
`surface-classes.json` routes every repo to a known class. No mirror, value or class can
silently diverge.

---

## 2. Type — two classes, routed by JOB

| | **editorial** (marketing / brand) | **app** (product) |
|---|---|---|
| Display | Instrument Serif — `--atk-ed-display` | Inter — `--atk-app-display` |
| Body | IBM Plex Sans — `--atk-ed-body` | Inter — `--atk-app-body` |
| Mono / data | IBM Plex Mono — `--atk-ed-mono` | IBM Plex Mono — `--atk-app-mono` |
| Legibility | `normal` — `--atk-ed-feature-legibility` | `'cv05','cv08'` — `--atk-app-feature-legibility` |

`cv05` (disambiguated *l*) and `cv08` (slashed zero) are **Inter** character variants, so
they are app-only; the editorial class is explicitly `normal` so the guard can assert the
*negative* rather than infer an absence.

**Scale `--atk-scale-1..6` = 34 / 24 / 20 / 17 / 15 / 12 px**, both classes:

| Token | px | Use |
|---|---|---|
| `--atk-scale-1` | 34 | hero / marketing display |
| `--atk-scale-2` | 24 | display |
| `--atk-scale-3` | 20 | title |
| `--atk-scale-4` | **17** | **readable-body floor — anything a user reads** |
| `--atk-scale-5` | 15 | dense table cells — minimum for read content |
| `--atk-scale-6` | **12** | **label-only floor** — uppercase tags, timestamps, never a sentence |

Weights `--atk-fw-*` (400/500/600/700), line-heights `--atk-lh-{tight,body}`,
`--atk-numeric: tabular-nums` on all data. The v0.2.x `--atk-fs-*` scale and
`--atk-font-sans` are **frozen byte-identical** for back-compat and deprecated.

### Surface routing (`surface-classes.json`)

| Surface | Class | Note |
|---|---|---|
| `aster-io` | **editorial** | the firm's storefront; the editorial reference. Scoped `storefront` deviation — see below |
| `nova-select` | **editorial** | sales demo / showroom — classified by *job*, not plumbing |
| `aster-sports` | **app** | Hub; half of the Hub↔App P0 invariant. Scoped `broadcast` deviation |
| `aster-studio` | **app** | Print Studio, whole repo (Join/Billing included) |
| `st-patricks-armonk` | **app + parish deviation** | adopts the app *system*, keeps parish colours + Fraunces |
| `aster-weather` | **`outOfScope`** | **deliberately excluded** — headless library, no UI or type surface |

`aster-weather`'s exclusion is *declared* in the `outOfScope` block, not an omission, so
coverage is provably complete at five in-scope repos.

---

## 3. Deviations — three approved, one retired

A deviation **adds** to a surface's allowed faces. The class families stay **required**: a
deviation never replaces them.

### `storefront` — aster-io, approved Frank 2026-08-16

Scope `.ah` (the astersports.io marketing surface: `client/src/styles/home.css` +
`register.css`). **Body face → Figtree.** Display stays Instrument Serif; mono stays
IBM Plex Mono.

Body face **only**, deliberately. The display serif is the brand signature with a
cross-repo blast radius and is not touched. The mono is kept because it is what makes
figures and statuses read as instrument panel across every surface. The body sans is the
most-used voice on the page and so the largest change per unit of churn. Figtree is on
Google Fonts, so this stays off the self-hosting path entirely. Explicitly **not Inter**
(the category default — it would make the page more generic, not less) and explicitly
**not Geist** (allowlisted by the withdrawn `night` deviation; choosing it would let the
typeface be picked by what was cheapest to permit).

**One surface leading, NOT a new estate standard.** Do not propagate without a fresh ruling.

### `broadcast` — aster-sports, approved Frank 2026-07-19

Scope `.bc-root` — the Records + Livescore sports-broadcast surfaces only. **Barlow
Condensed** display + **Barlow** body. The rest of the Hub stays app-clean.

### parish — st-patricks-armonk, approved Frank 2026-07-19 (ratified R6)

**Fraunces** headings + the parish palette (client brand, not io navy/gold), plus
`html{font-size:112.5%}` — a rem lift for older-reader legibility. The scale values remain
the **minimum floors after the lift**: post-lift body ≈18px still clears the 17px readable
floor. A consumer guard must validate the post-lift result against the floors, not assert
the absolute px verbatim.

### RETIRED: `night` — and why it was removed rather than repurposed

`night` (Bricolage Grotesque + Geist, aster-io) was declared in v0.3.2 on 2026-08-15. The
dark front door it described was reverted on 2026-08-16 and `night.css` deleted. The
deviation had **zero consumers** and its scope string named a file that no longer existed.

Renaming it and swapping the faces would have been cheaper. It was rejected on one ground:
its `approvedBy` stamp read *Frank 2026-08-15* and approved **Bricolage + Geist for a dark
front door** that was withdrawn the next day. Carrying that stamp onto a different decision
would make `surface-classes.json` — **the one artifact every repo reads to learn what is
sanctioned** — assert an approval that was never given. An approval is for a specific
decision on a specific date, or it is decoration.

So `night` was removed and `storefront` declared fresh: its own scope, faces, rationale and
date. Retiring **narrows** the allowlist, which is the only operation here that *removes*
permission — and therefore the only one that can leave a face renderable with nothing
sanctioning it. `scripts/consumer-guard.test.mjs` asserts Bricolage Grotesque and Geist are
approved for **no** surface, and it was byte-verified that no stylesheet, link tag or
component in any repo renders either face.

---

## 4. ⚠ Known gaps in the guard

### 4.1 `FLEET_FACES` must be updated whenever a face is declared — fixed 2026-08-17

`assertNoForbiddenFaces` iterates **`FLEET_FACES`**, not the union of faces found in the
CSS. **A face absent from that list is invisible to the scan.**

`Figtree` was declared as aster-io's approved `storefront` body face in v0.4.0 and never
added to `FLEET_FACES`. Reproduced before the fix:

```js
assertNoForbiddenFaces("aster-sports", "font-family:'Figtree'") // => []   zero failures
```

Fixed by adding `Figtree` to `FLEET_FACES`, with two regression tests: one asserting the
leak is flagged on all four other surfaces, one asserting **every** face named anywhere in
`surface-classes.json` is in the scan's candidate set — so the next deviation cannot repeat
the omission. Both fail if the `FLEET_FACES` line is reverted.

**Rule:** a face added to `surface-classes.json` is added to `FLEET_FACES` in the same
commit, or the declaration is unenforceable everywhere else.

> Consumers pin by SHA, so **nothing changes for them until they re-pin.** Verified safe:
> no repo outside aster-io renders Figtree today.

### 4.2 Deviation *scope* is not enforced by this package

`approvedFamiliesForSurface` returns one `allowed` set **per surface**, not per scope.
Figtree is therefore allowed anywhere in `aster-io`, not only under `.ah`. The contract can
catch a face crossing a **repo** boundary; it cannot catch one crossing a **selector**
boundary. That is a consumer-side concern — do not claim the contract enforces it.

### 4.3 Retired faces remain unscannable

`Bricolage Grotesque` and `Geist` are approved for no surface, but they are also not in
`FLEET_FACES`, so a reappearance would not be flagged. Verified absent from all five repos.
Flagged rather than fixed: making a retired face permanently forbidden is a policy call.

### 4.4 `surface-classes.json` version string lags `package.json`

`surface-classes.json` says `"version": "0.3.2"`; `package.json` says `0.4.0`. The file's
own `ruling` field documents the v0.4.0 change correctly, so the content is right and only
the version string is stale. No guard asserts it. It should be corrected on the next
release rather than left — it is precisely the drift this package exists to prevent.

---

## 5. Canonical palette

| Token (`--atk-*` / JS) | Hex | Role |
|---|---|---|
| `ground` | `#FCFBF9` | page background (warm-white) |
| `panel` | `#FFFFFF` | card / panel |
| `panel-hover` | `#F9F8F4` | card hover |
| `surface-secondary` | `#F1EFE9` | secondary surface |
| `surface-tertiary` | `#EAE7DF` | tertiary surface |
| `ink` | `#0B1B3B` | primary text |
| `text-secondary` | `#4A5568` | secondary text — AA on **every** ground in the package (6.09:1 at worst) |
| `text-muted` | `#6B7488` | AA body on `ground` (4.53:1) and `panel` (4.69:1) **only** |
| `text-tertiary` | `#8896AB` | **dividers only** — misses the 3:1 icon floor on four of five grounds |
| `border` | `#E6E4DC` | hairline |
| `border-subtle` | `#EDEAE2` | subtle hairline |
| `text-on-dark` | `#F5F0E8` | cream text over navy |
| **`navy-ui`** | **`#12244D`** | **CANONICAL** interactive / UI navy |
| **`navy-night`** | **`#0A1430`** | **CANONICAL** night surface |
| `navy-legacy` | `#151525` | **DEPRECATED** — migrate post-R2, not mid-pilot |
| `gold` | `#C9952E` | accent, small fills |
| `gold-hi` | `#D4A843` | accent hover / highlight |
| `gold-text` | `#8F6708` | gold **text** on light — AA 4.94:1 on `ground` |
| `gold-tint` | `#F4E9CF` | soft gold background |
| `brass` | `#B9871F` | **dark-ground text.** On light: 3.10:1 — non-text UI only, never body |

**Navy is role-split** (architect ruling 2026-07-16) — don't pick one winner. `navy-ui` is
interactive/UI; `navy-night` is the night surface; `navy-legacy` is what the apps use today
and is kept as a deprecated token so nothing breaks. Semantic status colours, team colours
and per-repo decorative tokens are **not** in this package — they are functional or
tenant-driven.

### Brass is a dark-ground colour

`brass` was documented `AA 4.6:1` [withdrawn] on light. It is not, and never was.

| ground | ratio | verdict |
|---|---|---|
| `navy-ui` `#12244D` | **4.73:1** | AA ✓ — this is what brass is *for* |
| `navy-night` `#0A1430` | **5.67:1** | AA ✓ |
| `ground` `#FCFBF9` | 3.10:1 | non-text UI only |
| `panel` `#FFFFFF` | 3.21:1 | non-text UI only |
| `panel-hover` `#F9F8F4` | 3.02:1 | non-text UI, no margin |
| `surface-secondary` `#F1EFE9` | 2.79:1 | unusable |
| `gold-tint` `#F4E9CF` | 2.66:1 | unusable |
| `surface-tertiary` `#EAE7DF` | 2.60:1 | unusable |

**For gold text on a light ground use `gold-text` (`#8F6708`, 4.94:1)** — itself once
documented `6.8:1` [withdrawn]; it clears AA, but the published figure was overstated.

**A second trap in the same family:** `gold-text` on `gold-tint` — the canonical gold text
on the canonical gold background — is **4.23:1**, below the 4.5:1 body floor. That pairing
looks obviously correct and is not. Use `ink` on `gold-tint` (14.1:1) for body copy in a
gold panel.

### `--atk-text-muted` is AA on exactly two grounds

| ground | `text-muted` | verdict |
|---|---|---|
| `ground` `#FCFBF9` | 4.53:1 | AA ✓ |
| `panel` `#FFFFFF` | 4.69:1 | AA ✓ |
| `surface-secondary` `#F1EFE9` | **4.08:1** | below AA |
| `gold-tint` `#F4E9CF` | **3.89:1** | below AA |
| `surface-tertiary` `#EAE7DF` | **3.79:1** | below AA |

On those three use **`text-secondary` (`#4A5568`)**, which clears AA everywhere (6.09:1 at
worst). `text-tertiary` is a **divider** colour: a meaningful icon needs 3:1, and it
measures 2.90:1 on `ground`, 2.61:1 / 2.49:1 / 2.43:1 on the other light surfaces, and
exactly 3.00:1 on `panel`.

---

## 6. Consume it

```css
@import "@aster/tokens/tokens.css";       /* colours */
@import "@aster/tokens/typography.css";   /* type values */
```
```js
import { tokens, typography } from "@aster/tokens";
import surfaceClasses from "@aster/tokens/surface-classes.json" with { type: "json" };
import { assertConsumerDrift } from "@aster/tokens/consumer-guard";
```

### The shim: keep your local names, map the values

Each repo keeps its own token vocabulary through **one documented shim file**, so adopting
the package is not a rename churn:

```css
/* src/styles/aster-tokens-shim.css — the ONE place local names bind to canonical values */
:root {
  --atk-bg-page:        var(--atk-ground);
  --atk-bg-card:        var(--atk-panel);
  --atk-text-primary:   var(--atk-ink);
  --atk-border-default: var(--atk-border);
  --atk-header:         var(--atk-navy-legacy);  /* pilot; → var(--atk-navy-ui) post-R2 */
  --atk-accent:         var(--atk-gold);
}
```

### The consumer guard (SFGC)

`@aster/tokens/consumer-guard` is the **single** definition of drift for every repo. Before
it existed, each repo shipped its own guard and they diverged — one used substring matching,
one scanned comments (false-trips), one was prefix-only (`Inter` matched `Interstate`), one
scanned two files. Four private opinions on drift, each with its own hole.

It is pure and repo-agnostic: the consumer's thin wrapper does the file IO and calls these
functions with already-extracted data.

```js
import { assertConsumerDrift } from "@aster/tokens/consumer-guard";
const { ok, failures } = assertConsumerDrift({
  surfaceKey: "aster-io",
  html,  // the index.html carrying the css2 <link>
  css,   // the rendered stylesheet
  bindings: [{ local: "--serif", role: "--atk-ed-display" }],
});
if (!ok) { console.error(failures.join("\n")); process.exit(1); }
```

It asserts the **load** surface (only approved families load; every required class family
is present), the **face** surface (comment-excluding, boundary-anchored — so a family named
in a comment does not trip, and `Interstate` does not false-match `Inter`), and **bindings**
(`--serif: var(--atk-ed-display)` is a binding; a comment mentioning it is not).

---

## 7. Propagation, versioning, and where consumers actually are

1. Edit a value → bump the version → merge → `auto-tag.yml` tags it (**held** on
   minor/major without `[release-approved]`).
2. Each consuming repo gets a bump PR that runs its consumer drift-guard plus its own CI.
3. **Version-bump PRs are never auto-merged** — a human reviews each, especially
   `aster-studio`, which is on the money path.

Rollback = re-pin the previous SHA. Every hop is versioned, reviewable, reversible.

**semver here:** *patch* = a value correction that does not change intent · *minor* = a new
token, a role re-value, or any change to declared design surface (including declaring or
retiring a font family) · *major* = a removed or renamed token.

### Consumer pins, verified against each consumer's `origin/main` — 2026-08-18

| Repo | Pinned SHA | = version |
|---|---|---|
| **aster-io** | **`6c83711`** | **v0.4.0** — Figtree live on astersports.io |
| aster-sports | `a1c10f6` | v0.3.1 |
| aster-studio | `a1c10f6` | v0.3.1 |
| nova-select | `a1c10f6` | v0.3.1 |
| st-patricks-armonk | `a1c10f6` | v0.3.1 |

**aster-io is on v0.4.0.** The other four are on v0.3.1.

> ⚠ **Corrected 2026-08-18.** This table said aster-io was on `b44d154` (v0.3.2) and that
> *"No consumer is on v0.4.0 yet — aster-io's re-pin to `6c83711` exists on the unmerged
> branch `chore/figtree-repin`; its `main` is still on v0.3.2."* **That branch merged**
> (aster-io #180). Read the pin from the consumer's own `origin/main`, never from this
> table — it has now gone stale twice, which is what a snapshot in two files does.
> See [`docs/KNOWN_GAPS_AND_PINS.md`](docs/KNOWN_GAPS_AND_PINS.md).

### Releases

- **`v0.1.0`** — the colour palette.
- **`v0.2.0`** — the type system (`typography.css` / `.js`), machine-readable
  `surface-classes.json`, drift-guard for both.
- **`v0.3.0`** — two type classes as named roles (`--atk-ed-*` / `--atk-app-*`), the
  ratified 34/24/20/17/15/12 scale, the cv05/cv08 app-only decision, per-repo class
  routing (st-patricks in scope), and a guard asserting the type contract. Purely
  additive — every v0.2.x token frozen byte-identical.
- **`v0.3.1`** — renames the demo surface to `nova-select`; declares the `broadcast` and
  parish deviations; adds the SFGC shared consumer-guard export and the `./tokens.js` /
  `./typography.js` subpaths.
- **`v0.3.2`** — declares the aster-io scoped `night` deviation. *(Superseded.)*
- **`v0.4.0`** — **retires `night` and declares `storefront`** (aster-io body face →
  Figtree, `.ah` only); corrects the `brass` and `gold-text` contrast claims against their
  named grounds; adds `contrast-guard.mjs`, including the rule that an AA claim in prose
  must carry a measured figure. MINOR rather than patch **because retiring and declaring
  approved font families is design surface** — and therefore held pending
  `[release-approved]`, by design.

---

## 8. Working here

- Branch, PR into `main`, keep `main` green. CI runs drift-guard, contrast-guard, and the
  SFGC consumer-guard tests.
- Changing a value means bumping the version — and a minor/major is **held** until the
  merge commit carries `[release-approved]`. That hold is the feature.
- Adding a face anywhere means adding it to `FLEET_FACES` in the same commit.
- Adding a contrast claim means adding the pair to `CANON` (or `BELOW`) in
  `contrast-guard.mjs`. A claim carrying no measured figure fails the build, by design.
- **Byte-verify a font's real consumers before removing it** — the sweep that seeded type
  here found three "dead" fonts that were live.
