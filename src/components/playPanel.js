// 対局中と整理モードの操作ボタンをまとめたコンポーネント
import { GameMode } from "../state/gameState.js";

export function createPlayPanel(
  { toOrganizeBtn, backToPlayBtn, scoreBtn, backToOrganizeBtn, resetButtons = [] },
  { onOrganize, onBackToPlay, onScore, onBackToOrganize, onReset }
) {
  if (toOrganizeBtn) toOrganizeBtn.addEventListener("click", () => onOrganize?.());
  if (backToPlayBtn) backToPlayBtn.addEventListener("click", () => onBackToPlay?.());
  if (scoreBtn) scoreBtn.addEventListener("click", () => onScore?.());
  if (backToOrganizeBtn) backToOrganizeBtn.addEventListener("click", () => onBackToOrganize?.());
  resetButtons.forEach((btn) => btn?.addEventListener("click", () => onReset?.()));

  function render(state) {
    const isPlay = state.mode === GameMode.Play;
    const isOrganize = state.mode === GameMode.Organize;
    const isResult = state.mode === GameMode.Result;

    if (toOrganizeBtn) toOrganizeBtn.disabled = !isPlay;
    if (backToPlayBtn) backToPlayBtn.disabled = !isOrganize;
    if (scoreBtn) scoreBtn.disabled = !isOrganize;
    if (backToOrganizeBtn) backToOrganizeBtn.disabled = !isResult;
  }

  return { render };
}
