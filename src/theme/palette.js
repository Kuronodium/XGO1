// XGOアプリのカラーパレット定義とCSS変数注入
import { ensureStyle } from "../components/styleRegistry.js";

export const palette = {
  bg: "#0f1720",
  surface: "#111b27",
  card: "#142031",
  border: "#1f2e42",
  text: "#e6eef7",
  muted: "#9fb2cc",
  accent: "#5dd6a0",
  accentStrong: "#54c792",
  accent2: "#e6b85c",
  primaryOnAccent: "#0c131d",
  accentGlow: "rgba(93, 214, 160, 0.18)",
  accent2Glow: "rgba(230, 184, 92, 0.18)",
  danger: "#ff6b6b",
  boardCell: "#d9dde2",
  boardCellHover: "#cfd4db",
  obstacleStripe1: "#b8bec7",
  obstacleStripe2: "#aeb5bf",
  stoneBlackHighlight: "#3c4c65",
  stoneBlackBase: "#0a0f1a",
  stoneWhiteHighlight: "#ffffff",
  stoneWhiteBase: "#cfd8e5",
  stoneShadowInner: "rgba(255, 255, 255, 0.14)",
  stoneShadowOuter: "rgba(0, 0, 0, 0.45)",
  panelShine: "rgba(255, 255, 255, 0.04)",
  panelGrad1: "rgba(31, 46, 66, 0.7)",
  panelGrad2: "rgba(20, 32, 49, 0.9)",
  ghostBorder: "rgba(255, 255, 255, 0.18)",
  buttonBg: "rgba(255, 255, 255, 0.04)",
  buttonHoverBg: "rgba(255, 255, 255, 0.08)",
  pillDarkBg: "rgba(255, 255, 255, 0.05)",
  pillLightBg: "rgba(255, 255, 255, 0.08)",
  topLineBg: "rgba(255, 255, 255, 0.04)",
  infoBg: "rgba(255, 255, 255, 0.04)",
  logBg: "rgba(255, 255, 255, 0.04)",
  shadow: "0 16px 40px rgba(0, 0, 0, 0.35)",
  accentShadow: "0 10px 24px rgba(93, 214, 160, 0.35)",
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
