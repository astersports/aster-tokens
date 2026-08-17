/**
 * Tests for the SFGC shared consumer font-guard (../consumer-guard.js).
 * Runs on Node's built-in test runner (`node --test`) — no dev dependencies.
 * Locks the two holes the divergent per-repo guards had: comment-inclusion and
 * substring (non-boundary) matching, plus scope-aware deviation allowance.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  approvedFamiliesForSurface,
  extractLoadedFamilies,
  assertLoadedFamilies,
  assertNoForbiddenFaces,
  assertBindings,
  assertConsumerDrift,
} from "../consumer-guard.js";

/* Read the contract the same way consumer-guard.js does (no import-attributes dependency). */
const surfaceClasses = JSON.parse(
  readFileSync(new URL("../surface-classes.json", import.meta.url), "utf8"),
);

const IO_LINK =
  '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=IBM+Plex+Sans:wght@400&family=Instrument+Serif:ital@0;1&display=swap">';

test("approved family set is the class families + declared deviations", () => {
  // aster-io editorial base + the scoped "storefront" body-face deviation (v0.3.3).
  // Figtree is the ONLY addition: display and mono are unchanged from the class, so they
  // appear once, not twice.
  assert.deepEqual(approvedFamiliesForSurface("aster-io").allowed.sort(),
    ["Figtree", "IBM Plex Mono", "IBM Plex Sans", "Instrument Serif"]);
  // the base three are still REQUIRED — a deviation adds, it never replaces
  assert.deepEqual(approvedFamiliesForSurface("aster-io").required.sort(),
    ["IBM Plex Mono", "IBM Plex Sans", "Instrument Serif"]);
  // aster-sports base app (Inter/IBM Plex Mono) + scoped Barlow deviation
  assert.ok(approvedFamiliesForSurface("aster-sports").allowed.includes("Barlow Condensed"));
  assert.ok(approvedFamiliesForSurface("aster-sports").allowed.includes("Inter"));
  // st-patricks base app + Fraunces heading deviation
  assert.ok(approvedFamiliesForSurface("st-patricks-armonk").allowed.includes("Fraunces"));

  // A deviation is SCOPED: widening one surface must not widen any other. This is
  // the assertion that stops "approved for the storefront" quietly becoming
  // "approved everywhere", which is the whole failure mode the contract exists
  // to prevent.
  for (const other of ["aster-sports", "aster-studio", "nova-select", "st-patricks-armonk"]) {
    const a = approvedFamiliesForSurface(other).allowed;
    assert.ok(!a.includes("Figtree"), `${other} must not inherit Figtree`);
  }
});

/* A RETIRED DEVIATION MUST ACTUALLY NARROW THE ALLOWLIST.
   'night' (Bricolage Grotesque + Geist) was withdrawn on 2026-08-16 when that front door
   was reverted and night.css deleted. Removing a deviation is the only operation here that
   REMOVES permission, so it is the only one that can silently leave a face renderable with
   nothing sanctioning it. This asserts the retirement took, everywhere. */
test("a retired deviation's faces are approved for NO surface", () => {
  const surfaces = ["aster-io", "aster-sports", "aster-studio", "nova-select", "st-patricks-armonk"];
  for (const face of ["Bricolage Grotesque", "Geist"]) {
    for (const s of surfaces) {
      assert.ok(!approvedFamiliesForSurface(s).allowed.includes(face),
        `retired face "${face}" is still approved for ${s}`);
    }
  }
});

test("unknown surface throws (fail-loud, never silent)", () => {
  assert.throws(() => approvedFamiliesForSurface("nope"), /no surface/);
});

test("extractLoadedFamilies parses the css2 link", () => {
  assert.deepEqual(extractLoadedFamilies(IO_LINK).sort(),
    ["IBM Plex Mono", "IBM Plex Sans", "Instrument Serif"]);
});

test("load check: flags a non-approved family, and a missing required one", () => {
  assert.deepEqual(assertLoadedFamilies("aster-io", ["Instrument Serif", "IBM Plex Sans", "IBM Plex Mono"]), []);
  assert.ok(assertLoadedFamilies("aster-io", ["Inter", "IBM Plex Sans", "IBM Plex Mono"])
    .some((f) => /non-approved family "Inter"/.test(f)));
  assert.ok(assertLoadedFamilies("aster-io", ["Instrument Serif", "IBM Plex Sans"])
    .some((f) => /missing required class family "IBM Plex Mono"/.test(f)));
});

test("HOLE 1 — a face mentioned only in a COMMENT does not trip", () => {
  const css = '/* migrated off Space Grotesk to Instrument Serif */ :root{ --serif: var(--atk-ed-display); }';
  assert.deepEqual(assertNoForbiddenFaces("aster-io", css), []);
});

test("a real quoted-literal leak DOES trip", () => {
  assert.ok(assertNoForbiddenFaces("aster-io", ':root{ --serif: "Space Grotesk", sans-serif; }')
    .some((f) => /forbidden "Space Grotesk"/.test(f)));
});

test("HOLE 2 — 'Interstate' does not false-match the 'Inter' family", () => {
  assert.deepEqual(assertNoForbiddenFaces("aster-io", ':root{ --x: "Interstate"; }'), []);
});

test("scope: Barlow is allowed for aster-sports, forbidden for aster-io", () => {
  assert.deepEqual(assertNoForbiddenFaces("aster-sports", ':root{ --bc: "Barlow Condensed"; }'), []);
  assert.ok(assertNoForbiddenFaces("aster-io", ':root{ --x: "Barlow Condensed"; }').length > 0);
});

/* ⚑ REGRESSION — THE FLEET_FACES OMISSION (fixed 2026-08-17).
   `Figtree` was declared as aster-io's approved `storefront` body face in
   surface-classes.json (v0.4.0) but never added to FLEET_FACES in consumer-guard.js.
   `assertNoForbiddenFaces` iterates FLEET_FACES, so an unlisted face is INVISIBLE to it:
   before the fix, `assertNoForbiddenFaces("aster-sports", "font-family:'Figtree'")`
   returned [] — a clean pass on a face approved for exactly one other repo.
   Reverting the FLEET_FACES line fails the first assertion below.

   This is the general hazard, not a Figtree quirk: declaring a face APPROVED somewhere
   does not make it FORBIDDEN elsewhere unless the face is also in the scan's candidate
   set. Every face added to surface-classes.json must be added to FLEET_FACES too. */
test("a face approved for ONE surface is forbidden — and detectable — on the others", () => {
  for (const other of ["aster-sports", "aster-studio", "nova-select", "st-patricks-armonk"]) {
    const fails = assertNoForbiddenFaces(other, ":root{ --body: 'Figtree', sans-serif; }");
    assert.ok(
      fails.some((f) => /forbidden "Figtree"/.test(f)),
      `${other} must FLAG a Figtree leak — it is approved only for aster-io's storefront scope`,
    );
  }
  // and it stays clean where it is genuinely approved
  assert.deepEqual(assertNoForbiddenFaces("aster-io", ":root{ --body: 'Figtree', sans-serif; }"), []);
});

/* Every face named anywhere in the contract must be scannable. This is the fence that
   stops the omission recurring for the NEXT deviation rather than only for Figtree. */
test("every face in surface-classes.json is in the forbidden-scan candidate set", () => {
  const declared = new Set();
  for (const cls of Object.values(surfaceClasses.classes ?? {})) {
    for (const f of [cls.display, cls.body, cls.mono]) if (f) declared.add(f);
  }
  for (const s of Object.values(surfaceClasses.surfaces ?? {})) {
    if (s.deviation?.headings) declared.add(s.deviation.headings);
    for (const d of s.scopedDeviations ?? []) {
      for (const f of [d.display, d.body, d.mono]) if (f) declared.add(f);
    }
  }
  // A declared face absent from FLEET_FACES cannot be flagged on any surface that
  // does not allow it — so the declaration would be unenforceable.
  for (const face of declared) {
    const unrelated = ["aster-io", "aster-sports", "aster-studio", "nova-select", "st-patricks-armonk"]
      .find((s) => !approvedFamiliesForSurface(s).allowed.includes(face));
    if (!unrelated) continue; // allowed everywhere: nothing to flag
    assert.ok(
      assertNoForbiddenFaces(unrelated, `:root{ --x: "${face}"; }`).length > 0,
      `"${face}" is declared in surface-classes.json but is not in FLEET_FACES, so a leak ` +
        `into ${unrelated} cannot be detected`,
    );
  }
});

test("bindings assert var() binding, not a mere mention", () => {
  assert.deepEqual(assertBindings(':root{ --serif: var(--atk-ed-display); }',
    [{ local: "--serif", role: "--atk-ed-display" }]), []);
  // a comment mention of the role is NOT a binding
  assert.ok(assertBindings('/* --serif should be var(--atk-ed-display) */ :root{ --serif: "x"; }',
    [{ local: "--serif", role: "--atk-ed-display" }]).length > 0);
});

test("assertConsumerDrift umbrella returns ok for a clean editorial surface", () => {
  const css = ":root{ --serif: var(--atk-ed-display); --sans: var(--atk-ed-body); --mono: var(--atk-ed-mono); }";
  const r = assertConsumerDrift({
    surfaceKey: "aster-io",
    html: IO_LINK,
    css,
    bindings: [
      { local: "--serif", role: "--atk-ed-display" },
      { local: "--sans", role: "--atk-ed-body" },
      { local: "--mono", role: "--atk-ed-mono" },
    ],
  });
  assert.equal(r.ok, true, r.failures.join("; "));
});
