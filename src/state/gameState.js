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
  const boardSize = BOARD_SIZE;
  const obstaclesEnabled = true;
  const obstacleCount = 4;
  const obstacles = obstaclesEnabled ? randomObstacles(obstacleCount, boardSize) : [];
  return {
    mode: GameMode.Setup,
    boardSize,
    board: createBoard(boardSize, obstacles),
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
  const inner = [];
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      inner.push({ x, y });
    }
  }

  for (let i = inner.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [inner[i], inner[j]] = [inner[j], inner[i]];
  }

  return inner.slice(0, Math.min(count, inner.length));
}

export function updateObstacleConfig(state, { enabled, count }) {
  const obstacleCount = count ?? state.obstacleCount;
  const obstaclesEnabled = enabled ?? obstacleCount > 0;
  const boardSize = state.boardSize ?? BOARD_SIZE;
  const obstacles = obstaclesEnabled ? randomObstacles(obstacleCount, boardSize) : [];
  return {
    ...state,
    obstaclesEnabled,
    obstacleCount,
    obstacles,
    board: createBoard(boardSize, obstacles),
    mode: GameMode.Setup,
    captures: { black: 0, white: 0 },
    currentPlayer: Player.Black,
    lastScore: null,
  };
}

export function updateBoardSize(state, boardSize) {
  const size = Number(boardSize);
  if (!Number.isFinite(size)) return state;
  const obstacles = state.obstaclesEnabled ? randomObstacles(state.obstacleCount, size) : [];
  return {
    ...state,
    boardSize: size,
    obstacles,
    board: createBoard(size, obstacles),
    mode: GameMode.Setup,
    captures: { black: 0, white: 0 },
    currentPlayer: Player.Black,
    lastScore: null,
  };
}

export function randomizeObstacles(state) {
  const boardSize = state.boardSize ?? BOARD_SIZE;
  const obstacles = state.obstaclesEnabled ? randomObstacles(state.obstacleCount, boardSize) : [];
  return {
    ...state,
    obstacles,
    board: createBoard(boardSize, obstacles),
    mode: GameMode.Setup,
    currentPlayer: Player.Black,
    captures: { black: 0, white: 0 },
    lastScore: null,
  };
}

export function startGame(state) {
  const obstacles = state.obstaclesEnabled ? state.obstacles : [];
  const boardSize = state.boardSize ?? BOARD_SIZE;
  return {
    ...state,
    board: createBoard(boardSize, obstacles),
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
  const boardSize = state.board.length;
  if (!isOnBoard(from, boardSize) || !isOnBoard(to, boardSize)) {
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
  const boardSize = state.boardSize ?? BOARD_SIZE;
  const obstacles = state.obstaclesEnabled ? randomObstacles(state.obstacleCount, boardSize) : [];
  return {
    ...state,
    mode: GameMode.Setup,
    obstacles,
    board: createBoard(boardSize, obstacles),
    currentPlayer: Player.Black,
    captures: { black: 0, white: 0 },
    lastScore: null,
  };
}
