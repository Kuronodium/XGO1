// アプリ全体のHTML骨格（盤面カード、サイドカード群）を生成するコンポーネント
import { ensureStyle } from "./styleRegistry.js";

ensureStyle(
  "layout-styles",
  `
.app-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.layout {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr;
  gap: 16px;
  margin-top: 8px;
}

.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow-elevated);
}

/* board-card stays flexible for board/info stacking */
.board-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.board-shell {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  padding: 12px;
  background: var(--color-board-cell);
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.topline {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--color-accent-glow);
  color: var(--color-accent);
  font-weight: 600;
  border: 1px solid var(--color-accent);
}

.turn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  background: var(--color-topline-bg);
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-text);
  box-shadow: 0 0 0 2px var(--color-panel-shine);
}

.dot[data-color="black"] {
  background: var(--color-stone-black-base);
}

.dot[data-color="white"] {
  background: var(--color-stone-white-highlight);
  border: 1px solid var(--color-border);
}

.captures {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.9rem;
}

.pill.dark {
  background: var(--color-pill-dark-bg);
  color: var(--color-text);
}

.pill.light {
  background: var(--color-pill-light-bg);
  color: var(--color-text);
}

.info {
  color: var(--color-muted);
  font-size: 0.95rem;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--color-info-bg);
  border: 1px solid var(--color-border);
}

.side {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.hint {
  font-size: 0.85rem;
  color: var(--color-muted);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
}

input[type="number"] {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 6px 10px;
  border-radius: 8px;
  width: 90px;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.buttons.two-col > button {
  flex: 1 1 calc(50% - 4px);
}

.buttons .wide {
  flex: 1 1 100%;
}

button {
  background: var(--color-button-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 140ms ease, background 140ms ease;
}

button:hover {
  background: var(--color-button-hover-bg);
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

button.primary {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-strong));
  color: var(--color-primary-on-accent);
  border: none;
  box-shadow: var(--shadow-accent);
}

button.ghost {
  background: transparent;
  border-color: var(--color-ghost-border);
}

.note {
  color: var(--color-muted);
  font-size: 0.9rem;
  margin-top: 8px;
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.score-row.total {
  font-weight: 700;
  border-bottom: none;
}

.stone-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  background: var(--color-panel-shine);
}

.stone-label.black::before,
.stone-label.white::before {
  content: "";
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
}

.stone-label.black::before {
  background: var(--color-stone-black-base);
}

.stone-label.white::before {
  background: var(--color-stone-white-highlight);
  border: 1px solid var(--color-border);
}

.modal {
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  padding: 16px;
}

.modal.is-open {
  display: flex;
}

.modal-panel {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-elevated);
  border-radius: 14px;
  padding: 16px;
  width: min(520px, 100%);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .hero {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .buttons.two-col > button {
    flex: 1 1 100%;
  }

  .topline {
    flex-direction: column;
    align-items: flex-start;
  }
}
`
);

export function createLayout() {
  const template = document.createElement("template");
  template.innerHTML = `
    <div class="app-shell">
      <main class="layout">
        <section class="card board-card">
          <div class="topline">
            <div class="badge" id="mode">SETUP</div>
            <div class="turn">
              <span class="dot" id="player-dot"></span>
              <span class="label">手番:</span>
              <span id="player" data-color="black">Black</span>
            </div>
            <div class="captures">
              <span class="pill dark">黒取 <strong id="captures-black">0</strong></span>
              <span class="pill light">白取 <strong id="captures-white">0</strong></span>
            </div>
          </div>

          <div id="board-host" class="board-shell"></div>
          <p class="info" id="info">Setup: choose obstacle count and start.</p>
        </section>

        <section class="side">
          <div class="card">
            <div class="card-head">
              <h2>Play / Organize</h2>
              <span class="hint">対局中の操作</span>
            </div>
            <div class="buttons two-col">
              <button id="to-organize">整理モードへ</button>
              <button id="back-to-play">対局に戻る</button>
              <button id="score" class="primary">判定</button>
              <button id="back-to-organize">整理に戻る</button>
              <button data-reset class="ghost wide">最初から</button>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <h2>Event Log</h2>
              <span class="hint">最新8件</span>
            </div>
          <ul id="event-log" class="log"></ul>
        </div>
      </section>
    </main>

    <div class="modal" id="setup-modal">
      <div class="modal-panel">
        <div class="modal-header">
          <h2>Setup</h2>
          <button class="ghost" id="close-setup">閉じる</button>
        </div>
        <label class="row">
          <input type="checkbox" id="obstacles-toggle" checked>
          <span>障害物Xを使う</span>
        </label>
        <label class="row">
          <span>障害物の個数</span>
          <input type="number" id="obstacle-count" min="0" max="20" step="1" value="4" inputmode="numeric">
        </label>
        <div class="buttons">
          <button id="randomize">もう一度ランダム配置</button>
          <button class="primary" id="start-setup">Start</button>
        </div>
        <p class="note">9x9固定。障害物は開始後は変化しません。開始前のみ変更できます。</p>
      </div>
    </div>

    <div class="modal" id="result-modal">
      <div class="modal-panel">
        <div class="modal-header">
          <h2>Result</h2>
          <button class="ghost" id="close-result">閉じる</button>
        </div>
        <div class="score-row">
          <span class="stone-label black">黒</span>
          <span id="score-black">-</span>
        </div>
        <div class="score-row">
          <span class="stone-label white">白</span>
          <span id="score-white">-</span>
        </div>
        <div class="score-row total">
          <span>結果</span>
          <span id="winner">-</span>
        </div>
        <div class="modal-actions">
          <button id="result-back-organize">整理に戻る</button>
          <button class="ghost" data-reset>最初から</button>
        </div>
      </div>
    </div>
    </div>
  `;

  const root = template.content.firstElementChild;
  const elements = {
    boardHost: root.querySelector("#board-host"),
    mode: root.querySelector("#mode"),
    player: root.querySelector("#player"),
    playerDot: root.querySelector("#player-dot"),
    capturesBlack: root.querySelector("#captures-black"),
    capturesWhite: root.querySelector("#captures-white"),
    obstaclesToggle: root.querySelector("#obstacles-toggle"),
    obstacleCount: root.querySelector("#obstacle-count"),
    randomizeBtn: root.querySelector("#randomize"),
    startSetupBtn: root.querySelector("#start-setup"),
    organizeBtn: root.querySelector("#to-organize"),
    backToPlayBtn: root.querySelector("#back-to-play"),
    scoreBtn: root.querySelector("#score"),
    resetBtns: Array.from(root.querySelectorAll("[data-reset]")),
    backToOrganizeBtn: root.querySelector("#back-to-organize"),
    resultBackOrganizeBtn: root.querySelector("#result-back-organize"),
    scoreBlack: root.querySelector("#score-black"),
    scoreWhite: root.querySelector("#score-white"),
    winner: root.querySelector("#winner"),
    logList: root.querySelector("#event-log"),
    info: root.querySelector("#info"),
    setupModal: root.querySelector("#setup-modal"),
    closeSetup: root.querySelector("#close-setup"),
    resultModal: root.querySelector("#result-modal"),
    closeResult: root.querySelector("#close-result"),
  };

  return { root, elements };
}
