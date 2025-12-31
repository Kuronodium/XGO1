// イベントの最新履歴をUIに表示するシンプルなログコンポーネント
import { ensureStyle } from "./styleRegistry.js";

ensureStyle(
  "event-log-styles",
  `
.log {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow: auto;
}

.log li {
  padding: 8px 10px;
  background: var(--color-log-bg);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  color: var(--color-muted);
  font-family: "Space Grotesk", "Noto Sans JP", monospace;
  font-size: 0.9rem;
}
`
);
export function createEventLog({ listEl, maxItems = 8 }) {
  function log(type, payload) {
    if (!listEl) return;
    const item = document.createElement("li");
    item.textContent = `${type}${payload ? ": " + JSON.stringify(payload) : ""}`;
    listEl.prepend(item);
    while (listEl.children.length > maxItems) {
      listEl.removeChild(listEl.lastChild);
    }
  }

  return { log };
}
