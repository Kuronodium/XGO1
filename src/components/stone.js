// 黒石・白石の見た目を生成するコンポーネント
import { ensureStyle } from "./styleRegistry.js";

ensureStyle(
  "stone-styles",
  `
.stone {
  width: 76%;
  height: 76%;
  border-radius: 999px;
  display: block;
  box-shadow: inset 0 2px 6px var(--color-stone-shadow-inner), 0 4px 10px var(--color-stone-shadow-outer);
  transition: transform 80ms ease;
}

.stone.black {
  background: radial-gradient(circle at 35% 30%, var(--color-stone-black-highlight), var(--color-stone-black-base));
}

.stone.white {
  background: radial-gradient(circle at 35% 30%, var(--color-stone-white-highlight), var(--color-stone-white-base));
}
`
);

export function createStone(color) {
  const stone = document.createElement("span");
  stone.className = `stone ${color}`;
  return stone;
}
