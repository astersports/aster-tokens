# @aster/tokens

**Canonical Aster design tokens + type** — one light palette **and one type system** for every
**Aster-branded** surface, defined ONCE here and read by every repo, so a change **propagates to
every repo with no manual gap**. Values-only: no components, no runtime dependencies.

Consumed as a **public cross-repo dependency** (same mechanism as `@aster/weather`):
`"@aster/tokens": "github:astersports/aster-tokens#v0.3.0"`.

> **Out of scope by design:** `aster-weather` (headless, no UI). `st-patricks-armonk`
> **is now in scope** (v0.3.0): it adopts the App-clean *system* (scale/weights/floors) but
> keeps parish colors + Fraunces headings as a **declared, enforced** deviation.

---

## 1. Canonical palette (the source of truth)

| Token (`--atk-*` / JS) | Hex | Role |
|---|---|---|
| `ground` | `#FCFBF9` | page background (warm-white) |
| `panel` | `#FFFFFF` | card / panel |
| `panel-hover` | `#F9F8F4` | card hover |
| `surface-secondary` | `#F1EFE9` | secondary surface |
| `surface-tertiary` | `#EAE7DF` | tertiary surface |
| `ink` | `#0B1B3B` | primary text |
| `text-secondary` | `#4A5568` | secondary text |
| `text-muted` | `#6B7488` | AA text-rank floor |
| `text-tertiary` | `#8896AB` | non-text only (icons, dividers) |
| `border` | `#E6E4DC` | hairline |
| `border-subtle` | `#EDEAE2` | subtle hairline |
| `text-on-dark` | `#F5F0E8` | cream text over navy |
| **`navy-ui`** | **`#12244D`** | **CANONICAL** interactive / UI navy |
| **`navy-night`** | **`#0A1430`** | **CANONICAL** night surface (Constellation Board) |
| `navy-legacy` | `#151525` | **DEPRECATED** — migrate post-R2, not mid-pilot |
| `gold` | `#C9952E` | accent, small fills |
| `gold-hi` | `#D4A843` | accent hover / highlight |
| `gold-text` | `#8F6708` | gold text on light (AA 6.8:1) |
| `gold-tint` | `#F4E9CF` | soft gold background |
| `brass` | `#B9871F` | gold on light UI (AA 4.6:1) |

**Navy is role-split** (architect ruling 2026-07-16): don't pick one winner. `navy-ui`
(`#12244D`) is the interactive/UI navy; `navy-night` (`#0A1430`) is the night surface;
`navy-legacy` (`#151525`) is what the apps use **today** and is kept as a deprecated token
so nothing breaks — apps migrate off it at the **post-R2 reskin, not mid-pilot**.

Semantic status colors (success/warning/danger/info), team colors, and per-repo decorative
tokens are **not** part of this package — they're functional or tenant/data-driven.

## 1b. Type — two classes, one palette (v0.3.0 — values-only, no components)

**Fleet Type & Design Standard (architect 2026-07-17):** every surface shares the one io
navy+gold palette; **type splits by the surface's *job***, delivered as named role tokens:

| | **Editorial** (marketing/brand) | **App-clean** (product) |
|---|---|---|
| Display | Instrument Serif — `--atk-ed-display` | Inter — `--atk-app-display` |
| Body | IBM Plex Sans — `--atk-ed-body` | Inter — `--atk-app-body` |
| Mono/data | IBM Plex Mono — `--atk-ed-mono` | IBM Plex Mono — `--atk-app-mono` |
| Legibility | `normal` — `--atk-ed-feature-legibility` (Plex has no cv05/cv08) | `'cv05','cv08'` — `--atk-app-feature-legibility` (Inter only) |

A consumer binds its local names to **one class's** roles via the shim. `cv05`/`cv08` are
**Inter** character-variants (disambiguated *l*, slashed zero) — **App-clean only**; the
Editorial class is `normal` (explicit, so the guard asserts the *negative*).

- **Scale (`--atk-scale-1..6`) = 34 / 24 / 20 / 17 / 15 / 12px**, both classes. **17px is the
  readable-body floor** (anything a user reads); 15px is the dense-table-cell minimum; **12px is
  a label-only floor** (uppercase tags/timestamps, never a sentence). `--atk-numeric: tabular-nums`
  on all data. Weights `--atk-fw-*` (400/500/600/700), line-heights `--atk-lh-{tight,body}`.
- **Back-compat (frozen):** `--atk-font-sans` / `--atk-font-feature-legibility` (the App-clean
  default) and the old `--atk-fs-*` scale (24/20/17/15/13/11) stay byte-identical so v0.2.x pins
  don't move. **DEPRECATED** — migrate to the class roles + `--atk-scale-*`; dropped in a later major.
- **`surface-classes.json`** — the drift detector as **machine-readable data** (repo → class → approved
  families). The consumer drift-guard reads it to **enforce** that a repo loads only its class's families.

| Repo | Class | Note |
|---|---|---|
| aster-io | Editorial | The firm's storefront; Editorial reference. |
| legacy-hoopers | Editorial | Sales demo/showroom — classified by *job*, not plumbing. |
| aster-sports (Hub) | App-clean | Flagship; half of the Hub↔App P0 invariant. |
| aster-studio | App-clean | Whole repo (Join/Billing included). |
| st-patricks-armonk | App-clean + parish deviation | Parish colors + Fraunces headings (declared, enforced). |

Out of scope: `aster-weather` (headless, no UI).
**Lesson baked in:** byte-verify a font's real consumers before removing it — the sweep that seeded
type here caught three "dead" fonts that were live.

## 2. Consume it

```css
/* your repo's global stylesheet */
@import "@aster/tokens/tokens.css";       /* colors */
@import "@aster/tokens/typography.css";   /* type values */
```
```js
import { tokens, typography } from "@aster/tokens"; // { ground:"#FCFBF9", … }, { fontSans:"…", fsBody:"15px", … }
import surfaceClasses from "@aster/tokens/surface-classes.json" with { type: "json" };
```

### The shim: keep your local names, map the values (no rename churn)
Each repo keeps its OWN token vocabulary via **one documented shim file**, retired
opportunistically toward the canonical `--atk-*` names:

```css
/* src/styles/aster-tokens-shim.css — the ONE place local names bind to canonical values */
:root {
  --atk-bg-page:        var(--atk-ground);
  --atk-bg-card:        var(--atk-panel);
  --atk-text-primary:   var(--atk-ink);
  --atk-border-default: var(--atk-border);
  --atk-header:         var(--atk-navy-legacy);  /* pilot; → var(--atk-navy-ui) post-R2 */
  --atk-accent:         var(--atk-gold);
  /* … */
}
```

### Per-repo mapping (target)
| Repo | Local namespace | Shim file |
|---|---|---|
| aster-io (.io) | `--ground/--ink/--navy/…` | `client/src/styles/aster-tokens-shim.css` |
| aster-sports (Hub/App) | `--atk-*` | `src/styles/aster-tokens-shim.css` |
| aster-studio (Print Studio) | `--atk-*` + shadcn `--*` | `client/src/aster-tokens-shim.css` |
| legacy-hoopers | `--color-*` / `--primary` | `client/src/aster-tokens-shim.css` |

## 3. Propagation — how a change reaches every repo

1. Edit a value here → **bump the version** (semver) → tag `vX.Y.Z`.
2. **Renovate/Dependabot** opens a version-bump PR in every consuming repo.
3. Each bump PR runs the consumer **drift-guard** (below) + the repo's CI.
4. **Version-bump PRs are NEVER auto-merged** — a human reviews each (per-repo gate
   preserved; especially aster-studio, which is on the money path). Merge → deployed.

Rollback = pin the previous `v`. Every hop is versioned, reviewable, reversible.

## 4. Drift-guard (mandatory backstop)

**Package side** (`npm run drift-guard`, runs in this repo's CI): asserts `tokens.css` ↔
`tokens.js` (hex per role) **and** `typography.css` ↔ `typography.js` (type values per role)
agree; that every color matches the **ratified canon** (a wrong value can't become the source
of truth) and every type role matches the **ratified type contract** (Editorial = Instrument
Serif/Plex/Plex Mono, App-clean = Inter/Inter/Plex Mono, cv05/cv08 on App-clean only, scale
`34/24/20/17/15/12`); and that `surface-classes.json` routes every repo to a known class
coherent with the role tokens — so no mirror, value, or class can silently diverge.

**Consumer side** (lives in each consuming repo, runs in its CI): asserts the repo's
**resolved** local token values equal these canonical values, so a repo can't silently
hand-edit away from the package. Copyable pattern:

```js
// scripts/aster-tokens-drift-guard.mjs (in the consuming repo)
import { tokens } from "@aster/tokens";
// LOCAL_MAP: this repo's local token name -> the canonical token it must equal.
const LOCAL_MAP = { "--atk-bg-page": "ground", "--atk-header": "navyLegacy", /* … */ };
// read the repo's own resolved values (from its shim/built CSS) and compare to tokens[…];
// exit(1) on any mismatch. Fails the PR the moment a value drifts.
```

Guard **without** a version-bump = a repo is off-palette → CI red until it re-pins or maps.
That's the "no gaps" property: propagation (Renovate bumps) **and** anti-drift (guard).

## 5. Versioning

- **patch** — a value correction that doesn't change intent.
- **minor** — a new token, or a role re-value (e.g. the navy split).
- **major** — a removed/renamed token, or retiring `navy-legacy`.

Never change a shipped value silently — bump, so the bump PRs carry the change into every
repo under review.

**Releases:** `v0.1.0` palette (color tokens). `v0.2.0` adds the type system (`typography.css`
/ `.js`) + machine-readable `surface-classes.json` + drift-guard for both. `v0.3.0` adds the
**two type classes as named roles** (`--atk-ed-*` / `--atk-app-*`), the ratified **34/24/20/17/15/12**
scale (`--atk-scale-1..6`, 17px readable-body floor), the cv05/cv08 App-clean-only decision, the
per-repo class routing (st-patricks in scope), and a guard that asserts the type contract — **purely
additive** (every v0.2.x token frozen byte-identical; no wired consumer's resolved value moves).
