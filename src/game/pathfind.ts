// A* on a rectangular grid. All tiles are walkable in this MVP.

export type Point = { x: number; y: number };

export function findPath(
  start: Point,
  goal: Point,
  width: number,
  height: number,
  blocked: (p: Point) => boolean = () => false,
): Point[] {
  if (start.x === goal.x && start.y === goal.y) return [];
  if (blocked(goal)) return [];

  const key = (p: Point) => `${p.x},${p.y}`;
  const h = (p: Point) => Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y);

  const open = new Map<string, { p: Point; g: number; f: number; parent: string | null }>();
  const closed = new Set<string>();
  open.set(key(start), { p: start, g: 0, f: h(start), parent: null });

  const neighbors = (p: Point): Point[] => {
    const out: Point[] = [];
    for (const [dx, dy] of [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1],
    ]) {
      const np = { x: p.x + dx, y: p.y + dy };
      if (np.x < 0 || np.y < 0 || np.x >= width || np.y >= height) continue;
      if (blocked(np)) continue;
      out.push(np);
    }
    return out;
  };

  while (open.size) {
    // pick lowest f
    let currentKey = "";
    let currentF = Infinity;
    for (const [k, v] of open) if (v.f < currentF) { currentF = v.f; currentKey = k; }
    const current = open.get(currentKey)!;
    if (current.p.x === goal.x && current.p.y === goal.y) {
      const path: Point[] = [];
      let n: typeof current | undefined = current;
      while (n) {
        path.push(n.p);
        n = n.parent ? open.get(n.parent) ?? { p: parseKey(n.parent), g: 0, f: 0, parent: null } : undefined;
        if (n && n.parent === null && n.p.x === start.x && n.p.y === start.y) break;
      }
      path.reverse();
      // remove starting cell
      if (path.length && path[0].x === start.x && path[0].y === start.y) path.shift();
      return path;
    }
    open.delete(currentKey);
    closed.add(currentKey);

    for (const nb of neighbors(current.p)) {
      const nk = key(nb);
      if (closed.has(nk)) continue;
      const step = (nb.x !== current.p.x && nb.y !== current.p.y) ? 1.4 : 1;
      const tentative = current.g + step;
      const existing = open.get(nk);
      if (!existing || tentative < existing.g) {
        open.set(nk, { p: nb, g: tentative, f: tentative + h(nb), parent: currentKey });
      }
    }
  }
  return [];
}

function parseKey(k: string): Point {
  const [x, y] = k.split(",").map(Number);
  return { x, y };
}