# Known gaps in the guard, and the live consumer pins

**Moved out of `CLAUDE.md` on 2026-08-18** under [the doc doctrine](https://github.com/astersports/aster-io/blob/main/docs/DOC_DOCTRINE.md).
Nothing was deleted. **Every claim below was re-verified against `origin/main` of each consumer
on 2026-08-18** — see the correction at the foot of this file.

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

### 2. Deviation scope is NOT enforced by this package

`approvedFamiliesForSurface` returns one `allowed` set **per surface**, not per scope.
Figtree is therefore allowed anywhere in `aster-io`, not only under `.ah`. The guard can
catch a face crossing a **repo** boundary; it cannot catch one crossing a **selector**
boundary. Enforcing `.ah`-only is a consumer-side concern and is not solved here — do not
claim the contract enforces it.

### 3. Retired faces are still unscannable

`Bricolage Grotesque` and `Geist` are in no surface's `allowed` set, but they are also not
in `FLEET_FACES` — so a reappearance would not be flagged either. Verified absent from all
five repos. Flagged, not fixed: making a retired face permanently forbidden is a policy call
for the owner, not a doc edit.

### 4. `surface-classes.json` version string lags

`surface-classes.json` says `"version": "0.3.2"` while `package.json` says `0.4.0` — confirmed
again 2026-08-18. The file's own `ruling` field documents the v0.4.0 change correctly, so the
content is right and only the version string is stale. Nothing reads that field
programmatically — no guard asserts it — but it is the kind of drift this package exists to
make impossible, so it should be corrected on the next release rather than left.

## Consumer pins — verified against `origin/main`, 2026-08-18

| Repo | Pinned SHA | = version |
|---|---|---|
| **aster-io** | **`6c83711`** | **v0.4.0** |
| aster-sports | `a1c10f6` | v0.3.1 |
| aster-studio | `a1c10f6` | v0.3.1 |
| nova-select | `a1c10f6` | v0.3.1 |
| st-patricks-armonk | `a1c10f6` | v0.3.1 |

**aster-io is on v0.4.0 and Figtree is live on astersports.io.** The other four are on v0.3.1.

Consumers pin by **SHA**, not tag. Rollback = re-pin the previous SHA. Every hop is
versioned, reviewable, reversible — and version-bump PRs are **never auto-merged**.

> ⚠ **Correction, 2026-08-18.** The previous version of this table said aster-io was on
> `b44d154` (v0.3.2) and stated *"No consumer is on v0.4.0 yet… aster-io's re-pin to `6c83711`
> exists on the unmerged branch `chore/figtree-repin`; its `main` is still on v0.3.2. Anyone
> stating 'aster-io is on v0.4.0' is describing a branch, not `main`."* **That branch merged**
> (aster-io #180). Read from `origin/main` of each consumer, never from this table — the table
> is a snapshot and this is the second time it has gone stale between sessions.
