// XGOアプリのカラーパレット定義とCSS変数注入
import { ensureStyle } from "../components/styleRegistry.js";

const hexToRgba = (hex, alpha = 1) => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const palette = {
  bg: "#111111",
  surface: "#1E1E1E",
  card: "#1E1E1E",
  border: "#2C2C2C",
  text: hexToRgba("#FFFFFF", 0.9),
  muted: hexToRgba("#FFFFFF", 0.6),
  accent: "#4784AB",
  accentStrong: "#4784AB",
  accent2: "#169638",
  primaryOnAccent: "#FFFFFF",
  accentGlow: hexToRgba("#4784AB", 0.18),
  accent2Glow: hexToRgba("#169638", 0.18),
  danger: "#E11F0C",
  boardCell: "#1E1E1E",
  boardCellHover: "#2C2C2C",
  obstacleStripe1: "#2C2C2C",
  obstacleStripe2: "#3A3A3A",
  stoneBlackHighlight: "#2C2C2C",
  stoneBlackBase: "#111111",
  stoneWhiteHighlight: "#FFFFFF",
  stoneWhiteBase: "#F1F1F1",
  stoneShadowInner: hexToRgba("#FFFFFF", 0.12),
  stoneShadowOuter: hexToRgba("#000000", 0.45),
  stoneBlackOutline: hexToRgba("#FFFFFF", 0.7),
  stoneBlackShadow: hexToRgba("#000000", 0.6),
  panelShine: hexToRgba("#FFFFFF", 0.06),
  panelGrad1: hexToRgba("#2C2C2C", 0.7),
  panelGrad2: hexToRgba("#1E1E1E", 0.9),
  ghostBorder: hexToRgba("#FFFFFF", 0.18),
  buttonBg: hexToRgba("#FFFFFF", 0.06),
  buttonHoverBg: hexToRgba("#FFFFFF", 0.14),
  pillDarkBg: hexToRgba("#FFFFFF", 0.08),
  pillLightBg: hexToRgba("#FFFFFF", 0.14),
  topLineBg: hexToRgba("#FFFFFF", 0.08),
  infoBg: hexToRgba("#FFFFFF", 0.08),
  logBg: hexToRgba("#FFFFFF", 0.08),
  shadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
  accentShadow: "0 10px 24px rgba(71, 132, 171, 0.35)",
};

export function applyPalette() {
  const cssVars = `
:root {
  --color-bg: ${palette.bg};
  --color-surface: ${palette.surface};
  --color-card: ${palette.card};
  --color-border: ${palette.border};
  --color-text: ${palette.text};
  --color-muted: ${palette.muted};
  --color-accent: ${palette.accent};
  --color-accent-strong: ${palette.accentStrong};
  --color-accent-2: ${palette.accent2};
  --color-accent-glow: ${palette.accentGlow};
  --color-accent-2-glow: ${palette.accent2Glow};
  --color-primary-on-accent: ${palette.primaryOnAccent};
  --color-danger: ${palette.danger};
  --color-board-cell: ${palette.boardCell};
  --color-board-cell-hover: ${palette.boardCellHover};
  --color-obstacle-stripe-1: ${palette.obstacleStripe1};
  --color-obstacle-stripe-2: ${palette.obstacleStripe2};
  --color-stone-black-highlight: ${palette.stoneBlackHighlight};
  --color-stone-black-base: ${palette.stoneBlackBase};
  --color-stone-white-highlight: ${palette.stoneWhiteHighlight};
  --color-stone-white-base: ${palette.stoneWhiteBase};
  --color-stone-shadow-inner: ${palette.stoneShadowInner};
  --color-stone-shadow-outer: ${palette.stoneShadowOuter};
  --color-stone-black-outline: ${palette.stoneBlackOutline};
  --color-stone-black-shadow: ${palette.stoneBlackShadow};
  --color-panel-shine: ${palette.panelShine};
  --color-panel-grad-1: ${palette.panelGrad1};
  --color-panel-grad-2: ${palette.panelGrad2};
  --color-ghost-border: ${palette.ghostBorder};
  --color-button-bg: ${palette.buttonBg};
  --color-button-hover-bg: ${palette.buttonHoverBg};
  --color-pill-dark-bg: ${palette.pillDarkBg};
  --color-pill-light-bg: ${palette.pillLightBg};
  --color-topline-bg: ${palette.topLineBg};
  --color-info-bg: ${palette.infoBg};
  --color-log-bg: ${palette.logBg};
  --shadow-elevated: ${palette.shadow};
  --shadow-accent: ${palette.accentShadow};
}
`;
  ensureStyle("color-palette", cssVars);
}
