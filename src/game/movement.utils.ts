import { findPath, type Point } from "./pathfind";

/**
 * Validates a point is within grid bounds
 */
const isValid = (p: Point, w: number, h: number) => p.x >= 0 && p.y >= 0 && p.x < w && p.y < h;

/**
 * Calculates a list of points between two positions (A to B) using Bresenham-like linear interpolation.
 * Useful for finding "intermediate" points when a jump is detected.
 */
export function getLinePoints(start: Point, end: Point): Point[] {
  const points: Point[] = [];
  let x = start.x;
  let y = start.y;
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const sx = start.x < end.x ? 1 : -1;
  const sy = start.y < end.y ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ x, y });
    if (x === end.x && y === end.y) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  return points;
}

/**
 * Checks if a furniture item can be placed at (x, y)
 * avoiding collisions with other furniture and walls.
 */
export function canPlaceFurniture(
  x: number, 
  y: number, 
  furniture: any[], 
  roomId: string, 
  roomWidth: number, 
  roomHeight: number
): boolean {
  // 1. Boundary check
  if (x < 0 || y < 0 || x >= roomWidth || y >= roomHeight) return false;

  // 2. Collision with other furniture (excluding rugs which can be stepped on/under)
  const isBlocked = furniture.some(f => 
    f.x === x && f.y === y && f.type !== 'rug'
  );

  return !isBlocked;
}
