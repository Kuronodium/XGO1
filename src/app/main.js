// XGOアプリの画面配線とイベントハンドラをまとめたエントリポイント
import { createBoardView } from "../components/board.js";
import { CellState, Player } from "../domain/types.js";
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

const el = {
  boardHost: document.getElementById("board-host"),
  mode: document.getElementById("mode"),
  player: document.getElementById("player"),
  playerDot: document.getElementById("player-dot"),
  capturesBlack: document.getElementById("captures-black"),
  capturesWhite: document.getElementById("captures-white"),
  obstaclesToggle: document.getElementById("obstacles-toggle"),
  obstacleCount: document.getElementById("obstacle-count"),
  randomizeBtn: document.getElementById("randomize"),
  startBtn: document.getElementById("start"),
  startDupBtn: document.getElementById("start-dup"),
  organizeBtn: document.getElementById("to-organize"),
  backToPlayBtn: document.getElementById("back-to-play"),
  scoreBtn: document.getElementById("score"),
  resetBtns: document.querySelectorAll("[data-reset]"),
  backToOrganizeBtn: document.getElementById("back-to-organize"),
  scoreBlack: document.getElementById("score-black"),
  scoreWhite: document.getElementById("score-white"),
  winner: document.getElementById("winner"),
  logList: document.getElementById("event-log"),
  info: document.getElementById("info"),
};

const boardView = createBoardView({
  onPlay: handlePlay,
  onMove: handleMove,
});
el.boardHost.appendChild(boardView.element);

function logEvent(type, payload) {
  emit(type, payload);
  if (!el.logList) return;
  const item = document.createElement("li");
  item.textContent = `${type}${payload ? ": " + JSON.stringify(payload) : ""}`;
  el.logList.prepend(item);
  while (el.logList.children.length > 8) {
    el.logList.removeChild(el.logList.lastChild);
  }
}

function setState(next) {
  const prevMode = state.mode;
  state = next;
  if (state.mode !== GameMode.Organize) {
    boardView.clearSelection();
  }
  boardView.render(state.board, state.mode);
  render();
  if (prevMode !== state.mode) {
    logEvent(Events.ModeChanged, { from: prevMode, to: state.mode });
  }
}

function render() {
  el.mode.textContent = state.mode;
  el.player.textContent = state.currentPlayer === Player.Black ? "Black" : "White";
  el.player.dataset.color = state.currentPlayer;
  if (el.playerDot) {
    el.playerDot.dataset.color = state.currentPlayer;
  }
  el.capturesBlack.textContent = state.captures.black;
  el.capturesWhite.textContent = state.captures.white;
  el.obstaclesToggle.checked = state.obstaclesEnabled;
  el.obstacleCount.value = String(state.obstacleCount);

  el.randomizeBtn.disabled = state.mode !== GameMode.Setup;
  el.startBtn.disabled = state.mode !== GameMode.Setup;
  if (el.startDupBtn) {
    el.startDupBtn.disabled = state.mode !== GameMode.Setup;
  }
  el.organizeBtn.disabled = state.mode !== GameMode.Play;
  el.backToPlayBtn.disabled = state.mode !== GameMode.Organize;
  el.scoreBtn.disabled = state.mode !== GameMode.Organize;
  el.backToOrganizeBtn.disabled = state.mode !== GameMode.Result;

  const lastScore = state.lastScore;
  if (lastScore) {
    el.scoreBlack.textContent = `${lastScore.blackScore} (地:${lastScore.blackTerritory} + 取:${state.captures.black})`;
    el.scoreWhite.textContent = `${lastScore.whiteScore} (地:${lastScore.whiteTerritory} + 取:${state.captures.white} + コミ:${lastScore.komi})`;
    const diff = lastScore.blackScore - lastScore.whiteScore;
    if (diff === 0) {
      el.winner.textContent = "Even";
    } else if (diff > 0) {
      el.winner.textContent = `Black +${diff}`;
    } else {
      el.winner.textContent = `White +${Math.abs(diff)}`;
    }
  } else {
    el.scoreBlack.textContent = "-";
    el.scoreWhite.textContent = "-";
    el.winner.textContent = "-";
  }

  updateInfo();
}

function updateInfo() {
  const messages = {
    [GameMode.Setup]: "Setup: choose obstacle count and start.",
    [GameMode.Play]: "Play: tap an empty point to place a stone. Obstacles (X) are walls.",
    [GameMode.Organize]: "Organize: tap a stone to pick it up, then tap an empty spot to move it.",
    [GameMode.Result]: "Result: review the score, then return to organize or reset.",
  };
  el.info.textContent = messages[state.mode] || "";
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

el.obstaclesToggle.addEventListener("change", (e) => {
  const enabled = e.target.checked;
  setState(updateObstacleConfig(state, { enabled }));
});

el.obstacleCount.addEventListener("change", (e) => {
  const raw = Number(e.target.value);
  const count = Number.isFinite(raw) ? Math.max(0, Math.min(20, raw)) : 0;
  setState(updateObstacleConfig(state, { count }));
});

el.randomizeBtn.addEventListener("click", () => {
  setState(randomizeObstacles(state));
  logEvent(Events.GameStarted, { withObstacles: state.obstaclesEnabled, obstacles: state.obstacles });
});

el.startBtn.addEventListener("click", () => {
  setState(startGame(state));
  logEvent(Events.GameStarted, { withObstacles: state.obstaclesEnabled, obstacles: state.obstacles });
});

if (el.startDupBtn) {
  el.startDupBtn.addEventListener("click", () => {
    setState(startGame(state));
    logEvent(Events.GameStarted, { withObstacles: state.obstaclesEnabled, obstacles: state.obstacles });
  });
}

el.organizeBtn.addEventListener("click", () => {
  setState(enterOrganize(state));
});

el.backToPlayBtn.addEventListener("click", () => {
  setState({ ...state, mode: GameMode.Play });
});

el.scoreBtn.addEventListener("click", () => {
  logEvent(Events.ScoreRequested);
  const { next, ok, detail } = requestScore(state);
  if (!ok) return;
  setState(next);
  logEvent(Events.ScoreComputed, detail);
});

el.backToOrganizeBtn.addEventListener("click", () => {
  setState(backToOrganize(state));
});

el.resetBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    setState(resetGame(state));
    logEvent(Events.GameReset);
  })
);

setState(state);
