/**
 * Helpers that turn a translation attempt into specific, hand-written feedback:
 * a coordinate-by-coordinate breakdown of the move, and a targeted diagnosis of
 * sign/direction mistakes — the most common source of translation errors.
 */

export interface CoordChange {
  from: [number, number]
  to: [number, number]
}

/** The new position of each point after sliding by (dx, dy). */
export function coordinateChanges(
  points: [number, number][],
  dx: number,
  dy: number,
): CoordChange[] {
  return points.map(([x, y]) => ({ from: [x, y], to: [x + dx, y + dy] }))
}

function axisWord(delta: number, axis: 'x' | 'y'): string {
  if (axis === 'x') return delta > 0 ? 'right' : 'left'
  return delta > 0 ? 'up' : 'down'
}

/**
 * Diagnose a wrong translation attempt, prioritising sign/direction mistakes.
 * Returns a short, specific message, or null when the attempt already matches.
 */
export function signErrorMessage(
  attemptDx: number,
  attemptDy: number,
  targetDx: number,
  targetDy: number,
): string | null {
  if (attemptDx === targetDx && attemptDy === targetDy) return null

  const directionNotes: string[] = []
  if (targetDx !== 0 && attemptDx !== 0 && Math.sign(attemptDx) !== Math.sign(targetDx)) {
    directionNotes.push(
      `You moved ${axisWord(attemptDx, 'x')}, but this asks you to move ${axisWord(
        targetDx,
        'x',
      )} — moving left means a negative Δx and right means positive.`,
    )
  }
  if (targetDy !== 0 && attemptDy !== 0 && Math.sign(attemptDy) !== Math.sign(targetDy)) {
    directionNotes.push(
      `You moved ${axisWord(attemptDy, 'y')}, but this asks you to move ${axisWord(
        targetDy,
        'y',
      )} — down is a negative Δy and up is positive.`,
    )
  }
  if (directionNotes.length) return directionNotes.join(' ')

  if (targetDx !== 0 && attemptDx === 0) {
    return `You haven't moved along x yet — this one also needs a move ${axisWord(targetDx, 'x')}.`
  }
  if (targetDy !== 0 && attemptDy === 0) {
    return `You haven't moved along y yet — this one also needs a move ${axisWord(targetDy, 'y')}.`
  }

  return 'Right directions — now double-check the number of units on each axis.'
}

/** Per-axis live guidance comparing the current move to the target move. */
function axisGuidance(current: number, target: number, axis: 'x' | 'y'): string {
  if (current === target) return `${axis} is set — leave it here.`
  if (target === 0) {
    return `${axis} shouldn't move — bring it back to the start on ${axis}.`
  }
  if (current === 0) {
    return `start moving ${axisWord(target, axis)}`
  }
  if (Math.sign(current) !== Math.sign(target)) {
    return `you're going the wrong way on ${axis} — head ${axisWord(target, axis)} instead`
  }
  // Same direction as the target.
  if (Math.abs(current) < Math.abs(target)) {
    return `good direction on ${axis} — keep going ${axisWord(target, axis)}`
  }
  return `you've gone a bit too far ${axisWord(target, axis)} — ease back on ${axis}`
}

/**
 * Live "warmer/colder" guidance for the third hint level. As the learner drags,
 * this reports whether each axis is heading the right way, overshooting, or set —
 * WITHOUT ever stating the target number of units, so it never gives the answer.
 */
export function directionalGuidance(
  currentDx: number,
  currentDy: number,
  targetDx: number,
  targetDy: number,
): string {
  const xSet = currentDx === targetDx
  const ySet = currentDy === targetDy

  if (xSet && ySet) return "That's it — you're right on the spot. Lock it in!"

  const parts: string[] = []
  if (!xSet || targetDx !== 0) parts.push(axisGuidance(currentDx, targetDx, 'x'))
  if (!ySet || targetDy !== 0) parts.push(axisGuidance(currentDy, targetDy, 'y'))

  // Capitalise the first letter for a clean sentence.
  const sentence = parts.join('; ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}
