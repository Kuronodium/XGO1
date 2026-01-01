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
  bg: "#171717",
  bgDeep: "#0F0F0F",
  surface: "#1B1B1B",
  card: "#1F1F1F",
  border: hexToRgba("#FFFFFF", 0.12),
  text: hexToRgba("#FFFFFF", 0.92),
  muted: hexToRgba("#FFFFFF", 0.55),
  accent: hexToRgba("#FFFFFF", 0.65),
  accentStrong: "#FFFFFF",
  accent2: hexToRgba("#FFFFFF", 0.35),
  primaryOnAccent: "#111111",
  accentGlow: hexToRgba("#FFFFFF", 0.08),
  accent2Glow: hexToRgba("#FFFFFF", 0.08),
  turnGlowWeak: hexToRgba("#FFFFFF", 0.08),
  turnGlow: hexToRgba("#FFFFFF", 0.18),
  turnGlowStrong: hexToRgba("#FFFFFF", 0.32),
  danger: "#E11F0C",
  boardCell: "#2A2A2A",
  boardCellHover: "#333333",
  boardOutline: "#FFFFFF",
  gridLine: hexToRgba("#FFFFFF", 0.22),
  obstacleLine: hexToRgba("#FFFFFF", 0.85),
  obstacleStripe1: "#2C2C2C",
  obstacleStripe2: "#3A3A3A",
  stoneBlackHighlight: "#3B3B3B",
  stoneBlackBase: "#101010",
  stoneBlackInner: hexToRgba("#FFFFFF", 0.2),
  stoneWhiteHighlight: "#F6F6F6",
  stoneWhiteBase: "#BDBDBD",
  stoneShadowInner: hexToRgba("#000000", 0.2),
  stoneShadowOuter: hexToRgba("#000000", 0.5),
  stoneBlackOutline: hexToRgba("#FFFFFF", 0.7),
  stoneBlackOutlineSoft: hexToRgba("#FFFFFF", 0.4),
  stoneBlackShadow: hexToRgba("#000000", 0.7),
  panelShine: hexToRgba("#FFFFFF", 0.06),
  panelGrad1: hexToRgba("#2C2C2C", 0.7),
  panelGrad2: hexToRgba("#1E1E1E", 0.9),
  ghostBorder: hexToRgba("#FFFFFF", 0.18),
  buttonBg: hexToRgba("#FFFFFF", 0.06),
  buttonHoverBg: hexToRgba("#FFFFFF", 0.12),
  buttonBorder: hexToRgba("#FFFFFF", 0.2),
  buttonBorderStrong: hexToRgba("#FFFFFF", 0.6),
  checkboxBg: hexToRgba("#FFFFFF", 0.08),
  scoreBg: hexToRgba("#FFFFFF", 0.06),
  scoreBgActive: hexToRgba("#FFFFFF", 0.18),
  scoreGlow: hexToRgba("#FFFFFF", 0.12),
  sideActiveBg: hexToRgba("#FFFFFF", 0.08),
  sideActiveGlow: hexToRgba("#FFFFFF", 0.12),
  turnBadgeBg: "#FFFFFF",
  turnBadgeText: "#111111",
  overlay: hexToRgba("#000000", 0.45),
  primaryButtonBg: "#FFFFFF",
  primaryButtonText: "#111111",
  primaryButtonShadow: "0 10px 24px rgba(0, 0, 0, 0.35)",
  pillDarkBg: hexToRgba("#FFFFFF", 0.08),
  pillLightBg: hexToRgba("#FFFFFF", 0.14),
  topLineBg: hexToRgba("#FFFFFF", 0.08),
  infoBg: hexToRgba("#FFFFFF", 0.08),
  logBg: hexToRgba("#FFFFFF", 0.08),
  shadow: "0 30px 80px rgba(0, 0, 0, 0.6)",
  accentShadow: "0 10px 24px rgba(0, 0, 0, 0.35)",
};

export function applyPalette() {
  const cssVars = `
:root {
  --color-bg: ${palette.bg};
  --color-bg-deep: ${palette.bgDeep};
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
  --color-turn-glow-weak: ${palette.turnGlowWeak};
  --color-turn-glow: ${palette.turnGlow};
  --color-turn-glow-strong: ${palette.turnGlowStrong};
  --color-primary-on-accent: ${palette.primaryOnAccent};
  --color-danger: ${palette.danger};
  --color-board-cell: ${palette.boardCell};
  --color-board-cell-hover: ${palette.boardCellHover};
  --color-board-outline: ${palette.boardOutline};
  --color-grid-line: ${palette.gridLine};
  --color-obstacle-line: ${palette.obstacleLine};
  --color-obstacle-stripe-1: ${palette.obstacleStripe1};
  --color-obstacle-stripe-2: ${palette.obstacleStripe2};
  --color-stone-black-highlight: ${palette.stoneBlackHighlight};
  --color-stone-black-base: ${palette.stoneBlackBase};
  --color-stone-black-inner: ${palette.stoneBlackInner};
  --color-stone-white-highlight: ${palette.stoneWhiteHighlight};
  --color-stone-white-base: ${palette.stoneWhiteBase};
  --color-stone-shadow-inner: ${palette.stoneShadowInner};
  --color-stone-shadow-outer: ${palette.stoneShadowOuter};
  --color-stone-black-outline: ${palette.stoneBlackOutline};
  --color-stone-black-outline-soft: ${palette.stoneBlackOutlineSoft};
  --color-stone-black-shadow: ${palette.stoneBlackShadow};
  --color-panel-shine: ${palette.panelShine};
  --color-panel-grad-1: ${palette.panelGrad1};
  --color-panel-grad-2: ${palette.panelGrad2};
  --color-ghost-border: ${palette.ghostBorder};
  --color-button-bg: ${palette.buttonBg};
  --color-button-hover-bg: ${palette.buttonHoverBg};
  --color-button-border: ${palette.buttonBorder};
  --color-button-border-strong: ${palette.buttonBorderStrong};
  --color-checkbox-bg: ${palette.checkboxBg};
  --color-score-bg: ${palette.scoreBg};
  --color-score-bg-active: ${palette.scoreBgActive};
  --color-score-glow: ${palette.scoreGlow};
  --color-side-active-bg: ${palette.sideActiveBg};
  --color-side-active-glow: ${palette.sideActiveGlow};
  --color-turn-badge-bg: ${palette.turnBadgeBg};
  --color-turn-badge-text: ${palette.turnBadgeText};
  --color-overlay: ${palette.overlay};
  --color-primary-button-bg: ${palette.primaryButtonBg};
  --color-primary-button-text: ${palette.primaryButtonText};
  --color-pill-dark-bg: ${palette.pillDarkBg};
  --color-pill-light-bg: ${palette.pillLightBg};
  --color-topline-bg: ${palette.topLineBg};
  --color-info-bg: ${palette.infoBg};
  --color-log-bg: ${palette.logBg};
  --shadow-elevated: ${palette.shadow};
  --shadow-accent: ${palette.accentShadow};
  --shadow-primary: ${palette.primaryButtonShadow};
}
`;
  ensureStyle("color-palette", cssVars);
}
