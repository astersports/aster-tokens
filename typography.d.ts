export interface AsterTypography {
  /** Editorial display — 'Instrument Serif' (marketing/brand class). */
  edDisplay: string;
  /** Editorial body — 'IBM Plex Sans' + native fallback. */
  edBody: string;
  /** Editorial mono — 'IBM Plex Mono'. */
  edMono: string;
  /** App-clean display — 'Inter' + native fallback (product class). */
  appDisplay: string;
  /** App-clean body — 'Inter' + native fallback. */
  appBody: string;
  /** App-clean mono — 'IBM Plex Mono'. */
  appMono: string;
  /** App-clean legibility: 'cv05','cv08' (Inter disambiguated l / slashed zero). */
  appFeatureLegibility: string;
  /** Editorial legibility: 'normal' — Plex does not honor cv05/cv08 (explicit negative). */
  edFeatureLegibility: string;
  /** Ratified scale (px) — 34/24/20/17/15/12. scale4 (17px) = readable-body floor. */
  scale1: string;
  scale2: string;
  scale3: string;
  scale4: string;
  /** 15px — dense data-cell minimum for read content. */
  scale5: string;
  /** 12px — label-only floor (uppercase tags/timestamps, never a sentence). */
  scale6: string;
  /** 'tabular-nums' — apply on all numeric/data runs. */
  numeric: string;
  fwRegular: string;
  fwMedium: string;
  fwSemibold: string;
  fwBold: string;
  /** 1.2 — headers. */
  lhTight: string;
  /** 1.5 — body. */
  lhBody: string;
  /** DEPRECATED back-compat (v0.2.0): App-clean default stack. Migrate to appBody. */
  fontSans: string;
  /** DEPRECATED back-compat (v0.2.0): App-clean legibility. Migrate to appFeatureLegibility. */
  fontFeatureLegibility: string;
  /** DEPRECATED back-compat (v0.2.0) scale — old 24/20/17/15/13/11. Migrate to scale1..6. */
  fsDisplay: string;
  fsTitle: string;
  fsHeading: string;
  fsBody: string;
  fsMeta: string;
  fsLabel: string;
}

export declare const typography: AsterTypography;
export default typography;
