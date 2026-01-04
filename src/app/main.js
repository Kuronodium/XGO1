// XGOアプリの画面配線とイベントハンドラをまとめたエントリポイント
import { createBoardView } from "../components/board.js";
import { createStatusBar } from "../components/statusBar.js";
import { createSetupPanel } from "../components/setupPanel.js";
import { createMatchPanel } from "../components/matchPanel.js";
import { createPlayPanel } from "../components/playPanel.js";
import { createResultPanel } from "../components/resultPanel.js";
import { createCaptureTray } from "../components/captureTray.js";
import { createLayout } from "../components/layout.js";
import { applyPalette } from "../theme/palette.js";
import { cloneBoard } from "../domain/board.js";
import { Player } from "../domain/types.js";
import {
  GameMode,
  createInitialState,
  enterSetup,
  MatchType,
  updateMatchType,
  toggleMatchCode,
  updateBoardSize,
  updateObstacleConfig,
  passTurn,
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
let resultClosed = false;
const history = { past: [], future: [] };

applyPalette();

const matchCodeSize = state.matchCode?.length ?? 5;

function parseMatchCode(value, size) {
  if (!value) return null;
  const clean = String(value).replace(/[^01]/g, "");
  if (clean.length !== size) return null;
  return clean.split("").map((bit) => (bit === "1" ? 1 : 0));
}

function updateUrlWithCode(bits) {
  const params = new URLSearchParams(window.location.search);
  if (!bits) {
    params.delete("code");
  } else {
    params.set("code", bits.join(""));
  }
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

const initialCode = parseMatchCode(
  new URLSearchParams(window.location.search).get("code"),
  matchCodeSize
);
if (initialCode) {
  state = {
    ...state,
    matchType: MatchType.Online,
    matchCode: initialCode,
  };
}

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
  turnCountEl: els.turnCount,
  rootEl: document.body,
});

const setupPanel = createSetupPanel(
  {
    segmentEl: els.obstacleSegment,
    sizeSegmentEl: els.boardSizeSegment,
    startButtons: [els.startSetupBtn],
  },
  {
    onCountChange: (count) =>
      setState(updateObstacleConfig(state, { count }), { clearHistory: true }),
    onSizeChange: (size) =>
      setState(updateBoardSize(state, size), { clearHistory: true }),
    onStart: () => {
      setState(startGame(state), { clearHistory: true });
      logEvent(Events.GameStarted, { withObstacles: state.obstaclesEnabled, obstacles: state.obstacles });
    },
  }
);

const matchPanel = createMatchPanel(
  {
    segmentEl: els.matchSegment,
    stonesEl: els.matchStones,
    codeEl: els.matchCodeValue,
    startButton: els.startMatchBtn,
  },
  {
    onModeChange: (mode) => setState(updateMatchType(state, mode)),
    onToggleStone: (index) => {
      if (state.matchType !== MatchType.Online) return;
      setState(toggleMatchCode(state, index));
    },
    onStart: () => {
      if (state.matchType === MatchType.Online) {
        updateUrlWithCode(state.matchCode ?? []);
      } else {
        updateUrlWithCode(null);
      }
      setState(enterSetup(state), { clearHistory: true });
    },
  }
);

const playPanel = createPlayPanel(
  {
    panelEl: els.uiPanel,
    undoBtn: els.undoBtn,
    redoBtn: els.redoBtn,
    toOrganizeBtn: els.organizeBtn,
    backToPlayBtn: els.backToPlayBtn,
    scoreBtn: els.scoreBtn,
    resetButtons: els.resetBtns,
  },
  {
    onUndo: handleUndo,
    onRedo: handleRedo,
    onOrganize: () => setState(enterOrganize(state), { clearHistory: true }),
    onBackToPlay: () => setState({ ...state, mode: GameMode.Play }, { clearHistory: true }),
    onScore: handleScore,
    onReset: () => {
      setState(resetGame(state), { clearHistory: true });
      logEvent(Events.GameReset);
    },
  }
);

const resultPanel = createResultPanel({
  blackEl: els.scoreBlack,
  whiteEl: els.scoreWhite,
  winnerEl: els.winner,
});

const captureSides = createCaptureTray(
  {
    blackTrayEl: els.captureBlackTray,
    whiteTrayEl: els.captureWhiteTray,
  },
  { maxStones: 18, stoneSize: "small" }
);

if (els.closeResult) {
  els.closeResult.addEventListener("click", () => {
    resultClosed = false;
    setState(backToOrganize(state), { clearHistory: true });
  });
}

if (els.resultBackOrganizeBtn) {
  els.resultBackOrganizeBtn.addEventListener("click", () => {
    resultClosed = false;
    setState(backToOrganize(state), { clearHistory: true });
  });
}

function cloneStateSnapshot(source) {
  return {
    ...source,
    boardSize: source.boardSize,
    board: cloneBoard(source.board),
    captures: { ...source.captures },
    obstacles: source.obstacles.map((p) => ({ ...p })),
    lastScore: source.lastScore ? { ...source.lastScore } : null,
    consecutivePasses: source.consecutivePasses ?? 0,
    lastPassBy: source.lastPassBy ?? null,
  };
}

function clearHistory() {
  history.past = [];
  history.future = [];
}

function pushHistory(prevState) {
  history.past.push(cloneStateSnapshot(prevState));
  history.future = [];
}

function logEvent(type, payload) {
  emit(type, payload);
}

function setState(next, { recordHistory = false, clearHistory: shouldClear = false } = {}) {
  if (recordHistory) pushHistory(state);
  if (shouldClear) clearHistory();
  const prevMode = state.mode;
  state = next;
  if (state.mode !== GameMode.Organize) {
    boardView.clearSelection();
  }
  if (state.mode !== GameMode.Result) resultClosed = false;
  render();
  if (prevMode !== state.mode) {
    logEvent(Events.ModeChanged, { from: prevMode, to: state.mode });
  }
}

function render() {
  boardView.render(state.board, state.mode, state.currentPlayer);
  statusBar.render(state);
  matchPanel.render(state);
  setupPanel.render(state);
  playPanel.render(state, {
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  });
  resultPanel.render(state.lastScore, state.captures);
  captureSides.render(state.captures);
  const isOnline = state.matchType === MatchType.Online;
  const local = state.localPlayer ?? Player.Black;
  const isPlay = state.mode === GameMode.Play;
  const canBlackPass = isPlay && state.currentPlayer === Player.Black && (!isOnline || local === Player.Black);
  const canWhitePass = isPlay && state.currentPlayer === Player.White && (!isOnline || local === Player.White);
  if (els.sideBlack) {
    els.sideBlack.classList.toggle("is-you", isOnline && local === Player.Black);
  }
  if (els.sideWhite) {
    els.sideWhite.classList.toggle("is-you", isOnline && local === Player.White);
  }
  if (els.passBlackBtn) {
    els.passBlackBtn.disabled = !canBlackPass;
    els.passBlackBtn.classList.toggle("is-passed", state.lastPassBy === Player.Black);
  }
  if (els.passWhiteBtn) {
    els.passWhiteBtn.disabled = !canWhitePass;
    els.passWhiteBtn.classList.toggle("is-passed", state.lastPassBy === Player.White);
  }
  if (els.setupModal) {
    const open = state.mode === GameMode.Setup;
    els.setupModal.classList.toggle("is-open", open);
  }
  if (els.matchModal) {
    const open = state.mode === GameMode.Match;
    els.matchModal.classList.toggle("is-open", open);
  }
  if (els.resultModal) {
    const open = state.mode === GameMode.Result && !resultClosed;
    els.resultModal.classList.toggle("is-open", open);
  }
}

function handlePlay(point) {
  if (state.matchType === MatchType.Online && state.currentPlayer !== state.localPlayer) {
    return;
  }
  const placingPlayer = state.currentPlayer;
  const { next, ok } = playAt(state, point);
  if (!ok) return;
  setState(next, { recordHistory: true });
  boardView.triggerRippleAt?.(point);
  boardView.triggerObstacleSpin?.(point);
  logEvent(Events.StonePlaced, { player: placingPlayer, point });
}

function handlePass(player) {
  if (state.currentPlayer !== player) return;
  if (state.matchType === MatchType.Online && state.localPlayer !== player) return;
  const { next, ok, ended } = passTurn(state);
  if (!ok) return;
  setState(next, { recordHistory: !ended, clearHistory: ended });
}

function handleMove(from, to) {
  const { next, ok } = moveStone(state, from, to);
  if (!ok) return;
  setState(next, { recordHistory: true });
  logEvent(Events.StoneMoved, { from, to });
}

function handleScore() {
  logEvent(Events.ScoreRequested);
  const { next, ok, detail } = requestScore(state);
  if (!ok) return;
  setState(next, { clearHistory: true });
  logEvent(Events.ScoreComputed, detail);
}

function handleUndo() {
  if (!history.past.length) return;
  history.future.push(cloneStateSnapshot(state));
  const prev = history.past.pop();
  setState(prev);
}

function handleRedo() {
  if (!history.future.length) return;
  history.past.push(cloneStateSnapshot(state));
  const next = history.future.pop();
  setState(next);
}

setState(state);

if (els.passBlackBtn) {
  els.passBlackBtn.addEventListener("click", () => handlePass(Player.Black));
}
if (els.passWhiteBtn) {
  els.passWhiteBtn.addEventListener("click", () => handlePass(Player.White));
}
