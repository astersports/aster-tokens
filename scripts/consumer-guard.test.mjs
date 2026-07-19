/**
 * Tests for the SFGC shared consumer font-guard (../consumer-guard.js).
 * Runs on Node's built-in test runner (`node --test`) — no dev dependencies.
 * Locks the two holes the divergent per-repo guards had: comment-inclusion and
 * substring (non-boundary) matching, plus scope-aware deviation allowance.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  approvedFamiliesForSurface,
  extractLoadedFamilies,
  assertLoadedFamilies,
  assertNoForbiddenFaces,
  assertBindings,
  assertConsumerDrift,
} from "../consumer-guard.js";

const IO_LINK =
  '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=IBM+Plex+Sans:wght@400&family=Instrument+Serif:ital@0;1&display=swap">';

test("approved family set is the class families + declared deviations", () => {
  assert.deepEqual(approvedFamiliesForSurface("aster-io").allowed.sort(),
    ["IBM Plex Mono", "IBM Plex Sans", "Instrument Serif"]);
  // aster-sports base app (Inter/IBM Plex Mono) + scoped Barlow deviation
  assert.ok(approvedFamiliesForSurface("aster-sports").allowed.includes("Barlow Condensed"));
  assert.ok(approvedFamiliesForSurface("aster-sports").allowed.includes("Inter"));
  // st-patricks base app + Fraunces heading deviation
  assert.ok(approvedFamiliesForSurface("st-patricks-armonk").allowed.includes("Fraunces"));
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
