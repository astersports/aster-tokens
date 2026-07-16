# @aster/tokens

**Canonical Aster design tokens** — one light palette for every **Aster-branded** surface,
defined ONCE here and read by every repo, so a change to the palette **propagates to every
repo with no manual gap**. Values-only: no components, no runtime dependencies.

Consumed as a **private cross-repo dependency** (same mechanism as `@aster/weather`):
`"@aster/tokens": "github:astersports/aster-tokens#v0.1.0"`.

> **Out of scope by design:** `st-patricks-armonk` (a client parish brand) does **not**
> consume this — it carries the client's brand, not Aster's. `aster-weather` has no UI.

---

## 1. Canonical palette (the source of truth)

| Token (`--as-*` / JS) | Hex | Role |
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

## 2. Consume it

```css
/* your repo's global stylesheet */
@import "@aster/tokens/tokens.css";
```
```js
import { tokens } from "@aster/tokens"; // { ground: "#FCFBF9", navyUi: "#12244D", … }
```

### The shim: keep your local names, map the values (no rename churn)
Each repo keeps its OWN token vocabulary via **one documented shim file**, retired
opportunistically toward the canonical `--as-*` names:

```css
/* src/styles/aster-tokens-shim.css — the ONE place local names bind to canonical values */
:root {
  --as-bg-page:        var(--as-ground);
  --as-bg-card:        var(--as-panel);
  --as-text-primary:   var(--as-ink);
  --as-border-default: var(--as-border);
  --as-header:         var(--as-navy-legacy);  /* pilot; → var(--as-navy-ui) post-R2 */
  --as-accent:         var(--as-gold);
  /* … */
}
```

### Per-repo mapping (target)
| Repo | Local namespace | Shim file |
|---|---|---|
| aster-io (.io) | `--ground/--ink/--navy/…` | `client/src/styles/aster-tokens-shim.css` |
| aster-sports (Hub/App) | `--as-*` | `src/styles/aster-tokens-shim.css` |
| aster-studio (Print Studio) | `--as-*` + shadcn `--*` | `client/src/aster-tokens-shim.css` |
| legacy-hoopers | `--color-*` / `--primary` | `client/src/aster-tokens-shim.css` |

## 3. Propagation — how a change reaches every repo

1. Edit a value here → **bump the version** (semver) → tag `vX.Y.Z`.
2. **Renovate/Dependabot** opens a version-bump PR in every consuming repo.
3. Each bump PR runs the consumer **drift-guard** (below) + the repo's CI.
4. **Version-bump PRs are NEVER auto-merged** — a human reviews each (per-repo gate
   preserved; especially aster-studio, which is on the money path). Merge → deployed.

Rollback = pin the previous `v`. Every hop is versioned, reviewable, reversible.

## 4. Drift-guard (mandatory backstop)

**Package side** (`npm run drift-guard`, runs in this repo's CI): asserts `tokens.css`
and `tokens.js` encode the same hex per role, so the two mirrors can't diverge.

**Consumer side** (lives in each consuming repo, runs in its CI): asserts the repo's
**resolved** local token values equal these canonical values, so a repo can't silently
hand-edit away from the package. Copyable pattern:

```js
// scripts/aster-tokens-drift-guard.mjs (in the consuming repo)
import { tokens } from "@aster/tokens";
// LOCAL_MAP: this repo's local token name -> the canonical token it must equal.
const LOCAL_MAP = { "--as-bg-page": "ground", "--as-header": "navyLegacy", /* … */ };
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
