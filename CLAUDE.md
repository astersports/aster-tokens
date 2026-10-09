# CLAUDE.md — aster-tokens (`@aster/tokens`)

> **RULES only** ([doc doctrine](https://github.com/astersports/aster-io/blob/main/docs/DOC_DOCTRINE.md)).
> Facts live in [`README.md`](README.md) — this repo has no other fact base, and README's `N:1`
> figures are re-measured by CI. Estate truth: `astersports/aster-io` →
> [`WHAT_IS_BUILT.md`](https://github.com/astersports/aster-io/blob/main/docs/WHAT_IS_BUILT.md) and
> [`ESTATE_STATE.md`](https://github.com/astersports/aster-io/blob/main/docs/ESTATE_STATE.md).
> The pre-2026-10-09 rules, verbatim (old `§N` citations resolve there):
> [`docs/CLAUDE_MD_ARCHIVE_2026-10-09.md`](docs/CLAUDE_MD_ARCHIVE_2026-10-09.md).

**This repo is PUBLIC.** Never commit a secret, a credential-shaped string, or anyone's personal data.
Values-only: no components, no runtime dependencies, no side-effecting selectors.

## 1. What will be got wrong first

- **Read the version from `package.json` on `origin/main`**, never from this file, README prose or a
  handoff. `surface-classes.json` carries its own `"version"`; bump it in the same commit — no guard
  asserts the two agree.
- **Never claim this package is the estate's source of truth.** Owner decision 2026-09-12: it is a
  reference guide. Some consumers own a vendored copy of the files; the rest pin a SHA.
- **Never state which consumer is on what in this file or in a PR as a standing fact.** Read it from
  each consumer's own `origin/main`: `package.json` → `@aster/tokens` for a git-dependency pin, or the
  vendored copy's `README.md` (`client/src/styles/aster-tokens/` or `src/styles/aster-tokens/`) for
  the commit it was copied at. ESTATE_STATE's repo table is a dated snapshot, not the answer.
- **A change here reaches no one by merging.** A pinning consumer gets it only through its own
  reviewed re-pin PR; a vendoring consumer never gets it unless that repo copies it in by hand.
- **Never describe a guard as enforcing more than it does** — the three gaps in §4 are real today.
- **Never write a contrast ratio in `CLAUDE.md`, a PR body or a `docs/` file as a fact** —
  contrast-guard scans only `tokens.css` and `README.md`. State ratios there, or link to them.

## 2. The release hold — load-bearing, do not route around it

- **A minor or major tag is HELD** by `.github/workflows/auto-tag.yml` unless the merge commit
  message contains `[release-approved]` (or the workflow is force-dispatched). A patch auto-tags.
- **Put `[release-approved]` in a merge commit only when the owner has approved that release.**
  Never add it to a commit to get a tag cut, and never force-dispatch on your own initiative.
- **Declaring or retiring an approved font family is a MINOR**, never a patch — it is design surface.
- **Semver:** patch = a value correction that keeps intent · minor = a new token, a role re-value or
  any change to declared design surface · major = a removed or renamed token.
- **Changing any value means bumping the version** in `package.json` and `surface-classes.json`.
- **Never move or delete a tag** — history rewrite is an owner gate, and consumers pin the SHAs.
- **No owner label exists in this repo's CI.** The 2026-10-04 directive retired `owner-go` and
  `dep-review-approved`; never request or apply them here. `[release-approved]` is a commit marker
  for the tag, not a merge gate.

## 3. The guards — what CI runs (`.github/workflows/ci.yml`, every PR and push to `main`)

- `npm run drift-guard` (`scripts/drift-guard.mjs`): `tokens.css` ↔ `tokens.js` and
  `typography.css` ↔ `typography.js` agree per role, every value equals the ratified canon, and
  `surface-classes.json` routes every surface to a known class.
- `npm run contrast-guard` (`scripts/contrast-guard.mjs`): every `N:1` in `tokens.css` and
  `README.md` must be a WCAG threshold, a ratio the guard measured, or tagged `[withdrawn]` on
  the same line; every `tokens.css` comment saying AA/AAA must carry a measured figure.
- `npm test` (`scripts/consumer-guard.test.mjs`): the shared consumer guard (`consumer-guard.js`).
- **Run all three before pushing**, and report each result exactly. Node 20 in CI.
- **Never hand-edit a contrast figure.** Change the hex, run contrast-guard, copy the number it prints.
- **A new contrast claim adds its pair to `CANON` (or `BELOW`)** in `contrast-guard.mjs`, same commit.
- **An AA claim with no computed figure is a defect**, not a softer claim. Name the ground and ratio.
- **Never weaken, skip or loosen a guard or test to make a change pass.** Fix the change.
- **A new guard is proven red before it is trusted** — restore the defect, watch it fail, restore.

## 4. Faces and surfaces — what the guard does NOT catch

- **A face added to `surface-classes.json` goes into `FLEET_FACES` in `consumer-guard.js` in the
  same commit.** `assertNoForbiddenFaces` scans only `FLEET_FACES`; an unlisted face is invisible.
- **Gap: deviation SCOPE is not enforced.** `approvedFamiliesForSurface` returns one `allowed` set
  per surface, so a scoped deviation's faces are allowed anywhere in that repo. Never claim a
  selector boundary is guarded.
- **Gap: Bricolage Grotesque and Geist are approved nowhere and are NOT in `FLEET_FACES`**, so a
  reappearance would not be flagged. Making a retired face permanently forbidden is the owner's call.
- **Gap: nothing asserts `surface-classes.json`'s `"version"` equals `package.json`'s.**
- **A deviation ADDS faces to a surface; the class families stay required.** Never replace them.
- **Retire a deviation rather than repurpose it** — an `approvedBy` stamp is for one decision on one
  date. Removal narrows the allowlist: byte-verify no consumer renders the face first.
- **A new deviation needs an owner ruling** naming its surface, scope, faces and date.

## 5. Values that are easy to get wrong (figures: README §5)

- **`--atk-brass` is a dark-ground colour.** On light grounds it is non-text UI only; for gold text
  on light use `--atk-gold-text`.
- **`--atk-gold-text` on `--atk-gold-tint` misses the body floor** — use `--atk-ink` for body copy
  on a gold tint.
- **`--atk-text-muted` is AA on `--atk-ground` and `--atk-panel` only**; anywhere else use
  `--atk-text-secondary`. `--atk-text-tertiary` is for dividers, never meaningful text or icons.
- **Type floors:** 17px readable body (`--atk-scale-4`) · 15px dense table cells (`--atk-scale-5`) ·
  12px labels only, never a sentence (`--atk-scale-6`).
- **Two classes, routed by job:** editorial (marketing/brand) and app (product). Routing lives in
  `surface-classes.json`; `aster-weather` is declared `outOfScope`, not missing.
- **cv05/cv08 are Inter variants — app class only.** Editorial's feature setting stays `normal`.
- **The v0.2.x `--atk-fs-*` scale and `--atk-font-sans` are frozen byte-identical** and deprecated;
  never change or remove them without a major.
- **Navy is role-split** (`navy-ui`, `navy-night`, deprecated `navy-legacy`); never collapse them.
- **Status, team and tenant colours are not in this package**; never add them without an owner ruling.

## 6. Working here

- **Branch + PR into `main`, keep `main` green.** `main` is protected; never push to it.
- **Ground against `origin/main`, never a working checkout** — `git fetch origin` first.
- **A PR that bumps the version holds for the owner** — never arm auto-merge on it.
- **README changes are guarded too**: any `N:1` you add or move in README runs through contrast-guard.
- **Keep the README the reference** and this file rules only; a fact goes to README, linked here.
- **Byte-verify a font's or token's real consumers across the estate before removing it.**

| | |
|---|---|
| Estate truth · cross-repo state · release policy | `aster-io` → `WHAT_IS_BUILT.md` · `ESTATE_STATE.md` · `AUTOMATION_CHARTER.md` |
| Guards, type, deviations, palette, semver | [`README.md`](README.md) §1–§7 |
| Superseded rules (old `§N` citations) | [`docs/CLAUDE_MD_ARCHIVE_2026-10-09.md`](docs/CLAUDE_MD_ARCHIVE_2026-10-09.md) |
