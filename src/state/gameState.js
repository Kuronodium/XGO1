// XGOのゲーム進行状態とモード遷移、設定更新を管理するステート層
import { BOARD_SIZE, CellState, Player, otherPlayer, isOnBoard } from "../domain/types.js";
import { cloneBoard, createBoard, placeStone, computeScore } from "../domain/board.js";

export const GameMode = {
  Setup: "SETUP",
  Play: "PLAY",
  Organize: "ORGANIZE",
  Result: "RESULT",
};

export function createInitialState() {
  const obstaclesEnabled = true;
  const obstacleCount = 4;
  const obstacles = obstaclesEnabled ? randomObstacles(obstacleCount) : [];
  return {
    mode: GameMode.Setup,
    board: createBoard(BOARD_SIZE, obstacles),
    currentPlayer: Player.Black,
    captures: { black: 0, white: 0 },
    komi: 0,
    obstaclesEnabled,
    obstacleCount,
    obstacles,
    lastScore: null,
  };
}

export function randomObstacles(count, size = BOARD_SIZE) {
  const spots = new Set();
  while (spots.size < count) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    spots.add(`${x},${y}`);
  }
  return Array.from(spots).map((key) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
  });
}

export function updateObstacleConfig(state, { enabled, count }) {
  const obstaclesEnabled = enabled ?? state.obstaclesEnabled;
  const obstacleCount = count ?? state.obstacleCount;
  const obstacles = obstaclesEnabled ? randomObstacles(obstacleCount) : [];
  return {
    ...state,
    obstaclesEnabled,
    obstacleCount,
    obstacles,
    board: createBoard(BOARD_SIZE, obstacles),
    mode: GameMode.Setup,
    captures: { black: 0, white: 0 },
    currentPlayer: Player.Black,
    lastScore: null,
  };
}

export function randomizeObstacles(state) {
  const obstacles = state.obstaclesEnabled ? randomObstacles(state.obstacleCount) : [];
  return {
    ...state,
    obstacles,
    board: createBoard(BOARD_SIZE, obstacles),
    mode: GameMode.Setup,
    currentPlayer: Player.Black,
    captures: { black: 0, white: 0 },
    lastScore: null,
  };
}

export function startGame(state) {
  const obstacles = state.obstaclesEnabled ? state.obstacles : [];
  return {
    ...state,
    board: createBoard(BOARD_SIZE, obstacles),
    mode: GameMode.Play,
    currentPlayer: Player.Black,
    captures: { black: 0, white: 0 },
    lastScore: null,
  };
}

export function playAt(state, point) {
  if (state.mode !== GameMode.Play) {
    return { next: state, ok: false, reason: "not-in-play" };
  }
  const result = placeStone(state.board, state.currentPlayer, point);
  if (!result.ok) {
    return { next: state, ok: false, reason: result.reason };
  }
  const captures = { ...state.captures };
  captures[state.currentPlayer === Player.Black ? "black" : "white"] += result.captured;
  const next = {
    ...state,
    board: result.board,
    captures,
    currentPlayer: otherPlayer(state.currentPlayer),
  };
  return { next, ok: true };
}

export function enterOrganize(state) {
  return { ...state, mode: GameMode.Organize };
}

export function moveStone(state, from, to) {
  if (state.mode !== GameMode.Organize) {
    return { next: state, ok: false, reason: "not-in-organize" };
  }
  if (!isOnBoard(from) || !isOnBoard(to)) {
    return { next: state, ok: false, reason: "out-of-board" };
  }
  const board = cloneBoard(state.board);
  const moving = board[from.y][from.x];
  if (moving !== CellState.Black && moving !== CellState.White) {
    return { next: state, ok: false, reason: "no-stone" };
  }
  if (board[to.y][to.x] !== CellState.Empty) {
    return { next: state, ok: false, reason: "occupied" };
  }

  board[from.y][from.x] = CellState.Empty;
  board[to.y][to.x] = moving;

  return { next: { ...state, board }, ok: true };
}

export function requestScore(state) {
  if (state.mode !== GameMode.Organize) {
    return { next: state, ok: false, reason: "not-in-organize" };
  }
  const detail = computeScore(state.board, state.captures, state.komi);
  const next = {
    ...state,
    mode: GameMode.Result,
    lastScore: detail,
  };
  return { next, ok: true, detail };
}

export function backToOrganize(state) {
  if (state.mode !== GameMode.Result) return state;
  return { ...state, mode: GameMode.Organize };
}

export function resetGame(state) {
  const obstacles = state.obstaclesEnabled ? randomObstacles(state.obstacleCount) : [];
  return {
    ...state,
    mode: GameMode.Setup,
    obstacles,
    board: createBoard(BOARD_SIZE, obstacles),
    currentPlayer: Player.Black,
    captures: { black: 0, white: 0 },
    lastScore: null,
  };
}
