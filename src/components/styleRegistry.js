// コンポーネントごとにスタイルを注入するための簡易レジストリ
const injected = new Set();

export function ensureStyle(id, cssText) {
  if (injected.has(id)) return;
  const style = document.createElement("style");
  style.dataset.id = id;
  style.textContent = cssText;
  document.head.appendChild(style);
  injected.add(id);
}
