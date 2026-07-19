/**
 * Package integrity drift-guard (v0.3.1).
 *
 * Asserts the package's mirrors + ratified contract can never silently diverge:
 *   1.  tokens.css      <-> tokens.js      (colors, hex per role)
 *   1b. colors assert the RATIFIED CANON   (a wrong value can't be "source of truth")
 *   2.  typography.css  <-> typography.js   (type values per role)
 *   2b. type roles assert the RATIFIED TYPE CONTRACT (families, cv05/cv08, scale)
 *   3.  surface-classes.json well-formed + coherent with the type roles
 * Runs in @aster/tokens CI on every PR.
 *
 * NOTE: this is the PACKAGE-internal guard. The CONSUMER-side drift-guard — which
 * asserts a consuming repo's LOCAL token values equal these canonical values AND that
 * the repo only loads the font families approved for its surface class in
 * surface-classes.json — lives in each consuming repo (mandatory backstop, per the
 * propagation rulings). See README → "Drift-guard (consumer side)" for the pattern.
 */
import { readFileSync } from "node:fs";
import { tokens } from "../tokens.js";
import { typography } from "../typography.js";

const read = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const norm = (s) => String(s).trim().replace(/\s+/g, " ");
let failed = 0;
const fail = (msg) => { console.error(msg); failed++; };

/* ── 1. colors: tokens.css <-> tokens.js (hex) ─────────────────────────── */
const colorCss = read("../tokens.css");
const colorVars = Object.fromEntries(
  [...colorCss.matchAll(/--atk-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(([, k, v]) => [k, v.toUpperCase()]),
);
for (const [cssKey, hex] of Object.entries(colorVars)) {
  const jsVal = tokens[camel(cssKey)]?.toUpperCase();
  if (jsVal !== hex) fail(`DRIFT (color): --atk-${cssKey} = ${hex}  but  tokens.${camel(cssKey)} = ${jsVal ?? "MISSING"}`);
}
const colorKeys = new Set(Object.keys(colorVars).map(camel));
for (const jsKey of Object.keys(tokens)) {
  if (!colorKeys.has(jsKey)) fail(`DRIFT (color): tokens.${jsKey} has no matching --atk-* in tokens.css`);
}

/* ── 1b. colors: assert the RATIFIED CANONICAL values ──────────────────────
   The css<->js check above only proves the two mirrors AGREE — it cannot catch a
   value that is wrong in BOTH (e.g. gold shipped as #b8860b in css AND js). This
   pins every color to the architect-ratified .io palette, so a wrong gold can never
   become the "source of truth" the propagation layer faithfully spreads. */
const CANON = {
  ground: "#FCFBF9", panel: "#FFFFFF", panelHover: "#F9F8F4",
  surfaceSecondary: "#F1EFE9", surfaceTertiary: "#EAE7DF",
  ink: "#0B1B3B", textSecondary: "#4A5568", textMuted: "#6B7488", textTertiary: "#8896AB",
  border: "#E6E4DC", borderSubtle: "#EDEAE2", textOnDark: "#F5F0E8",
  navyUi: "#12244D", navyNight: "#0A1430", navyLegacy: "#151525",
  gold: "#C9952E", goldHi: "#D4A843", goldText: "#8F6708", goldTint: "#F4E9CF", brass: "#B9871F",
};
for (const [k, hex] of Object.entries(CANON)) {
  if ((tokens[k] ?? "").toUpperCase() !== hex.toUpperCase()) {
    fail(`OFF-CANON (color): tokens.${k} = ${tokens[k] ?? "MISSING"}  (ratified ${hex})`);
  }
}
for (const k of Object.keys(tokens)) {
  if (!(k in CANON)) fail(`OFF-CANON (color): tokens.${k} is not in the ratified canon set`);
}

/* ── 2. type: typography.css <-> typography.js (values) ────────────────── */
const typeCss = read("../typography.css");
const typeVars = Object.fromEntries(
  [...typeCss.matchAll(/--atk-([a-z0-9-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, norm(v)]),
);
for (const [cssKey, val] of Object.entries(typeVars)) {
  const jsVal = typography[camel(cssKey)] === undefined ? undefined : norm(typography[camel(cssKey)]);
  if (jsVal !== val) {
    fail(`DRIFT (type): --atk-${cssKey} = "${val}"  but  typography.${camel(cssKey)} = ${jsVal === undefined ? "MISSING" : `"${jsVal}"`}`);
  }
}
const typeKeys = new Set(Object.keys(typeVars).map(camel));
for (const jsKey of Object.keys(typography)) {
  if (!typeKeys.has(jsKey)) fail(`DRIFT (type): typography.${jsKey} has no matching --atk-* in typography.css`);
}

/* ── 2b. type: assert the RATIFIED TYPE CONTRACT (Fleet Standard 2026-07-17) ──
   The css<->js parity above only proves the mirrors AGREE. This pins the actual
   ratified families, the cv05/cv08 class split, and the scale — so a role can never
   resolve to the wrong stack while still passing parity. Assert on the js object
   (parity already proved css===js). */
const has = (v, sub) => typeof v === "string" && v.includes(sub);
/* Editorial roles resolve to Instrument Serif / IBM Plex Sans / IBM Plex Mono. */
if (!has(typography.edDisplay, "Instrument Serif")) fail(`TYPE-CONTRACT: edDisplay must be Instrument Serif — got "${typography.edDisplay}"`);
if (!has(typography.edBody, "IBM Plex Sans"))       fail(`TYPE-CONTRACT: edBody must be IBM Plex Sans — got "${typography.edBody}"`);
if (!has(typography.edMono, "IBM Plex Mono"))       fail(`TYPE-CONTRACT: edMono must be IBM Plex Mono — got "${typography.edMono}"`);
/* App-clean roles resolve to Inter / Inter / IBM Plex Mono. */
if (!has(typography.appDisplay, "Inter"))           fail(`TYPE-CONTRACT: appDisplay must be Inter — got "${typography.appDisplay}"`);
if (!has(typography.appBody, "Inter"))              fail(`TYPE-CONTRACT: appBody must be Inter — got "${typography.appBody}"`);
if (!has(typography.appMono, "IBM Plex Mono"))      fail(`TYPE-CONTRACT: appMono must be IBM Plex Mono — got "${typography.appMono}"`);
/* cv05/cv08 are Inter (App-clean) ONLY. Assert the POSITIVE on app + the NEGATIVE on ed. */
if (!has(typography.appFeatureLegibility, "cv05") || !has(typography.appFeatureLegibility, "cv08")) {
  fail(`TYPE-CONTRACT: appFeatureLegibility must carry cv05 AND cv08 — got "${typography.appFeatureLegibility}"`);
}
if (norm(typography.edFeatureLegibility) !== "normal" || has(typography.edFeatureLegibility, "cv0")) {
  fail(`TYPE-CONTRACT: edFeatureLegibility must be 'normal' with NO cv05/cv08 (Plex does not honor them) — got "${typography.edFeatureLegibility}"`);
}
/* Ratified scale — 34/24/20/17/15/12, scale4 (17px) is the readable-body floor. */
const SCALE = { scale1: "34px", scale2: "24px", scale3: "20px", scale4: "17px", scale5: "15px", scale6: "12px" };
for (const [k, px] of Object.entries(SCALE)) {
  if (norm(typography[k]) !== px) fail(`TYPE-CONTRACT: ${k} must be ${px} — got "${typography[k]}"`);
}
if (norm(typography.numeric) !== "tabular-nums") fail(`TYPE-CONTRACT: numeric must be tabular-nums — got "${typography.numeric}"`);

/* ── 3. surface-classes.json well-formed + coherent with the type roles ── */
let surfaces;
try {
  surfaces = JSON.parse(read("../surface-classes.json"));
} catch (e) {
  fail(`DRIFT (surfaces): surface-classes.json does not parse — ${e.message}`);
}
if (surfaces) {
  const expectedScale = "34,24,20,17,15,12";
  if (!surfaces.uniformSystem || !Array.isArray(surfaces.uniformSystem.scalePx)) {
    fail(`DRIFT (surfaces): missing uniformSystem.scalePx`);
  } else if (surfaces.uniformSystem.scalePx.join(",") !== expectedScale) {
    fail(`DRIFT (surfaces): scalePx = [${surfaces.uniformSystem.scalePx}] must be [${expectedScale}]`);
  }
  if (surfaces.uniformSystem && surfaces.uniformSystem.readableBodyFloorPx !== 17) {
    fail(`DRIFT (surfaces): readableBodyFloorPx must be 17 — got ${surfaces.uniformSystem?.readableBodyFloorPx}`);
  }

  /* Two classes, each mapped to the type roles the package actually ships. */
  const classFaces = {
    editorial: { display: "Instrument Serif", body: "IBM Plex Sans", mono: "IBM Plex Mono", role: "ed" },
    app:       { display: "Inter",            body: "Inter",         mono: "IBM Plex Mono", role: "app" },
  };
  if (!surfaces.classes) fail(`DRIFT (surfaces): missing classes{}`);
  for (const [cls, want] of Object.entries(classFaces)) {
    const c = surfaces.classes?.[cls];
    if (!c) { fail(`DRIFT (surfaces): missing classes.${cls}`); continue; }
    for (const slot of ["display", "body", "mono"]) {
      if (c[slot] !== want[slot]) fail(`DRIFT (surfaces): classes.${cls}.${slot} = "${c[slot]}" must be "${want[slot]}"`);
      // coherence: the class's declared face must appear in the matching type role token
      const roleVal = typography[`${want.role}${slot[0].toUpperCase()}${slot.slice(1)}`];
      if (!has(roleVal, want[slot])) fail(`DRIFT (surfaces): classes.${cls}.${slot} "${want[slot]}" not present in --atk-${want.role}-${slot} ("${roleVal}")`);
    }
  }
  // cv05/cv08 belong to app class only
  if (surfaces.classes?.app && JSON.stringify(surfaces.classes.app.legibilityFeatures) !== JSON.stringify(["cv05", "cv08"])) {
    fail(`DRIFT (surfaces): classes.app.legibilityFeatures must be ["cv05","cv08"]`);
  }
  if (surfaces.classes?.editorial && (surfaces.classes.editorial.legibilityFeatures || []).length !== 0) {
    fail(`DRIFT (surfaces): classes.editorial.legibilityFeatures must be [] (Plex has no cv05/cv08)`);
  }

  /* Every surface routes to a known class + names its repos. */
  const validClasses = new Set(["editorial", "app", "app+parish-deviation"]);
  if (!surfaces.surfaces || Object.keys(surfaces.surfaces).length === 0) {
    fail(`DRIFT (surfaces): no surfaces defined`);
  } else {
    for (const [name, s] of Object.entries(surfaces.surfaces)) {
      if (!validClasses.has(s.class)) fail(`DRIFT (surfaces): surface "${name}" has unknown class "${s.class}"`);
      if (!Array.isArray(s.repos) || s.repos.length === 0) fail(`DRIFT (surfaces): surface "${name}" needs a non-empty repos[]`);
    }
  }
}

if (failed) {
  console.error(`\n✗ ${failed} mismatch(es) in the @aster/tokens contract.`);
  process.exit(1);
}
const nSurfaces = surfaces?.surfaces ? Object.keys(surfaces.surfaces).length : 0;
console.log(`✓ contract holds — ${Object.keys(colorVars).length} color tokens, ${Object.keys(typeVars).length} type values, 2 classes, ${nSurfaces} surfaces.`);
