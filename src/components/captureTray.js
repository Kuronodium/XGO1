// 取った石の数と見た目を盤の左右に表示するコンポーネント
import { createStone } from "./stone.js";

export function createCaptureTray({ blackTrayEl, whiteTrayEl, blackCountEl, whiteCountEl }) {
  const maxStones = 20;

  function renderCount(el, count) {
    if (el) el.textContent = String(count);
  }

  function renderTray(trayEl, color, count) {
    if (!trayEl) return;
    trayEl.innerHTML = "";
    const displayCount = Math.min(count, maxStones);
    for (let i = 0; i < displayCount; i++) {
      trayEl.appendChild(createStone(color, "small"));
    }
    if (count > maxStones) {
      const more = document.createElement("span");
      more.className = "capture-overflow";
      more.textContent = `+${count - maxStones}`;
      trayEl.appendChild(more);
    }
  }

  function render(captures) {
    renderCount(blackCountEl, captures.black);
    renderCount(whiteCountEl, captures.white);
    // black captures are white stones, white captures are black stones.
    renderTray(blackTrayEl, "white", captures.black);
    renderTray(whiteTrayEl, "black", captures.white);
  }

  return { render };
}
