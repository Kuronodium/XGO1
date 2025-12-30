// 効果やログ用に出来事を購読できるシンプルなイベントバス
const listeners = new Map();

export function subscribe(type, handler) {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type).add(handler);
  return () => listeners.get(type)?.delete(handler);
}

export function emit(type, payload) {
  const handlers = listeners.get(type);
  if (!handlers) return;
  handlers.forEach((fn) => {
    try {
      fn(payload);
    } catch (e) {
      console.error(`[event:${type}] handler failed`, e);
    }
  });
}
