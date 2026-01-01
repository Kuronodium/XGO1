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

.stone.small {
  width: 18px;
  height: 18px;
  box-shadow: inset 0 1px 3px var(--color-stone-shadow-inner), 0 2px 5px var(--color-stone-shadow-outer);
}

.stone.black {
  background: radial-gradient(circle at 35% 30%, var(--color-stone-black-highlight), var(--color-stone-black-base));
  border: 1px solid var(--color-stone-black-outline);
  box-shadow:
    inset 0 2px 6px var(--color-stone-shadow-inner),
    0 0 0 1px var(--color-stone-black-outline),
    0 4px 10px var(--color-stone-black-shadow);
}

.stone.white {
  background: radial-gradient(circle at 35% 30%, var(--color-stone-white-highlight), var(--color-stone-white-base));
}
`
);

export function createStone(color, size = "normal") {
  const stone = document.createElement("span");
  stone.className = `stone ${color}${size === "small" ? " small" : ""}`;
  return stone;
}
