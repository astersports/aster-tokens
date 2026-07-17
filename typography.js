/**
 * @aster/tokens — canonical Aster type values (v0.3.0), JS/TS mirror of typography.css.
 * Values-only. Keep in EXACT sync with typography.css — `npm run drift-guard` (CI) enforces it.
 *
 * Two surface classes, one palette (Fleet Type & Design Standard, architect 2026-07-17):
 *   Editorial  = Instrument Serif / IBM Plex Sans / IBM Plex Mono  (marketing/brand)
 *   App-clean  = Inter / Inter / IBM Plex Mono                     (product)
 * cv05/cv08 (Inter legibility variants) are App-clean ONLY — Editorial is 'normal'.
 */
export const typography = {
  /* Type roles — Editorial (marketing/brand). */
  edDisplay: "'Instrument Serif', 'Times New Roman', serif",
  edBody:    "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  edMono:    "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace",

  /* Type roles — App-clean (product). */
  appDisplay: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  appBody:    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  appMono:    "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace",

  /* Per-class legibility — App-clean gets Inter cv05/cv08; Editorial explicitly none. */
  appFeatureLegibility: "'cv05', 'cv08'",
  edFeatureLegibility:  "normal",

  /* Ratified scale — 34/24/20/17/15/12. 17 = readable-body floor, 12 = label-only floor. */
  scale1: "34px",
  scale2: "24px",
  scale3: "20px",
  scale4: "17px",
  scale5: "15px",
  scale6: "12px",
  numeric: "tabular-nums",

  /* Weights + line-heights (shared, unchanged from v0.2.0). */
  fwRegular:  "400",
  fwMedium:   "500",
  fwSemibold: "600",
  fwBold:     "700",
  lhTight: "1.2",
  lhBody:  "1.5",

  /* Back-compat (v0.2.0) — FROZEN byte-identical so no wired consumer moves.
     DEPRECATED: migrate to the class roles + --atk-scale-*; dropped in a later major. */
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  fontFeatureLegibility: "'cv05', 'cv08'",
  fsDisplay: "24px",
  fsTitle:   "20px",
  fsHeading: "17px",
  fsBody:    "15px",
  fsMeta:    "13px",
  fsLabel:   "11px",
};

export default typography;
