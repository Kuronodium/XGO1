// セットアップ用のUI（障害物設定とStart操作）を管理するコンポーネント
import { GameMode } from "../state/gameState.js";

export function createSetupPanel(
  { toggleEl, countEl, randomizeBtn, startButtons = [] },
  { onToggle, onCountChange, onRandomize, onStart }
) {
  if (toggleEl) {
    toggleEl.addEventListener("change", (e) => {
      onToggle?.(e.target.checked);
    });
  }

  if (countEl) {
    countEl.addEventListener("change", (e) => {
      const raw = Number(e.target.value);
      const clamped = Number.isFinite(raw) ? Math.max(0, Math.min(20, raw)) : 0;
      onCountChange?.(clamped);
    });
  }

  if (randomizeBtn) {
    randomizeBtn.addEventListener("click", () => onRandomize?.());
  }

  startButtons.forEach((btn) => {
    btn?.addEventListener("click", () => onStart?.());
  });

  function render(state) {
    if (toggleEl) toggleEl.checked = state.obstaclesEnabled;
    if (countEl) countEl.value = String(state.obstacleCount);

    const isSetup = state.mode === GameMode.Setup;
    if (randomizeBtn) randomizeBtn.disabled = !isSetup;
    startButtons.forEach((btn) => {
      if (btn) btn.disabled = !isSetup;
    });
  }

  return { render };
}
