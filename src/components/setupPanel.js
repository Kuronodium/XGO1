// セットアップ用のUI（障害物数とStart操作）を管理するコンポーネント
import { GameMode } from "../state/gameState.js";

export function createSetupPanel(
  { segmentEl, sizeSegmentEl, randomizeBtn, startButtons = [] },
  { onCountChange, onSizeChange, onRandomize, onStart }
) {
  if (segmentEl) {
    segmentEl.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;
      const count = Number(button.dataset.count);
      if (!Number.isFinite(count)) return;
      onCountChange?.(count);
    });
  }

  if (sizeSegmentEl) {
    sizeSegmentEl.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;
      const size = Number(button.dataset.size);
      if (!Number.isFinite(size)) return;
      onSizeChange?.(size);
    });
  }

  if (randomizeBtn) {
    randomizeBtn.addEventListener("click", () => onRandomize?.());
  }

  startButtons.forEach((btn) => {
    btn?.addEventListener("click", () => onStart?.());
  });

  function render(state) {
    if (segmentEl) {
      segmentEl.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.count === String(state.obstacleCount));
      });
    }
    if (sizeSegmentEl) {
      sizeSegmentEl.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.size === String(state.boardSize));
      });
    }

    const isSetup = state.mode === GameMode.Setup;
    if (randomizeBtn) randomizeBtn.disabled = !isSetup;
    startButtons.forEach((btn) => {
      if (btn) btn.disabled = !isSetup;
    });
  }

  return { render };
}
