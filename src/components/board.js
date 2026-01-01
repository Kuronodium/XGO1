// 盤面の受動的な描画とクリック/移動入力を扱うコンポーネント
import { CellState } from "../domain/types.js";
import { GameMode } from "../state/gameState.js";
import { createStone } from "./stone.js";
import { createObstacle } from "./obstacle.js";
import { ensureStyle } from "./styleRegistry.js";

ensureStyle(
  "board-styles",
  `
.board {
  position: relative;
  width: 100%;
  display: grid;
  gap: 0;
  grid-template-columns: repeat(var(--board-size), 1fr);
  background-image:
    linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px);
  background-size: var(--board-spacing) var(--board-spacing);
  background-position: var(--board-offset) var(--board-offset);
  background-repeat: repeat;
  padding: 24px;
  border-radius: 18px;
  background-color: transparent;
  background-origin: content-box;
  background-clip: border-box;
  box-shadow: inset 0 0 0 2px var(--color-board-outline);
}

.cell {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: grid;
  place-items: center;
  aspect-ratio: 1/1;
  color: var(--color-muted);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.cell:hover .stone {
  transform: scale(1.04);
}

.cell:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.cell.obstacle {
  background: transparent;
}

.cell.is-selected .stone {
  box-shadow: 0 0 0 3px var(--color-accent);
}

.cell.drag-source .stone {
  opacity: 0.35;
  filter: saturate(0.7);
}

.drag-ghost {
  width: 48px;
  height: 48px;
}
`
);

export function createBoardView({ onPlay, onMove }) {
  const root = document.createElement("div");
  root.className = "board";

  let currentBoard = [];
  let currentMode = GameMode.Setup;
  let selected = null;
  let dragGhost = null;

  function updateGridMetrics() {
    const size = currentBoard.length;
    if (!size) return;
    const width = root.getBoundingClientRect().width;
    if (!width) return;
    const styles = getComputedStyle(root);
    const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const contentWidth = width - paddingX;
    if (contentWidth <= 0) return;
    const cell = contentWidth / size;
    root.style.setProperty("--board-spacing", `${cell}px`);
    root.style.setProperty("--board-offset", `${cell / 2}px`);
  }

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateGridMetrics);
    });
    resizeObserver.observe(root);
  }

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
    const spacing = size > 0 ? 100 / size : 100;
    const offset = size > 0 ? 50 / size : 0;
    root.style.setProperty("--board-size", size);
    root.style.setProperty("--board-spacing", `${spacing}%`);
    root.style.setProperty("--board-offset", `${offset}%`);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cell = board[y][x];
        const btn = document.createElement("button");
        btn.className = "cell";
        btn.dataset.x = x;
        btn.dataset.y = y;
        btn.setAttribute("aria-label", `(${x + 1}, ${y + 1})`);

        let stoneEl = null;
        if (cell === CellState.Black || cell === CellState.White) {
          stoneEl = createStone(cell);
          btn.appendChild(stoneEl);
          if (selected && selected.x === x && selected.y === y) {
            btn.classList.add("is-selected");
          }
          if (currentMode === GameMode.Organize) {
            btn.draggable = true;
            btn.addEventListener("dragstart", (e) => {
              btn.classList.add("drag-source");
              e.dataTransfer?.setData("text/plain", pointKey({ x, y }));
              if (stoneEl) {
                dragGhost = stoneEl.cloneNode(true);
                dragGhost.style.position = "fixed";
                dragGhost.style.top = "-100px";
                dragGhost.style.left = "-100px";
                dragGhost.style.width = "48px";
                dragGhost.style.height = "48px";
                dragGhost.style.opacity = "0.95";
                dragGhost.style.pointerEvents = "none";
                document.body.appendChild(dragGhost);
                e.dataTransfer?.setDragImage(dragGhost, 24, 24);
              }
            });
            btn.addEventListener("dragend", () => {
              btn.classList.remove("drag-source");
              if (dragGhost) {
                dragGhost.remove();
                dragGhost = null;
              }
            });
          }
        } else if (cell === CellState.Obstacle) {
          btn.classList.add("obstacle");
          btn.appendChild(createObstacle());
        }

        if (currentMode === GameMode.Organize) {
          btn.addEventListener("dragover", (e) => {
            // Allow drop only on empty cell during organize.
            if (currentBoard[y][x] === CellState.Empty) {
              e.preventDefault();
            }
          });
          btn.addEventListener("drop", (e) => {
            const data = e.dataTransfer?.getData("text/plain");
            if (!data) return;
            const [sx, sy] = data.split(",").map(Number);
            if (Number.isNaN(sx) || Number.isNaN(sy)) return;
            onMove?.({ x: sx, y: sy }, { x, y });
          });
        }

        btn.addEventListener("click", () => handleClick({ x, y }));
        root.appendChild(btn);
      }
    }

    // Keep grid aligned to resized board.
    requestAnimationFrame(updateGridMetrics);
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
