// 盤面の障害物Xを表示するコンポーネント
import { ensureStyle } from "./styleRegistry.js";

ensureStyle(
  "obstacle-styles",
  `
.obstacle-mark {
  position: relative;
  width: 68%;
  height: 68%;
  display: inline-block;
  pointer-events: none;
}

.obstacle-mark::before,
.obstacle-mark::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--color-obstacle-line);
  transform-origin: center;
}

.obstacle-mark::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.obstacle-mark::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
`
);

export function createObstacle() {
  const mark = document.createElement("span");
  mark.className = "obstacle-mark";
  mark.setAttribute("aria-hidden", "true");
  return mark;
}
