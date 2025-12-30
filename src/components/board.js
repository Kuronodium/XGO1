// 盤面の受動的な描画とクリック/移動入力を扱うコンポーネント
import { CellState, Player } from "../domain/types.js";
import { GameMode } from "../state/gameState.js";

export function createBoardView({ onPlay, onMove }) {
  const root = document.createElement("div");
  root.className = "board";

  let currentBoard = [];
  let currentMode = GameMode.Setup;
  let selected = null;

  function pointKey(p) {
    return `${p.x},${p.y}`;
  }

  function setSelected(newPoint) {
    selected = newPoint;
    render(currentBoard, currentMode);
  }

  function handleClick(point) {
    if (currentMode === GameMode.Play) {
      onPlay?.(point);
      return;
    }
    if (currentMode === GameMode.Organize) {
      const cell = currentBoard[point.y][point.x];
      if (!selected) {
        if (cell === CellState.Black || cell === CellState.White) {
          setSelected(point);
        }
        return;
      }
      if (pointKey(selected) === pointKey(point)) {
        setSelected(null);
        return;
      }
      const targetCell = currentBoard[point.y][point.x];
      if (targetCell === CellState.Empty) {
        onMove?.(selected, point);
      } else if (targetCell === CellState.Black || targetCell === CellState.White) {
        setSelected(point);
      } else {
        setSelected(null);
      }
    }
  }

  function render(board, mode) {
    currentBoard = board;
    currentMode = mode;
    const size = board.length;
    root.innerHTML = "";
    root.style.setProperty("--board-size", size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cell = board[y][x];
        const btn = document.createElement("button");
        btn.className = "cell";
        btn.dataset.x = x;
        btn.dataset.y = y;
        btn.setAttribute("aria-label", `(${x + 1}, ${y + 1})`);

        if (cell === CellState.Black || cell === CellState.White) {
          const stone = document.createElement("span");
          stone.className = `stone ${cell}`;
          btn.appendChild(stone);
          if (selected && selected.x === x && selected.y === y) {
            btn.classList.add("is-selected");
          }
        } else if (cell === CellState.Obstacle) {
          btn.classList.add("obstacle");
          btn.textContent = "X";
        }

        btn.addEventListener("click", () => handleClick({ x, y }));
        root.appendChild(btn);
      }
    }
  }

  return {
    element: root,
    render,
    clearSelection() {
      setSelected(null);
    },
    setMode(mode) {
      currentMode = mode;
      if (mode !== GameMode.Organize) setSelected(null);
      render(currentBoard, currentMode);
    },
  };
}
