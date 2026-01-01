// 盤面の受動的な描画とクリック/移動入力を扱うコンポーネント
import { CellState } from "../domain/types.js";
import { placeStone } from "../domain/board.js";
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
  padding: 16px;
  border-radius: 26px;
  background-color: transparent;
  background-origin: content-box;
  background-clip: border-box;
  box-shadow: inset 0 0 0 1px var(--color-board-outline);
}

.board-ripple {
  position: absolute;
  left: var(--ripple-x);
  top: var(--ripple-y);
  width: var(--ripple-size);
  height: var(--ripple-size);
  border-radius: 50%;
  border: 0.1px solid rgba(255, 255, 255, 0.35);
  transform: translate(-50%, -50%) scale(0.2);
  opacity: 0.5;
  pointer-events: none;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.12);
  animation: board-ripple 900ms ease-out;
}

@keyframes board-ripple {
  0% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(0.2);
  }
  70% {
    opacity: 0.18;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(20);
  }
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

.grid-line {
  position: absolute;
  background: var(--color-grid-line);
  pointer-events: none;
  z-index: 0;
}

.grid-line--v {
  width: 1px;
  height: 100%;
  left: 50%;
  top: 0;
  transform: translateX(-0.5px);
}

.grid-line--h {
  width: 100%;
  height: 1px;
  left: 0;
  top: 50%;
  transform: translateY(-0.5px);
}

.cell.edge-top .grid-line--v {
  top: 50%;
  height: 50%;
}

.cell.edge-bottom .grid-line--v {
  top: 0;
  height: 50%;
}

.cell.edge-left .grid-line--h {
  left: 50%;
  width: 50%;
}

.cell.edge-right .grid-line--h {
  left: 0;
  width: 50%;
}

.cell > *:not(.grid-line) {
  position: relative;
  z-index: 1;
}

.cell:hover {
  background: transparent;
}

.board[data-mode="play"] .cell {
  cursor: default;
}

.board[data-mode="play"] .cell.placeable {
  cursor: pointer;
}

.board[data-mode="play"] .cell.illegal {
  cursor: not-allowed;
}

.board[data-mode="play"] .cell:not(.placeable) {
  pointer-events: none;
}

.cell.empty::after {
  content: "";
  position: absolute;
  width: 70%;
  height: 70%;
  border-radius: 999px;
  opacity: 0;
  transition: opacity 120ms ease;
}


.board[data-mode="play"][data-next-player="black"] .cell.placeable:hover::after {
  opacity: 0.45;
  background: radial-gradient(
    circle at 35% 30%,
    var(--color-stone-black-highlight),
    var(--color-stone-black-base)
  );
  border: 1px solid var(--color-stone-black-outline);
  box-shadow: inset 0 2px 6px var(--color-stone-black-inner), 0 4px 10px var(--color-stone-black-shadow);
}

.board[data-mode="play"][data-next-player="white"] .cell.placeable:hover::after {
  opacity: 0.45;
  background: radial-gradient(
    circle at 35% 30%,
    var(--color-stone-white-highlight),
    var(--color-stone-white-base)
  );
  box-shadow: inset 0 2px 6px var(--color-stone-shadow-inner), 0 4px 10px var(--color-stone-shadow-outer);
}

@media (hover: none) {
  .board[data-mode="play"][data-next-player="black"] .cell.placeable:active::after {
    opacity: 0.45;
    background: radial-gradient(
      circle at 35% 30%,
      var(--color-stone-black-highlight),
      var(--color-stone-black-base)
    );
    border: 1px solid var(--color-stone-black-outline);
    box-shadow: inset 0 2px 6px var(--color-stone-black-inner), 0 4px 10px var(--color-stone-black-shadow);
  }

  .board[data-mode="play"][data-next-player="white"] .cell.placeable:active::after {
    opacity: 0.45;
    background: radial-gradient(
      circle at 35% 30%,
      var(--color-stone-white-highlight),
      var(--color-stone-white-base)
    );
    box-shadow: inset 0 2px 6px var(--color-stone-shadow-inner), 0 4px 10px var(--color-stone-shadow-outer);
  }
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

  function render(board, mode, nextPlayer) {
    currentBoard = board;
    currentMode = mode;
    const size = board.length;
    root.innerHTML = "";
    if (nextPlayer) {
      root.dataset.nextPlayer = nextPlayer;
    } else {
      delete root.dataset.nextPlayer;
    }
    root.dataset.mode = mode ? mode.toLowerCase() : "";
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
        if (x === 0) btn.classList.add("edge-left");
        if (x === size - 1) btn.classList.add("edge-right");
        if (y === 0) btn.classList.add("edge-top");
        if (y === size - 1) btn.classList.add("edge-bottom");
        btn.setAttribute("aria-label", `(${x + 1}, ${y + 1})`);

        const lineV = document.createElement("span");
        lineV.className = "grid-line grid-line--v";
        const lineH = document.createElement("span");
        lineH.className = "grid-line grid-line--h";
        btn.appendChild(lineV);
        btn.appendChild(lineH);

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
        } else {
          btn.classList.add("empty");
          if (currentMode === GameMode.Play && nextPlayer) {
            const result = placeStone(board, nextPlayer, { x, y });
            if (result.ok) {
              btn.classList.add("placeable");
            } else {
              btn.classList.add("illegal");
              btn.disabled = true;
            }
          }
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

  function animateObstacle(mark) {
    mark.classList.remove("is-spinning");
    void mark.offsetWidth;
    mark.classList.add("is-spinning");
    mark.addEventListener(
      "animationend",
      () => {
        mark.classList.remove("is-spinning");
      },
      { once: true }
    );
  }

  return {
    element: root,
    render,
    triggerRippleAt(point) {
      const cell = root.querySelector(`.cell[data-x="${point.x}"][data-y="${point.y}"]`);
      if (!cell) return;
      const cellRect = cell.getBoundingClientRect();
      const boardRect = root.getBoundingClientRect();
      const ripple = document.createElement("div");
      const size = Math.max(cellRect.width * 0.9, 12);
      ripple.className = "board-ripple";
      ripple.style.setProperty("--ripple-size", `${size}px`);
      ripple.style.setProperty("--ripple-x", `${cellRect.left - boardRect.left + cellRect.width / 2}px`);
      ripple.style.setProperty("--ripple-y", `${cellRect.top - boardRect.top + cellRect.height / 2}px`);
      ripple.addEventListener("animationend", () => ripple.remove());
      root.appendChild(ripple);
    },
    triggerObstacleSpin(point) {
      const obstacleCells = root.querySelectorAll(".cell.obstacle");
      obstacleCells.forEach((cell) => {
        const ox = Number(cell.dataset.x);
        const oy = Number(cell.dataset.y);
        if (Number.isNaN(ox) || Number.isNaN(oy)) return;
        const dx = Math.abs(ox - point.x);
        const dy = Math.abs(oy - point.y);
        const isDiagonal = dx > 0 && dy > 0;
        const inRange = isDiagonal ? dx <= 1 && dy <= 1 : dx <= 2 && dy <= 2;
        if (inRange) {
          const mark = cell.querySelector(".obstacle-mark");
          if (mark) animateObstacle(mark);
        }
      });
    },
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
