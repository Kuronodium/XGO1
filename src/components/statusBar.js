// モード・手番・アゲハマ・インフォ表示を担うステータスバー
import { GameMode } from "../state/gameState.js";
import { Player } from "../domain/types.js";

export function createStatusBar({ modeEl, playerEl, playerDotEl, capturesBlackEl, capturesWhiteEl, infoEl }) {
  const messages = {
    [GameMode.Setup]: "Setup: 障害物数を決めて Start。",
    [GameMode.Play]: "Play: 空点をタップして着手。Xは壁扱い。",
    [GameMode.Organize]: "Organize: 石をタップで選び、空点をタップで移動。",
    [GameMode.Result]: "Result: スコアを確認して整理に戻るかリセット。",
  };

  function render(state) {
    if (modeEl) modeEl.textContent = state.mode;
    if (playerEl) {
      playerEl.textContent = state.currentPlayer === Player.Black ? "Black" : "White";
      playerEl.dataset.color = state.currentPlayer;
    }
    if (playerDotEl) {
      playerDotEl.dataset.color = state.currentPlayer;
    }
    if (capturesBlackEl) capturesBlackEl.textContent = state.captures.black;
    if (capturesWhiteEl) capturesWhiteEl.textContent = state.captures.white;
    if (infoEl) infoEl.textContent = messages[state.mode] || "";
  }

  return { render };
}
