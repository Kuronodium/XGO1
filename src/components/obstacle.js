// 盤面の障害物Xを表示するコンポーネント
import { ensureStyle } from "./styleRegistry.js";

ensureStyle(
  "obstacle-styles",
  `
.obstacle-mark {
  font-weight: 700;
  color: var(--color-text);
  background: linear-gradient(135deg, var(--color-obstacle-stripe-1), var(--color-obstacle-stripe-2));
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
`
);

export function createObstacle() {
  const mark = document.createElement("span");
  mark.className = "obstacle-mark";
  mark.textContent = "X";
  return mark;
}
