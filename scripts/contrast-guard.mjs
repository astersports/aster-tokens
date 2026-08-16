/**
 * Contrast guard — the documented AA figures must equal the measured ones.
 *
 * WHY THIS EXISTS (the defect it was written for):
 *   drift-guard.mjs pins every HEX to the ratified canon, and its own comment makes the
 *   argument that matters here — two mirrors agreeing "cannot catch a value that is wrong
 *   in BOTH". The same hole existed one level up. The guard pinned the hex; nothing
 *   pinned the CONTRAST CLAIM attached to it. So `--atk-brass: #B9871F` shipped for
 *   months annotated "(AA 4.6:1)" while measuring 3.10:1 on --atk-ground — a figure that
 *   is not merely imprecise but inverts the token's meaning, turning a dark-ground text
 *   colour into an apparently-AA light-UI text colour. Every consumer that read the
 *   package got the wrong answer, and no guard could see it, because a comment is not a
 *   value. --atk-gold-text carried the same defect (documented 6.8:1, measures 4.94:1).
 *
 * WHAT IT ASSERTS
 *   1. Every pair in CANON re-derives to its declared ratio (WCAG 2.1) — so changing a
 *      hex without re-measuring fails, and a hand-edited figure fails.
 *   2. Every pair clears the floor its declared ROLE requires — so a token documented as
 *      body-text-on-light cannot ship below 4.5:1.
 *   3. Every `N:1` written anywhere in tokens.css / README.md is either a WCAG threshold,
 *      a figure this guard computed, or explicitly tagged `[withdrawn]`. A stale claim
 *      cannot sit quietly in prose.
 */
import { readFileSync } from "node:fs";

const read = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");

/* ── WCAG 2.1 relative luminance + contrast ratio ──────────────────────── */
const chan = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};
const r2 = (n) => Math.round(n * 100) / 100;

/* ── floors ────────────────────────────────────────────────────────────── */
const FLOOR = { body: 4.5, large: 3, ui: 3 };

/* ── the ratified, MEASURED contrast canon ─────────────────────────────────
   role = the strongest use the pair is approved for. Adding a pair here without
   measuring it will fail immediately, which is the point. */
const CANON = [
  // gold-text is the gold TEXT colour on light. It clears AA body — but at 4.94, not 6.8.
  { fg: "#8F6708", bg: "#FCFBF9", was: "gold-text on ground", role: "body", ratio: 4.94 },
  { fg: "#8F6708", bg: "#FFFFFF", was: "gold-text on panel", role: "body", ratio: 5.11 },

  // brass is a DARK-ground text colour. On light it is non-text UI at best.
  { fg: "#B9871F", bg: "#12244D", was: "brass on navy-ui", role: "body", ratio: 4.73 },
  { fg: "#B9871F", bg: "#0A1430", was: "brass on navy-night", role: "body", ratio: 5.67 },
  { fg: "#B9871F", bg: "#FCFBF9", was: "brass on ground", role: "ui", ratio: 3.1 },
  { fg: "#B9871F", bg: "#FFFFFF", was: "brass on panel", role: "ui", ratio: 3.21 },
  { fg: "#B9871F", bg: "#F9F8F4", was: "brass on panel-hover", role: "ui", ratio: 3.02 },

  // the canonical gold text on the canonical gold panel is NOT body-safe (4.23 < 4.5).
  { fg: "#8F6708", bg: "#F4E9CF", was: "gold-text on gold-tint", role: "large", ratio: 4.23 },
  { fg: "#0B1B3B", bg: "#F4E9CF", was: "ink on gold-tint", role: "body", ratio: 14.1 },

  // gold / gold-hi are fills and dark-ground text — never light-ground text.
  { fg: "#C9952E", bg: "#12244D", was: "gold on navy-ui", role: "body", ratio: 5.65 },
  { fg: "#D4A843", bg: "#12244D", was: "gold-hi on navy-ui", role: "body", ratio: 6.84 },
];

/* Pairs that are BELOW every floor and must stay documented as unusable. Listing them
   here asserts they really are that bad — if a hex moves and one becomes usable, this
   fails and the docs get revisited rather than silently under-claiming. */
const UNUSABLE = [
  { fg: "#B9871F", bg: "#F1EFE9", was: "brass on surface-secondary", ratio: 2.79 },
  { fg: "#B9871F", bg: "#EAE7DF", was: "brass on surface-tertiary", ratio: 2.6 },
  { fg: "#B9871F", bg: "#F4E9CF", was: "brass on gold-tint", ratio: 2.66 },
  { fg: "#C9952E", bg: "#FCFBF9", was: "gold on ground", ratio: 2.6 },
  { fg: "#D4A843", bg: "#FCFBF9", was: "gold-hi on ground", ratio: 2.14 },
];

let failed = 0;
const fail = (m) => { console.error(`  ✗ ${m}`); failed++; };

/* ── 1 + 2. measured == declared, and clears its role's floor ──────────── */
for (const c of CANON) {
  const got = r2(ratio(c.fg, c.bg));
  if (got !== c.ratio) {
    fail(`STALE FIGURE: ${c.was} is documented ${c.ratio}:1 but measures ${got}:1`);
  }
  const floor = FLOOR[c.role];
  if (got < floor) {
    fail(`BELOW FLOOR: ${c.was} = ${got}:1, but role "${c.role}" requires >=${floor}:1`);
  }
}
for (const c of UNUSABLE) {
  const got = r2(ratio(c.fg, c.bg));
  if (got !== c.ratio) fail(`STALE FIGURE: ${c.was} is documented ${c.ratio}:1 but measures ${got}:1`);
  if (got >= 3) fail(`${c.was} = ${got}:1 now clears 3:1 — it is listed as unusable; re-document it`);
}

/* ── 3. no undeclared or stale ratio may appear in the docs ────────────── */
const COMPUTED = new Set([...CANON, ...UNUSABLE].map((c) => r2(ratio(c.fg, c.bg)).toFixed(2)));
const THRESHOLDS = new Set(["3.00", "4.50", "7.00"]);
for (const file of ["../tokens.css", "../README.md"]) {
  const text = read(file);
  text.split("\n").forEach((line, i) => {
    for (const m of line.matchAll(/(\d+(?:\.\d+)?):1/g)) {
      const n = Number(m[1]).toFixed(2);
      if (THRESHOLDS.has(n) || COMPUTED.has(n)) continue;
      // a withdrawn figure must say so on the same line
      if (/\[withdrawn\]/i.test(line)) continue;
      fail(
        `${file.replace("../", "")}:${i + 1} — "${m[0]}" is neither a WCAG threshold, ` +
          `a figure this guard measured, nor tagged [withdrawn]`,
      );
    }
  });
}

if (failed) {
  console.error(`\n✗ ${failed} contrast problem(s).`);
  process.exit(1);
}
console.log(
  `✓ contrast holds — ${CANON.length} approved pairs re-measured, ` +
    `${UNUSABLE.length} confirmed unusable, every documented ratio matches.`,
);
