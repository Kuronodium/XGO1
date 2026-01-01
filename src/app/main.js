// XGOアプリの画面配線とイベントハンドラをまとめたエントリポイント
import { createBoardView } from "../components/board.js";
import { createStatusBar } from "../components/statusBar.js";
import { createSetupPanel } from "../components/setupPanel.js";
import { createPlayPanel } from "../components/playPanel.js";
import { createResultPanel } from "../components/resultPanel.js";
import { createEventLog } from "../components/eventLog.js";
import { createCaptureTray } from "../components/captureTray.js";
import { createLayout } from "../components/layout.js";
import { applyPalette } from "../theme/palette.js";
import {
  GameMode,
  createInitialState,
  randomizeObstacles,
  updateObstacleConfig,
  startGame,
  playAt,
  enterOrganize,
  moveStone,
  requestScore,
  backToOrganize,
  resetGame,
} from "../state/gameState.js";
import { emit } from "../events/bus.js";
import { Events } from "../events/types.js";

let state = createInitialState();
let setupClosed = false;
let resultClosed = false;
let eventLogOpen = false;

applyPalette();

const appRoot = document.getElementById("app-root");
const { root, elements: els } = createLayout();
const fallback = document.getElementById("fallback");
if (fallback) fallback.remove();
appRoot.appendChild(root);

const boardView = createBoardView({
  onPlay: handlePlay,
  onMove: handleMove,
});
els.boardHost.appendChild(boardView.element);

const statusBar = createStatusBar({
  modeEl: els.mode,
  playerEl: els.player,
  playerDotEl: els.playerDot,
  capturesBlackEl: els.capturesBlack,
  capturesWhiteEl: els.capturesWhite,
  infoEl: els.info,
});

const setupPanel = createSetupPanel(
  {
    segmentEl: els.obstacleSegment,
    randomizeBtn: els.randomizeBtn,
    startButtons: [els.startSetupBtn],
  },
  {
    onCountChange: (count) => setState(updateObstacleConfig(state, { count })),
    onRandomize: () => {
      setState(randomizeObstacles(state));
      logEvent(Events.GameStarted, { withObstacles: state.obstaclesEnabled, obstacles: state.obstacles });
    },
    onStart: () => {
      setState(startGame(state));
      logEvent(Events.GameStarted, { withObstacles: state.obstaclesEnabled, obstacles: state.obstacles });
    },
  }
);

const playPanel = createPlayPanel(
  {
    toOrganizeBtn: els.organizeBtn,
    backToPlayBtn: els.backToPlayBtn,
    scoreBtn: els.scoreBtn,
    backToOrganizeBtn: els.backToOrganizeBtn,
    resetButtons: els.resetBtns,
  },
  {
    onOrganize: () => setState(enterOrganize(state)),
    onBackToPlay: () => setState({ ...state, mode: GameMode.Play }),
    onScore: handleScore,
    onBackToOrganize: () => setState(backToOrganize(state)),
    onReset: () => {
      setupClosed = false;
      setState(resetGame(state));
      logEvent(Events.GameReset);
    },
  }
);

const resultPanel = createResultPanel({
  blackEl: els.scoreBlack,
  whiteEl: els.scoreWhite,
  winnerEl: els.winner,
});

const captureTray = createCaptureTray({
  blackTrayEl: els.captureBlackTray,
  whiteTrayEl: els.captureWhiteTray,
  blackCountEl: els.capturesBlack,
  whiteCountEl: els.capturesWhite,
});

const eventLog = createEventLog({ listEl: els.logList });

if (els.openEventLog) {
  els.openEventLog.addEventListener("click", () => {
    eventLogOpen = true;
    render();
  });
}

if (els.closeEventLog) {
  els.closeEventLog.addEventListener("click", () => {
    eventLogOpen = false;
    render();
  });
}

if (els.closeSetup) {
  els.closeSetup.addEventListener("click", () => {
    closeSetupModal();
  });
}

if (els.closeResult) {
  els.closeResult.addEventListener("click", () => {
    resultClosed = false;
    setState(backToOrganize(state));
  });
}

if (els.resultBackOrganizeBtn) {
  els.resultBackOrganizeBtn.addEventListener("click", () => {
    resultClosed = false;
    setState(backToOrganize(state));
  });
}

function logEvent(type, payload) {
  emit(type, payload);
  eventLog.log(type, payload);
}

function setState(next) {
  const prevMode = state.mode;
  state = next;
  if (state.mode !== GameMode.Organize) {
    boardView.clearSelection();
  }
  if (state.mode !== GameMode.Setup) setupClosed = false;
  if (state.mode !== GameMode.Result) resultClosed = false;
  render();
  if (prevMode !== state.mode) {
    logEvent(Events.ModeChanged, { from: prevMode, to: state.mode });
  }
}

function render() {
  boardView.render(state.board, state.mode);
  statusBar.render(state);
  setupPanel.render(state);
  playPanel.render(state);
  resultPanel.render(state.lastScore, state.captures);
  captureTray.render(state.captures);
  if (els.setupModal) {
    const open = state.mode === GameMode.Setup && !setupClosed;
    els.setupModal.classList.toggle("is-open", open);
  }
  if (els.resultModal) {
    const open = state.mode === GameMode.Result && !resultClosed;
    els.resultModal.classList.toggle("is-open", open);
  }
  if (els.eventLogModal) {
    els.eventLogModal.classList.toggle("is-open", eventLogOpen);
  }
}

function handlePlay(point) {
  const placingPlayer = state.currentPlayer;
  const { next, ok } = playAt(state, point);
  if (!ok) return;
  setState(next);
  logEvent(Events.StonePlaced, { player: placingPlayer, point });
}

function handleMove(from, to) {
  const { next, ok } = moveStone(state, from, to);
  if (!ok) return;
  setState(next);
  logEvent(Events.StoneMoved, { from, to });
}

function handleScore() {
  logEvent(Events.ScoreRequested);
  const { next, ok, detail } = requestScore(state);
  if (!ok) return;
  setState(next);
  logEvent(Events.ScoreComputed, detail);
}

function openSetupModal() {
  setupClosed = false;
  if (state.mode !== GameMode.Setup) {
    setState({ ...state, mode: GameMode.Setup });
  } else {
    render();
  }
}

function closeSetupModal() {
  setupClosed = true;
  render();
}

function closeResultModal() {
  resultClosed = true;
  render();
}

setState(state);
