// アプリ全体のHTML骨格（トップバー・盤面・手番サイド）を生成するコンポーネント
import { ensureStyle } from "./styleRegistry.js";

ensureStyle(
  "layout-styles",
  `
.app-shell {
  --ui-panel-fixed-height: 0px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  gap: 40px;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr minmax(320px, 640px) 1fr;
  gap: 24px;
  align-items: center;
}

.side-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: nowrap;
  padding: 18px;
  border-radius: 20px;
  min-height: 360px;
  background: transparent;
}

.big-stone {
  width: 64px;
  height: 64px;
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
  padding: 0;
  border-radius: 22px;
  background: var(--color-board-cell);
  box-shadow: var(--shadow-elevated);
}

.board-host {
  width: 100%;
}

.capture-tray {
  --capture-slot: 18px;
  --capture-gap: 8px;
  --capture-rows: 18;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--capture-gap);
  width: var(--capture-slot);
  min-height: calc(
    var(--capture-rows) * var(--capture-slot) + (var(--capture-rows) - 1) * var(--capture-gap)
  );
  flex: 0 0 auto;
}

.ui-panel {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-radius: 999px;
  background: var(--color-surface);
  box-shadow: var(--shadow-elevated);
}

.ui-panel__group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ui-panel__group--left {
  justify-content: flex-start;
}

.ui-panel__group--right {
  justify-content: flex-end;
}

.ui-panel__center {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: var(--color-text);
  letter-spacing: 0.18em;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.icon {
  font-family: "Material Symbols Rounded";
  font-weight: 400;
  font-style: normal;
  font-size: 20px;
  line-height: 1;
  display: inline-block;
  text-transform: none;
  letter-spacing: normal;
  -webkit-font-smoothing: antialiased;
}

.turn-label {
  text-transform: uppercase;
  color: var(--color-muted);
}

.ui-panel__center .turn-count {
  font-size: 30px;
  letter-spacing: 0.04em;
}

.panel-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ui-panel[data-mode="play"] .organize-controls {
  display: none;
}

.ui-panel[data-mode="organize"] .play-controls,
.ui-panel[data-mode="result"] .play-controls,
.ui-panel[data-mode="setup"] .play-controls {
  display: none;
}

.panel-btn {
  background: var(--color-button-bg);
  color: var(--color-text);
  border: 1px solid var(--color-button-border);
  border-radius: 999px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 140ms ease, background 140ms ease;
  white-space: nowrap;
}

.panel-btn:hover {
  background: var(--color-button-hover-bg);
  transform: translateY(-1px);
}

.panel-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.panel-btn.icon-btn {
  min-width: 72px;
  padding: 10px 0;
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

@media (max-width: 640px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .big-stone {
    width: 16vw;
    height: 16vw;
  }

  .side-panel {
    min-height: auto;
    width: 100%;
    justify-content: space-between;
    padding: 12px 8px;
  }

  .ui-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-radius: 24px;
    position: fixed;
    bottom: 16px;
    left: 16px;
    right: 16px;
    z-index: 20;
  }

  .ui-panel__group {
    justify-content: center;
    gap: 8px;
  }

  .ui-panel__center {
    font-size: 16px;
    letter-spacing: 0.14em;
  }

  .ui-panel__center .turn-count {
    font-size: 24px;
  }

  .panel-btn {
    padding: 8px 14px;
    font-size: 16px;
  }

  .panel-btn.icon-btn {
    min-width: 64px;
  }

  .capture-tray {
    --capture-gap: 6px;
    width: auto;
    min-height: var(--capture-slot);
    flex-direction: row;
    justify-content: center;
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
  }

  #side-white .big-stone {
    order: 1;
  }

  #side-white .capture-tray {
    order: 2;
    justify-content: start;
  }

  #side-black .capture-tray {
    order: 1;
    justify-content: end;
  }

  #side-black .big-stone {
    order: 2;
  }

  .app-shell {
    padding: 24px 16px 144px;
  }
}
`
);

export function createLayout() {
  const template = document.createElement("template");
  template.innerHTML = `
    <div class="app-shell">
      <main class="main-grid">
        <aside class="side-panel" id="side-white">
          <div class="capture-tray" id="capture-white-tray"></div>
          <div class="big-stone"></div>
        </aside>

        <section class="board-shell">
          <div id="board-host" class="board-host"></div>
        </section>

        <aside class="side-panel" id="side-black">
          <div class="big-stone black"></div>
          <div class="capture-tray" id="capture-black-tray"></div>
        </aside>
      </main>

      <footer class="ui-panel" id="ui-panel" data-mode="play">
        <div class="ui-panel__group ui-panel__group--left">
          <button class="panel-btn icon-btn" id="undo" aria-label="Undo"><span class="icon">undo</span></button>
          <button class="panel-btn icon-btn" id="redo" aria-label="Redo"><span class="icon">redo</span></button>
        </div>
        <div class="ui-panel__center">
          <span class="turn-label">TURN</span>
          <span class="turn-count" id="turn-count">1</span>
        </div>
        <div class="ui-panel__group ui-panel__group--right">
          <div class="panel-controls play-controls">
            <button class="panel-btn" id="to-organize">Finish Game</button>
          </div>
          <div class="panel-controls organize-controls">
            <button class="panel-btn" id="back-to-play">Resume</button>
            <button class="panel-btn" id="score">Judge</button>
            <button class="panel-btn" data-reset>Reset</button>
          </div>
        </div>
      </footer>

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

    </div>
  `;

  const root = template.content.firstElementChild;
  const elements = {
    boardHost: root.querySelector("#board-host"),
    sideBlack: root.querySelector("#side-black"),
    sideWhite: root.querySelector("#side-white"),
    uiPanel: root.querySelector("#ui-panel"),
    turnCount: root.querySelector("#turn-count"),
    captureBlackTray: root.querySelector("#capture-black-tray"),
    captureWhiteTray: root.querySelector("#capture-white-tray"),
    obstacleSegment: root.querySelector("#obstacle-segment"),
    startSetupBtn: root.querySelector("#start-setup"),
    organizeBtn: root.querySelector("#to-organize"),
    backToPlayBtn: root.querySelector("#back-to-play"),
    scoreBtn: root.querySelector("#score"),
    resetBtns: Array.from(root.querySelectorAll("[data-reset]")),
    undoBtn: root.querySelector("#undo"),
    redoBtn: root.querySelector("#redo"),
    resultBackOrganizeBtn: root.querySelector("#result-back-organize"),
    scoreBlack: root.querySelector("#score-black"),
    scoreWhite: root.querySelector("#score-white"),
    winner: root.querySelector("#winner"),
    setupModal: root.querySelector("#setup-modal"),
    resultModal: root.querySelector("#result-modal"),
    closeResult: root.querySelector("#close-result"),
  };

  return { root, elements };
}
