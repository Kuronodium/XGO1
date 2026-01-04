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

.match-code-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 2px 0;
  letter-spacing: 0.12em;
  font-size: 11px;
  color: var(--color-muted);
}

.match-code-label {
  text-transform: uppercase;
}

.match-code-stones {
  display: inline-flex;
  gap: 8px;
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
  position: relative;
}

.side-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
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
  border: 1px solid var(--color-stone-black-outline);
  box-shadow: 0 10px 24px var(--color-stone-black-shadow), inset 0 2px 6px var(--color-stone-black-inner);
}

.turn-indicator {
  --ripple-scale: 2;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.you-tag {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-primary-on-accent);
  background: var(--color-primary-button-bg);
  padding: 4px 10px;
  border-radius: 999px;
  box-shadow: var(--shadow-primary);
  opacity: 0;
  pointer-events: none;
}

.side-panel.is-you .you-tag {
  opacity: 1;
}

.offline-tag {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
  border: 1px solid var(--color-button-border);
  padding: 3px 10px;
  border-radius: 999px;
  opacity: 0;
  pointer-events: none;
}

.side-panel.is-offline .you-tag {
  opacity: 0;
}

.side-panel.is-offline .offline-tag {
  opacity: 1;
}

.pass-button {
  min-width: 120px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.pass-button.is-passed {
  background: var(--color-primary-button-bg);
  color: var(--color-primary-button-text);
  border-color: transparent;
  box-shadow: var(--shadow-primary);
}

.turn-indicator::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.7);
  opacity: 0;
  transform: scale(1);
  animation: none;
}

.turn-indicator::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  opacity: 0;
  transform: scale(1);
  animation: none;
  animation-delay: 0.9s;
}

body.turn-black #side-black .turn-indicator::before,
body.turn-black #side-black .turn-indicator::after {
  opacity: 1;
  animation-name: turn-ripple;
  animation-duration: 1.8s;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
}

body.turn-white #side-white .turn-indicator::before,
body.turn-white #side-white .turn-indicator::after {
  opacity: 1;
  animation-name: turn-ripple;
  animation-duration: 1.8s;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
}

@keyframes turn-ripple {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  70% {
    opacity: 0.25;
  }
  100% {
    opacity: 0;
    transform: scale(var(--ripple-scale));
  }
}

.board-shell {
  padding: 0;
  border-radius: 22px;
  background: var(--color-board-cell);
  box-shadow: var(--shadow-board);
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
.ui-panel[data-mode="setup"] .play-controls,
.ui-panel[data-mode="match"] .play-controls {
  display: none;
}

.ui-panel[data-mode="match"] .organize-controls {
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

.is-hidden {
  display: none;
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-elevated);
  border-radius: 14px;
  padding: 32px;
  width: min(520px, 100%);
  backdrop-filter: blur(4px);
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

.match-panel {
  width: min(560px, 100%);
  padding: 36px 32px 30px;
  border-radius: 24px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.2)), var(--color-card);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.match-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.14), transparent 60%);
  opacity: 0.7;
  pointer-events: none;
}

.match-panel .match-title {
  margin: 0;
  font-size: 36px;
  letter-spacing: 0.3em;
}

.match-panel .match-subtitle {
  margin: 8px 0 18px;
  color: var(--color-muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 12px;
}

.match-segmented {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0 auto 18px;
  max-width: 320px;
}

.match-segmented button {
  border-radius: 12px;
  padding: 12px 0;
  font-size: 18px;
  background: var(--color-pill-dark-bg);
  border: 1px solid var(--color-button-border);
  color: var(--color-muted);
  transition: transform 120ms ease, box-shadow 140ms ease, background 140ms ease, color 140ms ease;
}

.match-segmented button.is-active {
  background: var(--color-primary-button-bg);
  color: var(--color-primary-button-text);
  border-color: transparent;
  box-shadow: var(--shadow-primary);
}

.match-code {
  display: grid;
  gap: 12px;
  margin-top: 8px;
}

.match-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 360px;
  margin: 0 auto;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.match-code-value {
  color: var(--color-text);
  letter-spacing: 0.3em;
}

.match-stones {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 14px 18px;
  margin: 0 auto;
  background: var(--color-panel-shine);
  border-radius: 18px;
  max-width: 360px;
  border: 1px solid var(--color-border);
}

.match-stones.is-disabled {
  opacity: 0.35;
  filter: grayscale(0.6);
  pointer-events: none;
}

.stone-toggle {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  display: grid;
  place-items: center;
  padding: 0;
}

.stone-toggle .stone {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  transition: transform 120ms ease, box-shadow 140ms ease;
}

.stone-toggle.is-white .stone {
  background: radial-gradient(
    circle at 35% 30%,
    var(--color-stone-white-highlight),
    var(--color-stone-white-base)
  );
  box-shadow: 0 8px 18px var(--color-stone-shadow-outer), inset 0 2px 6px var(--color-stone-shadow-inner);
}

.stone-toggle.is-black .stone {
  background: radial-gradient(
    circle at 35% 30%,
    var(--color-stone-black-highlight),
    var(--color-stone-black-base)
  );
  border: 1px solid var(--color-stone-black-outline-soft);
  box-shadow: 0 8px 18px var(--color-stone-black-shadow), inset 0 2px 6px var(--color-stone-black-inner);
}

.match-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.match-actions .start-button {
  min-width: 240px;
  border-radius: 999px;
  font-size: 18px;
  padding: 14px 32px;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin: 0 auto;
  max-width: 280px;
}

.segmented.obstacle-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 360px;
}

.segmented button {
  border-radius: 12px;
  padding: 12px 0;
  font-size: 18px;
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

.setup-section {
  margin-top: 18px;
}

.setup-label {
  margin: 0 0 12px;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.setup-panel .modal-header {
  justify-content: center;
  margin-bottom: 24px;
}

.setup-panel .buttons {
  justify-content: center;
  margin-top: 24px;
}

.setup-panel .start-button {
  font-size: 18px;
  padding: 14px 32px;
  min-width: 220px;
  border-radius: 999px;
}

.setup-panel .modal-title {
  font-size: 32px;
  letter-spacing: 0.2em;
}

.setup-panel .modal-subtitle {
  margin: 8px 0 24px;
  color: var(--color-muted);
}

@media (max-width: 640px) {
  .match-code-bar {
    font-size: 10px;
  }

  .match-panel {
    padding: 28px 20px 24px;
  }

  .match-panel .match-title {
    font-size: 30px;
  }

  .match-stones {
    gap: 10px;
    padding: 12px;
  }

  .stone-toggle {
    width: 48px;
    height: 48px;
  }

  .pass-button {
    min-width: 96px;
    padding: 8px 14px;
    font-size: 12px;
  }

  .turn-indicator {
    --ripple-scale: 1.4;
  }
  .main-grid {
    grid-template-columns: 1fr;
  }

  .big-stone {
    width: 14vw;
    height: 14vw;
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
      <div class="match-code-bar is-hidden" id="match-code-bar">
        <span class="match-code-label">Code</span>
        <div class="match-code-stones" id="match-code-stones">
          <span class="stone small" data-index="0"></span>
          <span class="stone small" data-index="1"></span>
          <span class="stone small" data-index="2"></span>
          <span class="stone small" data-index="3"></span>
          <span class="stone small" data-index="4"></span>
        </div>
      </div>
      <main class="main-grid">
        <aside class="side-panel" id="side-white">
          <div class="capture-tray" id="capture-white-tray"></div>
          <div class="side-stack">
            <div class="turn-indicator">
              <span class="you-tag">YOU</span>
              <span class="offline-tag">offline</span>
              <div class="big-stone"></div>
            </div>
            <button class="panel-btn pass-button" id="pass-white">PASS</button>
          </div>
        </aside>

        <section class="board-shell">
          <div id="board-host" class="board-host"></div>
        </section>

        <aside class="side-panel" id="side-black">
          <div class="side-stack">
            <div class="turn-indicator">
              <span class="you-tag">YOU</span>
              <span class="offline-tag">offline</span>
              <div class="big-stone black"></div>
            </div>
            <button class="panel-btn pass-button" id="pass-black">PASS</button>
          </div>
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
          <div class="panel-controls room-controls">
            <button class="panel-btn ghost" id="leave-room">Leave</button>
          </div>
        </div>
      </footer>

    <div class="modal" id="match-modal">
      <div class="modal-panel match-panel">
        <h2 class="match-title">XGO</h2>
        <p class="match-subtitle">Match Type</p>
        <div class="match-segmented" id="match-segment">
          <button data-mode="offline">Offline</button>
          <button data-mode="online">Online</button>
        </div>
        <div class="match-code">
          <div class="match-code-header">
            <span>Match Code</span>
            <span class="match-code-value" id="match-code-value">00000</span>
          </div>
          <div class="match-stones" id="match-stones">
            <button class="stone-toggle" data-index="0" aria-pressed="false"><span class="stone"></span></button>
            <button class="stone-toggle" data-index="1" aria-pressed="false"><span class="stone"></span></button>
            <button class="stone-toggle" data-index="2" aria-pressed="false"><span class="stone"></span></button>
            <button class="stone-toggle" data-index="3" aria-pressed="false"><span class="stone"></span></button>
            <button class="stone-toggle" data-index="4" aria-pressed="false"><span class="stone"></span></button>
          </div>
        </div>
        <div class="match-actions">
          <button class="primary start-button" id="start-match">Create Game</button>
        </div>
      </div>
    </div>

    <div class="modal" id="setup-modal">
      <div class="modal-panel setup-panel">
        <div class="modal-header">
          <h2 class="modal-title">XGO</h2>
        </div>
        <p class="modal-subtitle">GO game, encountering X</p>
        <div class="setup-section">
          <p class="setup-label">Board Size</p>
          <div class="segmented" id="size-segment">
            <button data-size="7">7x7</button>
            <button data-size="9">9x9</button>
          </div>
        </div>
        <div class="setup-section">
          <p class="setup-label">Obstacles</p>
        <div class="segmented obstacle-grid" id="obstacle-segment">
          <button data-count="0">0</button>
          <button data-count="2">2</button>
          <button data-count="4">4</button>
          <button data-count="6">6</button>
          <button data-count="8">8</button>
          <button data-count="12">12</button>
        </div>
        </div>
        <div class="buttons">
          <button class="primary start-button" id="start-setup">Start Game</button>
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
    boardSizeSegment: root.querySelector("#size-segment"),
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
    matchSegment: root.querySelector("#match-segment"),
    matchStones: root.querySelector("#match-stones"),
    matchCodeValue: root.querySelector("#match-code-value"),
    startMatchBtn: root.querySelector("#start-match"),
    matchModal: root.querySelector("#match-modal"),
    matchCodeBar: root.querySelector("#match-code-bar"),
    matchCodeStones: root.querySelector("#match-code-stones"),
    passBlackBtn: root.querySelector("#pass-black"),
    passWhiteBtn: root.querySelector("#pass-white"),
    leaveRoomBtn: root.querySelector("#leave-room"),
    setupModal: root.querySelector("#setup-modal"),
    resultModal: root.querySelector("#result-modal"),
    closeResult: root.querySelector("#close-result"),
  };

  return { root, elements };
}
