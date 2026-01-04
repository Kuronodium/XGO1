// 取った石の数と見た目を盤の左右に表示するコンポーネント
import { createStone } from "./stone.js";

export function createCaptureTray(
  { blackTrayEl, whiteTrayEl, blackCountEl, whiteCountEl },
  { maxStones = 20, stoneSize = "small" } = {}
) {

  function renderCount(el, count) {
    if (el) el.textContent = `x${count}`;
  }

  function resolveStonesEl(trayEl) {
    if (!trayEl) return null;
    return trayEl.querySelector(".capture-tray__stones") ?? trayEl;
  }

  function renderTray(trayEl, color, count) {
    const stonesEl = resolveStonesEl(trayEl);
    if (!stonesEl) return;
    stonesEl.innerHTML = "";
    stonesEl.dataset.count = String(count);
    const displayCount = Math.min(count, maxStones);
    const stonesToRender = Math.max(displayCount, 1);
    for (let i = 0; i < stonesToRender; i++) {
      stonesEl.appendChild(createStone(color, stoneSize));
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
