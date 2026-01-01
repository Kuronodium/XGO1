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
  topbarBlackEl,
  topbarWhiteEl,
  sideBlackEl,
  sideWhiteEl,
}) {
  function render(state) {
    const isBlackTurn = state.currentPlayer === Player.Black;
    const turnCount = countStones(state.board) + 1;

    if (turnCountEl) turnCountEl.textContent = String(turnCount);
    if (topbarBlackEl) topbarBlackEl.classList.toggle("is-active", isBlackTurn);
    if (topbarWhiteEl) topbarWhiteEl.classList.toggle("is-active", !isBlackTurn);
    if (sideBlackEl) sideBlackEl.classList.toggle("is-active", isBlackTurn);
    if (sideWhiteEl) sideWhiteEl.classList.toggle("is-active", !isBlackTurn);
  }

  return { render };
}
