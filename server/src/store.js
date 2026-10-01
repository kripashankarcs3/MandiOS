/** In-memory session store with TTL. Swap for Redis when running more than one instance. */
const TTL_MS = 30 * 60 * 1000;
const MAX = 500;
const map = new Map();

function sweep() {
  const now = Date.now();
  for (const [id, v] of map) if (now - v.createdAt > TTL_MS) map.delete(id);
}

export const sessions = {
  set(id, value) {
    sweep();
    if (map.size >= MAX) map.delete(map.keys().next().value);
    map.set(id, { ...value, createdAt: Date.now() });
  },
  get(id) {
    const v = map.get(id);
    if (!v) return null;
    if (Date.now() - v.createdAt > TTL_MS) { map.delete(id); return null; }
    return v;
  },
  update(id, patch) {
    const v = this.get(id);
    if (v) map.set(id, { ...v, ...patch });
  },
};
