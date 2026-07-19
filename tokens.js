/**
 * @aster/tokens — canonical Aster design tokens (v0.3.1), JS/TS mirror of tokens.css.
 * Values-only. Keep in EXACT sync with tokens.css — `npm run drift-guard` (CI) enforces it.
 */
export const tokens = {
  ground: "#FCFBF9",
  panel: "#FFFFFF",
  panelHover: "#F9F8F4",
  surfaceSecondary: "#F1EFE9",
  surfaceTertiary: "#EAE7DF",
  ink: "#0B1B3B",
  textSecondary: "#4A5568",
  textMuted: "#6B7488",
  textTertiary: "#8896AB",
  border: "#E6E4DC",
  borderSubtle: "#EDEAE2",
  textOnDark: "#F5F0E8",
  navyUi: "#12244D",
  navyNight: "#0A1430",
  navyLegacy: "#151525", // DEPRECATED — migrate post-R2, not mid-pilot
  gold: "#C9952E",
  goldHi: "#D4A843",
  goldText: "#8F6708",
  goldTint: "#F4E9CF",
  brass: "#B9871F",
};

export default tokens;
