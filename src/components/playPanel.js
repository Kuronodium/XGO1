// 対局中と整理モードの操作ボタンをまとめたコンポーネント
import { GameMode } from "../state/gameState.js";

export function createPlayPanel(
  {
    panelEl,
    undoBtn,
    redoBtn,
    toOrganizeBtn,
    backToPlayBtn,
    scoreBtn,
    resetButtons = [],
  },
  { onUndo, onRedo, onOrganize, onBackToPlay, onScore, onReset }
) {
  if (undoBtn) undoBtn.addEventListener("click", () => onUndo?.());
  if (redoBtn) redoBtn.addEventListener("click", () => onRedo?.());
  if (toOrganizeBtn) toOrganizeBtn.addEventListener("click", () => onOrganize?.());
  if (backToPlayBtn) backToPlayBtn.addEventListener("click", () => onBackToPlay?.());
  if (scoreBtn) scoreBtn.addEventListener("click", () => onScore?.());
  resetButtons.forEach((btn) => btn?.addEventListener("click", () => onReset?.()));

  function render(state, { canUndo = false, canRedo = false } = {}) {
    const isPlay = state.mode === GameMode.Play;
    const isOrganize = state.mode === GameMode.Organize;

    if (panelEl) panelEl.dataset.mode = state.mode.toLowerCase();
    if (undoBtn) undoBtn.disabled = !canUndo;
    if (redoBtn) redoBtn.disabled = !canRedo;
    if (toOrganizeBtn) toOrganizeBtn.disabled = !isPlay;
    if (backToPlayBtn) backToPlayBtn.disabled = !isOrganize;
    if (scoreBtn) scoreBtn.disabled = !isOrganize;
  }

  return { render };
}
