/**
 * Package integrity drift-guard (v0.2.0).
 *
 * Asserts the package's two mirrors can never silently diverge:
 *   1. tokens.css      <-> tokens.js       (colors, hex per role)
 *   2. typography.css  <-> typography.js    (type values per role)
 *   3. surface-classes.json is well-formed  (the machine-readable deviation table)
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

/* ── 1. colors: tokens.css <-> tokens.js (hex) ─────────────────────────── */
const colorCss = read("../tokens.css");
const colorVars = Object.fromEntries(
  [...colorCss.matchAll(/--atk-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(([, k, v]) => [k, v.toUpperCase()]),
);
for (const [cssKey, hex] of Object.entries(colorVars)) {
  const jsVal = tokens[camel(cssKey)]?.toUpperCase();
  if (jsVal !== hex) {
    console.error(`DRIFT (color): --atk-${cssKey} = ${hex}  but  tokens.${camel(cssKey)} = ${jsVal ?? "MISSING"}`);
    failed++;
  }
}
const colorKeys = new Set(Object.keys(colorVars).map(camel));
for (const jsKey of Object.keys(tokens)) {
  if (!colorKeys.has(jsKey)) { console.error(`DRIFT (color): tokens.${jsKey} has no matching --atk-* in tokens.css`); failed++; }
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
    console.error(`OFF-CANON (color): tokens.${k} = ${tokens[k] ?? "MISSING"}  (ratified ${hex})`);
    failed++;
  }
}
for (const k of Object.keys(tokens)) {
  if (!(k in CANON)) { console.error(`OFF-CANON (color): tokens.${k} is not in the ratified canon set`); failed++; }
}

/* ── 2. type: typography.css <-> typography.js (values) ────────────────── */
const typeCss = read("../typography.css");
const typeVars = Object.fromEntries(
  [...typeCss.matchAll(/--atk-([a-z0-9-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, norm(v)]),
);
for (const [cssKey, val] of Object.entries(typeVars)) {
  const jsVal = typography[camel(cssKey)] === undefined ? undefined : norm(typography[camel(cssKey)]);
  if (jsVal !== val) {
    console.error(`DRIFT (type): --atk-${cssKey} = "${val}"  but  typography.${camel(cssKey)} = ${jsVal === undefined ? "MISSING" : `"${jsVal}"`}`);
    failed++;
  }
}
const typeKeys = new Set(Object.keys(typeVars).map(camel));
for (const jsKey of Object.keys(typography)) {
  if (!typeKeys.has(jsKey)) { console.error(`DRIFT (type): typography.${jsKey} has no matching --atk-* in typography.css`); failed++; }
}

/* ── 3. surface-classes.json well-formed ──────────────────────────────── */
let surfaces;
try {
  surfaces = JSON.parse(read("../surface-classes.json"));
} catch (e) {
  console.error(`DRIFT (surfaces): surface-classes.json does not parse — ${e.message}`);
  failed++;
}
if (surfaces) {
  if (!surfaces.uniformSystem || !Array.isArray(surfaces.uniformSystem.scalePx)) {
    console.error(`DRIFT (surfaces): missing uniformSystem.scalePx`); failed++;
  }
  const expectedScale = "24,20,17,15,13,11";
  if (surfaces.uniformSystem && surfaces.uniformSystem.scalePx.join(",") !== expectedScale) {
    console.error(`DRIFT (surfaces): scalePx = [${surfaces.uniformSystem.scalePx}] must be [${expectedScale}]`); failed++;
  }
  if (!surfaces.surfaces || Object.keys(surfaces.surfaces).length === 0) {
    console.error(`DRIFT (surfaces): no surfaces defined`); failed++;
  } else {
    for (const [name, s] of Object.entries(surfaces.surfaces)) {
      if (!s.body || !Array.isArray(s.repos) || s.repos.length === 0) {
        console.error(`DRIFT (surfaces): surface "${name}" needs a body face and a non-empty repos[]`); failed++;
      }
    }
  }
}

if (failed) {
  console.error(`\n✗ ${failed} mismatch(es) across the @aster/tokens mirrors.`);
  process.exit(1);
}
console.log(`✓ mirrors agree — ${Object.keys(colorVars).length} color tokens, ${Object.keys(typeVars).length} type values, ${Object.keys(surfaces.surfaces).length} surface classes.`);
