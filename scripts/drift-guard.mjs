/**
 * Package integrity drift-guard.
 *
 * Asserts tokens.css and tokens.js encode the SAME hex per role, so the two
 * mirrors can never silently diverge. Runs in @aster/tokens CI on every PR.
 *
 * NOTE: this is the PACKAGE-internal guard. The CONSUMER-side drift-guard — which
 * asserts a consuming repo's LOCAL token values equal these canonical values — lives
 * in each consuming repo (mandatory backstop, per the propagation rulings). See
 * README → "Drift-guard (consumer side)" for the copyable pattern.
 */
import { readFileSync } from "node:fs";
import { tokens } from "../tokens.js";

const css = readFileSync(new URL("../tokens.css", import.meta.url), "utf8");
const cssVars = Object.fromEntries(
  [...css.matchAll(/--as-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(([, k, v]) => [k, v.toUpperCase()]),
);
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

let failed = 0;
for (const [cssKey, hex] of Object.entries(cssVars)) {
  const jsKey = camel(cssKey);
  const jsVal = tokens[jsKey]?.toUpperCase();
  if (jsVal !== hex) {
    console.error(`DRIFT: --as-${cssKey} = ${hex}  but  tokens.${jsKey} = ${jsVal ?? "MISSING"}`);
    failed++;
  }
}
// Also flag JS-only keys with no CSS counterpart.
const cssCamelKeys = new Set(Object.keys(cssVars).map(camel));
for (const jsKey of Object.keys(tokens)) {
  if (!cssCamelKeys.has(jsKey)) {
    console.error(`DRIFT: tokens.${jsKey} has no matching --as-* in tokens.css`);
    failed++;
  }
}

if (failed) {
  console.error(`\n✗ ${failed} token mismatch(es) between tokens.css and tokens.js.`);
  process.exit(1);
}
console.log(`✓ tokens.css and tokens.js agree (${Object.keys(cssVars).length} tokens).`);
