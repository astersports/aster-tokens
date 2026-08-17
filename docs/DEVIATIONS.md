# Surface classes, deviations, and why `night` was removed

**Moved out of `CLAUDE.md` on 2026-08-18** under [the doc doctrine](https://github.com/astersports/aster-io/blob/main/docs/DOC_DOCTRINE.md).
Nothing was deleted.

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

## The retired one: `night`, and why it was REMOVED rather than repurposed

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

## The property that matters — a font or colour change cannot ship by merely merging

Two independent mechanisms:

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
