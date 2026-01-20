// オンライン/オフライン選択とマッチコードUIを管理するコンポーネント
import { GameMode, MatchType } from "../state/gameState.js";

export function createMatchPanel(
  { segmentEl, stonesEl, codeEl, startButton },
  { onModeChange, onToggleStone, onStart }
) {
  if (segmentEl) {
    segmentEl.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;
      const mode = button.dataset.mode;
      if (!mode) return;
      onModeChange?.(mode);
    });
  }

  if (stonesEl) {
    stonesEl.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;
      const index = Number(button.dataset.index);
      if (!Number.isInteger(index)) return;
      onToggleStone?.(index);
    });
  }

  if (startButton) {
    startButton.addEventListener("click", () => onStart?.());
  }

  function render(state, { code } = {}) {
    const isMatch = state.mode === GameMode.Match;
    const isOnline = state.matchType === MatchType.Online;
    const activeCode = code ?? state.matchCode ?? [];

    if (segmentEl) {
      segmentEl.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.mode === state.matchType);
      });
    }

    if (stonesEl) {
      stonesEl.classList.toggle("is-disabled", !isOnline);
      stonesEl.querySelectorAll("button").forEach((btn, index) => {
        const bit = activeCode[index] ?? 0;
        btn.classList.toggle("is-white", bit === 1);
        btn.classList.toggle("is-black", bit !== 1);
        btn.setAttribute("aria-pressed", bit === 1 ? "true" : "false");
      });
    }

    if (codeEl) {
      codeEl.textContent = activeCode.join("");
    }

    if (startButton) {
      startButton.disabled = !isMatch;
    }
  }

  return { render };
}
