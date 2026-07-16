export interface AsterTypography {
  /** Default UI font stack (Inter + native fallback chain). */
  fontSans: string;
  /** Inter legibility feature settings: 'cv05','cv08' (disambiguated l / slashed zero). */
  fontFeatureLegibility: string;
  /** Type scale (px) — 24/20/17/15/13/11, held exactly. */
  fsDisplay: string;
  fsTitle: string;
  fsHeading: string;
  fsBody: string;
  /** 13px — body floor. */
  fsMeta: string;
  /** 11px — label floor (uppercase, tracking-wide, weight 500). */
  fsLabel: string;
  fwRegular: string;
  fwMedium: string;
  fwSemibold: string;
  fwBold: string;
  /** 1.2 — headers. */
  lhTight: string;
  /** 1.5 — body. */
  lhBody: string;
}

export declare const typography: AsterTypography;
export default typography;
