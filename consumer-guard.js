/**
 * @aster/tokens — SFGC: the SHARED consumer font-guard contract (v0.3.1+).
 *
 * ONE definition of "drift" for every consuming repo. Before this, each repo shipped its
 * own scripts/aster-tokens-drift-guard.mjs and they DIVERGED — one used substring matching,
 * one a comment-INCLUSIVE forbidden-face scan (false-trips on a comment), one a prefix-only
 * face assert (matches "Interstate"), one scanned only 2 files. Those are four private
 * opinions on drift, each with its own hole. This module is the single source of that logic:
 * a consumer keeps a THIN wrapper that reads ITS files, then calls these pure functions.
 *
 * PURE + repo-agnostic: every function takes already-extracted data (family lists, CSS text)
 * and returns a string[] of failures ([] = clean). No filesystem, no runtime deps — the
 * consumer's wrapper does the file IO, so this stays testable and the package stays values-only.
 *
 * Reads the package's own surface-classes.json so the approved family set per surface (incl.
 * declared deviations) is the contract, never hardcoded in a consumer.
 */
import { readFileSync } from "node:fs";

// Match the package's own drift-guard load style (no import-attributes dependency).
const surfaceClasses = JSON.parse(readFileSync(new URL("./surface-classes.json", import.meta.url), "utf8"));

/** Every webfont face the fleet knows about — the forbidden-scan candidate set. A face is
 *  forbidden for a surface iff it is NOT in that surface's `allowed` set. */
const FLEET_FACES = [
  "Inter", "Instrument Serif", "IBM Plex Sans", "IBM Plex Mono",
  "Fraunces", "Barlow Condensed", "Barlow", "Space Grotesk", "Space Mono",
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The base type class of a surface ("app+parish-deviation" -> "app"). */
export function baseClassOf(surfaceKey) {
  const s = surfaceClasses.surfaces?.[surfaceKey];
  if (!s) throw new Error(`SFGC: no surface "${surfaceKey}" in surface-classes.json`);
  return String(s.class).split("+")[0];
}

/**
 * The canonical family sets for a surface, straight from the contract:
 *   required = the base class's display/body/mono (must ALL load)
 *   allowed  = required + any DECLARED deviation faces (st-pat Fraunces headings; a scoped
 *              broadcast theme's faces) that are legitimately allowed to load
 * @returns {{surfaceKey:string, class:string, baseClass:string, required:string[], allowed:string[], deviation:object|undefined, scopedDeviations:object[]}}
 */
export function approvedFamiliesForSurface(surfaceKey) {
  const s = surfaceClasses.surfaces?.[surfaceKey];
  if (!s) throw new Error(`SFGC: no surface "${surfaceKey}" in surface-classes.json`);
  const cls = surfaceClasses.classes?.[baseClassOf(surfaceKey)];
  const required = cls ? [cls.display, cls.body, cls.mono] : [];
  const allowed = new Set(required);
  if (s.deviation?.headings) allowed.add(s.deviation.headings);
  for (const d of s.scopedDeviations ?? []) {
    for (const face of [d.display, d.body, d.mono]) if (face) allowed.add(face);
  }
  return {
    surfaceKey, class: s.class, baseClass: baseClassOf(surfaceKey),
    required, allowed: [...allowed], deviation: s.deviation, scopedDeviations: s.scopedDeviations ?? [],
  };
}

/** Strip CSS comments so a face/token merely MENTIONED in a comment never trips a scan
 *  (closes the comment-inclusive false-trip). */
export function stripCssComments(css) {
  return String(css).replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Canonical parser for the families in a Google-Fonts css2 <link> (or the whole HTML).
 *  ONE regex for every consumer, so the load-set is read the same way everywhere. */
export function extractLoadedFamilies(htmlOrLink) {
  const out = [];
  for (const link of String(htmlOrLink).matchAll(/css2\?([^"'\s>]+)/g)) {
    for (const fam of link[1].matchAll(/(?:^|[?&])family=([^:&]+)/g)) {
      out.push(decodeURIComponent(fam[1].replace(/\+/g, " ")).trim());
    }
  }
  return [...new Set(out)];
}

/** Assert the LOAD surface: only approved families load, and every required class family is
 *  present. (Deviation faces are allowed to load — a font must load to render; per-scope
 *  enforcement of a scoped deviation is a binding-level concern, see assertNoForbiddenFaces.) */
export function assertLoadedFamilies(surfaceKey, loadedFamilies) {
  const { required, allowed } = approvedFamiliesForSurface(surfaceKey);
  const fails = [];
  for (const f of loadedFamilies) {
    if (!allowed.includes(f)) fails.push(`load: non-approved family "${f}" (allowed for ${surfaceKey}: [${allowed.join(", ")}])`);
  }
  for (const f of required) {
    if (!loadedFamilies.includes(f)) fails.push(`load: missing required class family "${f}"`);
  }
  return fails;
}

/** Comment-EXCLUDING, boundary-anchored forbidden-face scan of rendered CSS. Flags any fleet
 *  face NOT allowed for the surface, matched only as a QUOTED family token ('Barlow') so it
 *  cannot false-match a substring (e.g. "Interstate") and cannot trip on a comment mention. */
export function assertNoForbiddenFaces(surfaceKey, cssText) {
  const { allowed } = approvedFamiliesForSurface(surfaceKey);
  const code = stripCssComments(cssText);
  const fails = [];
  for (const face of FLEET_FACES) {
    if (allowed.includes(face)) continue;
    if (new RegExp(`["']${escapeRe(face)}["']`).test(code)) {
      fails.push(`face: forbidden "${face}" present in rendered CSS (not allowed for ${surfaceKey})`);
    }
  }
  return fails;
}

/** Assert each local token BINDS its class role (value === `var(--atk-<role>)`), not merely
 *  mentions it — a real binding assert, comment-excluded. `bindings` = [{local, role}], e.g.
 *  { local: "--serif", role: "--atk-ed-display" }. */
export function assertBindings(cssText, bindings) {
  const code = stripCssComments(cssText);
  const fails = [];
  for (const { local, role } of bindings) {
    const re = new RegExp(`${escapeRe(local)}\\s*:\\s*var\\(\\s*${escapeRe(role)}\\s*\\)`);
    if (!re.test(code)) fails.push(`bind: ${local} must bind var(${role})`);
  }
  return fails;
}

/**
 * Umbrella check a consumer's thin wrapper calls with its extracted repo facts.
 * @param {{surfaceKey:string, html?:string, css?:string, bindings?:{local:string,role:string}[]}} input
 * @returns {{ok:boolean, failures:string[], approved:ReturnType<typeof approvedFamiliesForSurface>}}
 */
export function assertConsumerDrift({ surfaceKey, html, css, bindings }) {
  const approved = approvedFamiliesForSurface(surfaceKey);
  const failures = [];
  if (typeof html === "string") failures.push(...assertLoadedFamilies(surfaceKey, extractLoadedFamilies(html)));
  if (typeof css === "string") failures.push(...assertNoForbiddenFaces(surfaceKey, css));
  if (typeof css === "string" && Array.isArray(bindings)) failures.push(...assertBindings(css, bindings));
  return { ok: failures.length === 0, failures, approved };
}
