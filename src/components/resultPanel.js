// 判定結果（スコアと勝者表示）を管理するコンポーネント
export function createResultPanel({ blackEl, whiteEl, winnerEl }) {
  function render(lastScore, captures) {
    if (!lastScore) {
      if (blackEl) blackEl.textContent = "-";
      if (whiteEl) whiteEl.textContent = "-";
      if (winnerEl) winnerEl.textContent = "-";
      return;
    }

    if (blackEl) blackEl.textContent = `${lastScore.blackScore} (地:${lastScore.blackTerritory} + 取:${captures.black})`;
    if (whiteEl) whiteEl.textContent = `${lastScore.whiteScore} (地:${lastScore.whiteTerritory} + 取:${captures.white} + コミ:${lastScore.komi})`;

    const diff = lastScore.blackScore - lastScore.whiteScore;
    if (winnerEl) {
      if (diff === 0) {
        winnerEl.textContent = "Even";
      } else if (diff > 0) {
        winnerEl.textContent = `Black +${diff}`;
      } else {
        winnerEl.textContent = `White +${Math.abs(diff)}`;
      }
    }
  }

  return { render };
}
