export interface AsterTokens {
  ground: string;
  panel: string;
  panelHover: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  ink: string;
  textSecondary: string;
  textMuted: string;
  textTertiary: string;
  border: string;
  borderSubtle: string;
  textOnDark: string;
  /** CANONICAL interactive/UI navy (.io). */
  navyUi: string;
  /** CANONICAL night surface (Constellation Board). */
  navyNight: string;
  /** DEPRECATED — migrate post-R2, not mid-pilot. */
  navyLegacy: string;
  gold: string;
  goldHi: string;
  goldText: string;
  goldTint: string;
  brass: string;
}

export declare const tokens: AsterTokens;
export default tokens;
