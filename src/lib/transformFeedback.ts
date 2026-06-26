/**
 * Phase 3 (learning science) — targeted, explanatory feedback for the subject's
 * core transformations: reflections and rotations. These mirror the translation
 * diagnostics in `translationFeedback.ts`, but for axis flips and origin turns.
 *
 * Two jobs, both pure:
 *   1. `reflectErrorMessage` / `rotateErrorMessage` — diagnose a WRONG choice by
 *      naming the misconception ("across the y-axis flips left/right, but the
 *      image is flipped top-to-bottom"), so a wrong answer teaches instead of
 *      just being marked wrong.
 *   2. `reflectionMap` / `rotationMap` + rule strings — reinforce a CORRECT
 *      answer by showing the single rule applied to every point, so the move
 *      reads as a coordinate rule rather than a visual trick.
 */
import { reflectPoints, rotatePoints, type Pt } from './transforms'

export interface PointMap {
  from: Pt
  to: Pt
}

/** What flips when you mirror across an axis. */
function reflectFlipWord(axis: 'x' | 'y'): string {
  return axis === 'x' ? 'top to bottom' : 'left to right'
}

/** Which coordinate the axis flip negates. */
function reflectNegateWord(axis: 'x' | 'y'): string {
  return axis === 'x' ? 'negates each y' : 'negates each x'
}

/**
 * Diagnose a wrong reflection choice. Returns null when the pick already
 * matches the target, otherwise a short message naming the specific mistake.
 */
export function reflectErrorMessage(
  picked: 'x' | 'y' | null,
  correct: 'x' | 'y',
): string | null {
  if (picked === correct) return null
  if (picked === null) return 'Choose an axis to reflect across first.'
  return `Across the ${picked}-axis a shape flips ${reflectFlipWord(
    picked,
  )}, but the dashed image is flipped ${reflectFlipWord(
    correct,
  )}. Reflect across the ${correct}-axis — that ${reflectNegateWord(correct)}.`
}

function turnWord(degrees: 90 | 180 | 270): string {
  return degrees === 90
    ? 'a quarter turn'
    : degrees === 180
      ? 'a half turn'
      : 'a three-quarter turn'
}

/**
 * Diagnose a wrong rotation choice. Returns null when the pick matches the
 * target, otherwise a message that reframes the turn around the origin.
 */
export function rotateErrorMessage(
  picked: 90 | 180 | 270 | null,
  correct: 90 | 180 | 270,
): string | null {
  if (picked === correct) return null
  if (picked === null) return 'Pick how far to rotate first.'
  return `${picked}° is ${turnWord(
    picked,
  )}, but the dashed image is ${turnWord(
    correct,
  )} away (${correct}° counterclockwise). Follow one corner — each 90° swings it a quarter of the way around the origin.`
}

/**
 * Diagnose a wrong "drag the point to its reflection" attempt WITHOUT revealing
 * the target coordinate. Returns null when the attempt is already the correct
 * image; otherwise a reflection-specific nudge about which coordinate should
 * stay put and which should flip sign.
 */
export function reflectPlotMessage(
  attempt: Pt,
  preimage: Pt,
  axis: 'x' | 'y',
): string | null {
  const [ax, ay] = attempt
  const [px, py] = preimage
  const image = reflectPoints([preimage], axis)[0]!
  if (ax === image[0] && ay === image[1]) return null

  if (axis === 'x') {
    // Image must keep x = px and flip y to -py.
    if (ax !== px) {
      return 'Across the x-axis the left/right position never changes — keep x where the original point is, and only move up/down.'
    }
    if (Math.sign(ay) === Math.sign(py) && ay !== 0) {
      return 'You stayed on the same side of the x-axis. The image mirrors to the opposite side — flip the sign of y.'
    }
    return 'Across the x-axis the image is the same distance below/above as the original is above/below. Match that distance on the other side.'
  }

  // y-axis
  if (ay !== py) {
    return 'Across the y-axis the up/down position never changes — keep y where the original point is, and only move left/right.'
  }
  if (Math.sign(ax) === Math.sign(px) && ax !== 0) {
    return 'You stayed on the same side of the y-axis. The image mirrors to the opposite side — flip the sign of x.'
  }
  return 'Across the y-axis the image is the same distance left/right as the original — match that distance on the other side.'
}

/** The reflection rule as a coordinate map, e.g. "(x, y) → (x, −y)". */
export function reflectionRule(axis: 'x' | 'y'): string {
  return axis === 'x' ? '(x, y) → (x, −y)' : '(x, y) → (−x, y)'
}

/** The rotation rule as a coordinate map for a CCW turn about the origin. */
export function rotationRule(degrees: 90 | 180 | 270): string {
  switch (degrees) {
    case 90:
      return '(x, y) → (−y, x)'
    case 180:
      return '(x, y) → (−x, −y)'
    case 270:
      return '(x, y) → (y, −x)'
  }
}

/** Each point and its image under the reflection (for the success breakdown). */
export function reflectionMap(shape: Pt[], axis: 'x' | 'y'): PointMap[] {
  const image = reflectPoints(shape, axis)
  return shape.map((from, i) => ({ from, to: image[i]! }))
}

/** Each point and its image under the rotation (for the success breakdown). */
export function rotationMap(shape: Pt[], degrees: 90 | 180 | 270): PointMap[] {
  const image = rotatePoints(shape, degrees)
  return shape.map((from, i) => ({ from, to: image[i]! }))
}
