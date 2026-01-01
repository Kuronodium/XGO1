// アプリ全体のHTML骨格（トップバー・盤面・手番サイド）を生成するコンポーネント
import { ensureStyle } from "./styleRegistry.js";

ensureStyle(
  "layout-styles",
  `
.app-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  gap: 22px;
}

.topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
}

.score-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 999px;
  background: var(--color-score-bg);
}

.score-block.is-active {
  background: var(--color-score-bg-active);
  box-shadow: 0 0 20px var(--color-score-glow);
}

.chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.chips .stone.small {
  width: 12px;
  height: 12px;
}

.score-num {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.turn-center {
  font-size: 18px;
  text-align: center;
  letter-spacing: 0.2em;
  color: var(--color-muted);
}

.turn-label {
  text-transform: uppercase;
}

.turn-center .turn-count {
  color: var(--color-text);
  font-weight: 600;
  margin-left: 6px;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr minmax(320px, 640px) 1fr;
  gap: 24px;
  align-items: center;
}

.side-panel {
  display: grid;
  place-items: center;
  gap: 12px;
  padding: 24px;
  border-radius: 20px;
  min-height: 320px;
  background: transparent;
}

.side-panel.is-active {
  background: var(--color-side-active-bg);
  box-shadow: inset 0 0 40px var(--color-side-active-glow);
}

.turn-badge {
  background: var(--color-turn-badge-bg);
  color: var(--color-turn-badge-text);
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 8px;
  letter-spacing: 0.08em;
  opacity: 0;
  transition: opacity 120ms ease;
}

.side-panel.is-active .turn-badge {
  opacity: 1;
}

.big-stone {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    var(--color-stone-white-highlight),
    var(--color-stone-white-base)
  );
  box-shadow: 0 10px 24px var(--color-stone-shadow-outer), inset 0 2px 8px var(--color-stone-shadow-inner);
}

.big-stone.black {
  background: radial-gradient(
    circle at 35% 30%,
    var(--color-stone-black-highlight),
    var(--color-stone-black-base)
  );
  border: 2px solid var(--color-stone-black-outline);
  box-shadow: 0 10px 24px var(--color-stone-black-shadow), inset 0 2px 6px var(--color-stone-black-inner);
}

.board-shell {
  padding: 22px;
  border-radius: 22px;
  background: var(--color-board-cell);
  box-shadow: var(--shadow-elevated);
}

.board-host {
  width: 100%;
}

.capture-tray {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  min-height: 64px;
}

.capture-overflow {
  font-size: 0.85rem;
  color: var(--color-muted);
}

.bottom-controls {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border-radius: 12px;
  background: var(--color-button-bg);
  border: 1px solid var(--color-button-border);
  color: var(--color-text);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.action-btn:hover {
  background: var(--color-button-hover-bg);
}

.action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid var(--color-button-border-strong);
  background: var(--color-checkbox-bg);
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

button {
  background: var(--color-button-bg);
  color: var(--color-text);
  border: 1px solid var(--color-button-border);
  border-radius: 12px;
  padding: 10px 16px;
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
  background: var(--color-primary-button-bg);
  color: var(--color-primary-button-text);
  border: none;
  box-shadow: var(--shadow-primary);
}

button.ghost {
  background: transparent;
  border-color: var(--color-ghost-border);
}

.modal {
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  background: var(--color-overlay);
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
  border: 1px solid var(--color-stone-black-outline-soft);
}

.stone-label.white::before {
  background: var(--color-stone-white-highlight);
  border: 1px solid var(--color-border);
}

.segmented {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
  margin: 6px 0 12px;
}

.segmented button {
  border-radius: 8px;
  padding: 8px 0;
}

.segmented button.is-active {
  background: var(--color-primary-button-bg);
  color: var(--color-primary-button-text);
  border: none;
  box-shadow: var(--shadow-primary);
}

.setup-panel {
  text-align: center;
}

.setup-panel .modal-header {
  justify-content: center;
}

.setup-panel .buttons {
  justify-content: center;
}

.setup-panel .start-button {
  font-size: 18px;
  padding: 14px 32px;
  min-width: 180px;
}

@media (max-width: 980px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .side-panel {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .topbar {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
`
);

export function createLayout() {
  const template = document.createElement("template");
  template.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="score-block" id="topbar-black">
          <div class="chips" id="topbar-black-chips"></div>
          <div class="score-num" id="captures-black">0</div>
        </div>
        <div class="turn-center">
          <span class="turn-label">TURN</span>
          <span class="turn-count" id="turn-count">1</span>
        </div>
        <div class="score-block" id="topbar-white">
          <div class="score-num" id="captures-white">0</div>
          <div class="chips" id="topbar-white-chips"></div>
        </div>
      </header>

      <main class="main-grid">
        <aside class="side-panel" id="side-white">
          <div class="turn-badge">TURN</div>
          <div class="big-stone"></div>
          <div class="capture-tray" id="capture-white-tray"></div>
        </aside>

        <section class="board-shell">
          <div id="board-host" class="board-host"></div>
        </section>

        <aside class="side-panel" id="side-black">
          <div class="turn-badge">TURN</div>
          <div class="big-stone black"></div>
          <div class="capture-tray" id="capture-black-tray"></div>
        </aside>
      </main>

      <div class="bottom-controls">
        <button class="action-btn" id="open-event-log"><span class="checkbox"></span>Show Log</button>
        <button class="action-btn" id="to-organize">Finish Game</button>
        <button class="action-btn" id="score">Judge</button>
        <button class="action-btn" id="back-to-organize">Back</button>
        <button class="action-btn" id="back-to-play">Resume</button>
        <button class="action-btn" data-reset>Reset</button>
      </div>

    <div class="modal" id="setup-modal">
      <div class="modal-panel setup-panel">
        <div class="modal-header">
          <h2>Setup</h2>
        </div>
        <div class="segmented" id="obstacle-segment">
          <button data-count="0">0</button>
          <button data-count="1">1</button>
          <button data-count="2">2</button>
          <button data-count="3">3</button>
          <button data-count="4">4</button>
          <button data-count="5">5</button>
          <button data-count="6">6</button>
        </div>
        <div class="buttons">
          <button class="primary start-button" id="start-setup">Start</button>
        </div>
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

    <div class="modal" id="event-log-modal">
      <div class="modal-panel">
        <div class="modal-header">
          <h2>Event Log</h2>
          <button class="ghost" id="close-event-log">閉じる</button>
        </div>
        <ul id="event-log" class="log"></ul>
      </div>
    </div>
    </div>
  `;

  const root = template.content.firstElementChild;
  const elements = {
    boardHost: root.querySelector("#board-host"),
    capturesBlack: root.querySelector("#captures-black"),
    capturesWhite: root.querySelector("#captures-white"),
    topbarBlack: root.querySelector("#topbar-black"),
    topbarWhite: root.querySelector("#topbar-white"),
    topbarBlackChips: root.querySelector("#topbar-black-chips"),
    topbarWhiteChips: root.querySelector("#topbar-white-chips"),
    sideBlack: root.querySelector("#side-black"),
    sideWhite: root.querySelector("#side-white"),
    turnCount: root.querySelector("#turn-count"),
    captureBlackTray: root.querySelector("#capture-black-tray"),
    captureWhiteTray: root.querySelector("#capture-white-tray"),
    obstacleSegment: root.querySelector("#obstacle-segment"),
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
    setupModal: root.querySelector("#setup-modal"),
    closeSetup: root.querySelector("#close-setup"),
    resultModal: root.querySelector("#result-modal"),
    closeResult: root.querySelector("#close-result"),
    eventLogModal: root.querySelector("#event-log-modal"),
    openEventLog: root.querySelector("#open-event-log"),
    closeEventLog: root.querySelector("#close-event-log"),
  };

  return { root, elements };
}
