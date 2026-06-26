/**
 * Pure geometric transforms shared by the reflect/rotate lesson interactions and
 * the math engine that grounds their hints. Coordinates are graph units.
 */
export type Pt = [number, number]

/** Reflect across the x-axis (negate y) or the y-axis (negate x). */
export function reflectPoints(shape: Pt[], axis: 'x' | 'y'): Pt[] {
  return shape.map(([x, y]) => (axis === 'x' ? [x, -y] : [-x, y]) as Pt)
}

/** Rotate counterclockwise about the origin by 90, 180, or 270 degrees. */
export function rotatePoints(shape: Pt[], degrees: 90 | 180 | 270): Pt[] {
  return shape.map(([x, y]) => {
    switch (degrees) {
      case 90:
        return [-y, x] as Pt
      case 180:
        return [-x, -y] as Pt
      case 270:
        return [y, -x] as Pt
    }
  })
}
