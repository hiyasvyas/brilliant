export const GRAPH_RANGE = 6
export const GRAPH_SIZE = 320

export function toSvg(
  x: number,
  y: number,
  size = GRAPH_SIZE,
  range = GRAPH_RANGE,
): { sx: number; sy: number; scale: number } {
  const scale = size / (range * 2)
  const cx = size / 2
  const cy = size / 2
  return { sx: cx + x * scale, sy: cy - y * scale, scale }
}

export function fromSvg(
  sx: number,
  sy: number,
  size = GRAPH_SIZE,
  range = GRAPH_RANGE,
): { x: number; y: number } {
  const scale = size / (range * 2)
  const cx = size / 2
  const cy = size / 2
  return {
    x: Math.round((sx - cx) / scale),
    y: Math.round(-(sy - cy) / scale),
  }
}

export function snapToGrid(x: number, y: number): [number, number] {
  return [Math.round(x), Math.round(y)]
}

export function pointsEqual(
  a: [number, number],
  b: [number, number],
  tolerance = 0,
): boolean {
  if (tolerance === 0) return a[0] === b[0] && a[1] === b[1]
  return Math.abs(a[0] - b[0]) <= tolerance && Math.abs(a[1] - b[1]) <= tolerance
}

export function parabolaY(x: number, h: number, k: number, a: number): number {
  return a * (x - h) ** 2 + k
}
