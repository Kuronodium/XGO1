// 手番表示とターン強調の状態切り替えを担うステータスバー
import { Player, CellState } from "../domain/types.js";

function countStones(board) {
  let total = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === CellState.Black || cell === CellState.White) total += 1;
    }
  }
  return total;
}

export function createStatusBar({
  turnCountEl,
  rootEl = document.body,
}) {
  function render(state) {
    const isBlackTurn = state.currentPlayer === Player.Black;
    const turnCount = countStones(state.board) + 1;

    if (turnCountEl) turnCountEl.textContent = String(turnCount);
    if (rootEl) {
      rootEl.classList.toggle("turn-black", isBlackTurn);
      rootEl.classList.toggle("turn-white", !isBlackTurn);
    }
  }

  return { render };
}
