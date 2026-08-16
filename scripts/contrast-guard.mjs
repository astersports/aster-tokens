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

  // text-muted holds AA on exactly two grounds. Named, so the claim can never float again.
  { fg: "#6B7488", bg: "#FCFBF9", was: "text-muted on ground", role: "body", ratio: 4.53 },
  { fg: "#6B7488", bg: "#FFFFFF", was: "text-muted on panel", role: "body", ratio: 4.69 },
  { fg: "#8896AB", bg: "#FFFFFF", was: "text-tertiary on panel", role: "ui", ratio: 3.0 },

  // the replacement the docs now point at — pinned so the advice cannot rot.
  { fg: "#4A5568", bg: "#EAE7DF", was: "text-secondary on surface-tertiary", role: "body", ratio: 6.09 },
  { fg: "#4A5568", bg: "#F4E9CF", was: "text-secondary on gold-tint", role: "body", ratio: 6.24 },
];

/* Pairs the docs assert are BELOW a floor. `under` is the ceiling the pair must stay
   beneath — 3 for "not usable at all", 4.5 for "clears the UI floor but is not body-safe".
   Listing them asserts they really are that bad: if a hex moves and one quietly becomes
   usable, this fails and the docs get revisited rather than silently under-claiming.
   The inverse of CANON, and the half a floor-only guard cannot see. */
const BELOW = [
  { fg: "#B9871F", bg: "#F1EFE9", was: "brass on surface-secondary", ratio: 2.79, under: 3 },
  { fg: "#B9871F", bg: "#EAE7DF", was: "brass on surface-tertiary", ratio: 2.6, under: 3 },
  { fg: "#B9871F", bg: "#F4E9CF", was: "brass on gold-tint", ratio: 2.66, under: 3 },
  { fg: "#C9952E", bg: "#FCFBF9", was: "gold on ground", ratio: 2.6, under: 3 },
  { fg: "#D4A843", bg: "#FCFBF9", was: "gold-hi on ground", ratio: 2.14, under: 3 },

  /* text-muted was documented "AA text-rank floor" with no ground named. It holds on two
     grounds and fails on three — the defect this list exists to make un-writable. */
  { fg: "#6B7488", bg: "#F1EFE9", was: "text-muted on surface-secondary", ratio: 4.08, under: 4.5 },
  { fg: "#6B7488", bg: "#F4E9CF", was: "text-muted on gold-tint", ratio: 3.89, under: 4.5 },
  { fg: "#6B7488", bg: "#EAE7DF", was: "text-muted on surface-tertiary", ratio: 3.79, under: 4.5 },

  /* text-tertiary said "icons, dividers". A meaningful icon needs 3:1; it misses on four
     of five grounds. Dividers are decorative and carry no floor. */
  { fg: "#8896AB", bg: "#FCFBF9", was: "text-tertiary on ground", ratio: 2.9, under: 3 },
  { fg: "#8896AB", bg: "#F1EFE9", was: "text-tertiary on surface-secondary", ratio: 2.61, under: 3 },
  { fg: "#8896AB", bg: "#F4E9CF", was: "text-tertiary on gold-tint", ratio: 2.49, under: 3 },
  { fg: "#8896AB", bg: "#EAE7DF", was: "text-tertiary on surface-tertiary", ratio: 2.43, under: 3 },
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
for (const c of BELOW) {
  const got = r2(ratio(c.fg, c.bg));
  if (got !== c.ratio) fail(`STALE FIGURE: ${c.was} is documented ${c.ratio}:1 but measures ${got}:1`);
  if (got >= c.under) {
    fail(`${c.was} = ${got}:1 now clears ${c.under}:1 — the docs say it does not; re-document it`);
  }
}

/* ── 3. no undeclared or stale ratio may appear in the docs ────────────── */
const COMPUTED = new Set([...CANON, ...BELOW].map((c) => r2(ratio(c.fg, c.bg)).toFixed(2)));
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

/* ── 4. an AA claim in PROSE must carry a measured figure ──────────────────
   The defect this exists for: `--atk-text-muted: #6B7488; /* AA text-rank floor *␘/`
   shipped for months. Assertion 3 never saw it — it matches `N:1`, and that comment has
   no digits at all. But "AA text-rank floor" reads exactly as authoritative as "4.5:1",
   and it was false on three of five grounds.
   So: every comment block in tokens.css that says AA (or AAA) must also carry a figure
   this guard computed. A contrast claim without a number is not a weaker claim — it is
   an unfalsifiable one, which is worse. */
const AA_WORD = /\bAAA?\b/;
const RATIO_IN = /(\d+(?:\.\d+)?):1/g;
for (const [, block] of read("../tokens.css").matchAll(/\/\*([\s\S]*?)\*\//g)) {
  if (!AA_WORD.test(block)) continue;
  const figures = [...block.matchAll(RATIO_IN)].map((m) => Number(m[1]).toFixed(2));
  if (!figures.some((n) => COMPUTED.has(n))) {
    const first = block.trim().split("\n")[0].trim().slice(0, 68);
    fail(
      `UNFALSIFIABLE AA CLAIM in tokens.css — "${first}…" asserts AA in prose but carries ` +
        `no figure this guard measured. Name the ground and the ratio, or drop the claim.`,
    );
  }
}

if (failed) {
  console.error(`\n✗ ${failed} contrast problem(s).`);
  process.exit(1);
}
console.log(
  `✓ contrast holds — ${CANON.length} approved pairs re-measured, ` +
    `${BELOW.length} asserted below a floor, every documented ratio matches, ` +
    `no unfalsifiable AA claims.`,
);
