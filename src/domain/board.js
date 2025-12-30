// XGOの純粋な盤面ロジック（着手・アゲハマ・地計算、障害物対応）
import { BOARD_SIZE, CellState, Player, otherPlayer, isOnBoard } from "./types.js";

export function createBoard(size = BOARD_SIZE, obstacles = []) {
  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => CellState.Empty)
  );
  obstacles.forEach((p) => {
    if (isOnBoard(p, size)) {
      board[p.y][p.x] = CellState.Obstacle;
    }
  });
  return board;
}

export function cloneBoard(board) {
  return board.map((row) => row.slice());
}

export function neighbors(point, size = BOARD_SIZE) {
  const deltas = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  return deltas
    .map((d) => ({ x: point.x + d.x, y: point.y + d.y }))
    .filter((p) => isOnBoard(p, size));
}

function pointKey(p) {
  return `${p.x},${p.y}`;
}

function collectGroup(board, start) {
  const target = board[start.y][start.x];
  const size = board.length;
  const visited = new Set();
  const group = [];
  let liberties = 0;
  const queue = [start];

  while (queue.length) {
    const current = queue.pop();
    const key = pointKey(current);
    if (visited.has(key)) continue;
    visited.add(key);
    group.push(current);

    neighbors(current, size).forEach((n) => {
      const cell = board[n.y][n.x];
      if (cell === CellState.Empty) {
        liberties += 1;
      } else if (cell === target) {
        const nKey = pointKey(n);
        if (!visited.has(nKey)) {
          queue.push(n);
        }
      }
    });
  }

  return { group, liberties };
}

export function placeStone(board, player, point) {
  const size = board.length;
  if (!isOnBoard(point, size)) {
    return { ok: false, reason: "out-of-board" };
  }
  if (board[point.y][point.x] !== CellState.Empty) {
    return { ok: false, reason: "occupied" };
  }

  const nextBoard = cloneBoard(board);
  nextBoard[point.y][point.x] = player;

  const opponent = otherPlayer(player);
  const visited = new Set();
  let captured = 0;

  neighbors(point, size).forEach((n) => {
    const cell = nextBoard[n.y][n.x];
    if (cell !== opponent) return;
    const key = pointKey(n);
    if (visited.has(key)) return;

    const { group, liberties } = collectGroup(nextBoard, n);
    group.forEach((p) => visited.add(pointKey(p)));
    if (liberties === 0) {
      group.forEach((p) => {
        nextBoard[p.y][p.x] = CellState.Empty;
      });
      captured += group.length;
    }
  });

  const placedGroup = collectGroup(nextBoard, point);
  if (placedGroup.liberties === 0) {
    return { ok: false, reason: "suicide" };
  }

  return { ok: true, board: nextBoard, captured };
}

export function evaluateTerritory(board) {
  const size = board.length;
  const visited = new Set();
  let black = 0;
  let white = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] !== CellState.Empty) continue;
      const start = { x, y };
      const key = pointKey(start);
      if (visited.has(key)) continue;

      const queue = [start];
      const area = [];
      const touching = new Set();

      while (queue.length) {
        const p = queue.pop();
        const pKey = pointKey(p);
        if (visited.has(pKey)) continue;
        visited.add(pKey);
        area.push(p);

        neighbors(p, size).forEach((n) => {
          const cell = board[n.y][n.x];
          if (cell === CellState.Empty) {
            if (!visited.has(pointKey(n))) queue.push(n);
          } else if (cell === CellState.Black) {
            touching.add(Player.Black);
          } else if (cell === CellState.White) {
            touching.add(Player.White);
          } else {
            // Obstacle: ignore for ownership.
          }
        });
      }

      if (touching.size === 1) {
        const owner = touching.has(Player.Black) ? Player.Black : Player.White;
        if (owner === Player.Black) black += area.length;
        else white += area.length;
      }
    }
  }

  return { blackTerritory: black, whiteTerritory: white };
}

export function computeScore(board, prisoners, komi = 0) {
  const { blackTerritory, whiteTerritory } = evaluateTerritory(board);
  const blackScore = blackTerritory + (prisoners.black || 0);
  const whiteScore = whiteTerritory + (prisoners.white || 0) + komi;
  return { blackScore, whiteScore, blackTerritory, whiteTerritory, komi };
}
