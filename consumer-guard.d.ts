/**
 * @aster/tokens — SFGC: the shared consumer font-guard contract (types).
 * Pure, repo-agnostic drift assertions a consumer's thin wrapper composes.
 */

export interface ApprovedFamilies {
  surfaceKey: string;
  /** The surface's declared class, e.g. "editorial" | "app" | "app+parish-deviation". */
  class: string;
  /** The base class ("app+parish-deviation" -> "app"). */
  baseClass: string;
  /** The base class's display/body/mono families — all must load. */
  required: string[];
  /** required + any declared-deviation faces allowed to load for this surface. */
  allowed: string[];
  deviation?: Record<string, unknown>;
  scopedDeviations: Array<Record<string, unknown>>;
}

export interface Binding {
  /** A consumer's local custom property, e.g. "--serif". */
  local: string;
  /** The @aster/tokens role it must bind, e.g. "--atk-ed-display". */
  role: string;
}

export interface ConsumerDriftInput {
  surfaceKey: string;
  /** Full HTML (or the Google-Fonts <link>) whose loaded families are checked. */
  html?: string;
  /** Rendered CSS text checked for forbidden faces (and bindings, if provided). */
  css?: string;
  /** Local-name -> role bindings asserted against `css`. */
  bindings?: Binding[];
}

export interface ConsumerDriftResult {
  ok: boolean;
  failures: string[];
  approved: ApprovedFamilies;
}

export function baseClassOf(surfaceKey: string): string;
export function approvedFamiliesForSurface(surfaceKey: string): ApprovedFamilies;
export function stripCssComments(css: string): string;
export function extractLoadedFamilies(htmlOrLink: string): string[];
export function assertLoadedFamilies(surfaceKey: string, loadedFamilies: string[]): string[];
export function assertNoForbiddenFaces(surfaceKey: string, cssText: string): string[];
export function assertBindings(cssText: string, bindings: Binding[]): string[];
export function assertConsumerDrift(input: ConsumerDriftInput): ConsumerDriftResult;
