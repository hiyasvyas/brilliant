import { useEffect, useRef, useState } from 'react'
import { CoordinatePlane, ShapeGlyph } from '../graph/CoordinatePlane'
import { GRAPH_RANGE, GRAPH_SIZE } from '../../lib/graph'

const PX_PER_UNIT = GRAPH_SIZE / (GRAPH_RANGE * 2)

interface TranslateByControlProps {
  shape: [number, number][]
  targetDx: number
  targetDy: number
  axis?: 'x' | 'y' | 'both'
  min?: number
  max?: number
  /** Freeze palette input (e.g. after the answer is checked). */
  frozen?: boolean
  /** Force the boxes to the correct answer and animate onto the target. */
  reveal?: boolean
  /** Reports the current (Δx, Δy) so the parent can validate. */
  onChange?: (dx: number | null, dy: number | null) => void
}

/**
 * Interactive "translate by (Δx, Δy)" widget: pick numbers from a palette and
 * the shape slides toward the dashed target outline, with a Play replay.
 * Shared by the lesson flow and the interactive lesson check.
 */
export function TranslateByControl({
  shape,
  targetDx,
  targetDy,
  axis = 'both',
  min = -5,
  max = 5,
  frozen = false,
  reveal = false,
  onChange,
}: TranslateByControlProps) {
  const lockedDx = axis === 'y' ? targetDx : 0
  const lockedDy = axis === 'x' ? targetDy : 0

  const [dx, setDx] = useState<number | null>(
    reveal ? targetDx : axis === 'y' ? lockedDx : null,
  )
  const [dy, setDy] = useState<number | null>(
    reveal ? targetDy : axis === 'x' ? lockedDy : null,
  )
  const [active, setActive] = useState<'x' | 'y'>(axis === 'y' ? 'y' : 'x')
  const [offset, setOffset] = useState<{ ox: number; oy: number }>(() =>
    reveal
      ? { ox: targetDx * PX_PER_UNIT, oy: -targetDy * PX_PER_UNIT }
      : { ox: 0, oy: 0 },
  )
  const rafRef = useRef<number | null>(null)

  // Always animates from the shape's start position (offset 0) to the target,
  // so pressing Play replays the full slide from start to finish every time.
  const animateTo = (toDx: number, toDy: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    const targetOx = toDx * PX_PER_UNIT
    const targetOy = -toDy * PX_PER_UNIT
    const startTime = performance.now()
    const duration = 650
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration)
      const e = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setOffset({ ox: targetOx * e, oy: targetOy * e })
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else rafRef.current = null
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (reveal) animateTo(targetDx, targetDy)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    onChange?.(dx, dy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dx, dy])

  const pick = (n: number) => {
    if (frozen || reveal) return
    let nextDx = dx
    let nextDy = dy
    if (active === 'x') {
      nextDx = n
      setDx(n)
    } else {
      nextDy = n
      setDy(n)
    }
    animateTo(nextDx ?? lockedDx, nextDy ?? lockedDy)
  }

  const replay = () => animateTo(dx ?? lockedDx, dy ?? lockedDy)

  const goal = shape.map(
    ([x, y]) => [x + targetDx, y + targetDy] as [number, number],
  )

  const palette: number[] = []
  for (let n = min; n <= max; n++) palette.push(n)

  const fmt = (v: number | null) => (v === null ? '' : String(v))
  const xEditable = !frozen && !reveal && axis !== 'y'
  const yEditable = !frozen && !reveal && axis !== 'x'
  const ready = dx !== null && dy !== null
  const showPalette = !frozen && !reveal

  return (
    <>
      <CoordinatePlane>
        <ShapeGlyph shape={goal} color="#64748b" dashed />
        <ShapeGlyph shape={shape} color="#1e3a5f" opacity={0.5} />
        <g
          className="translate-mover"
          style={{ transform: `translate(${offset.ox}px, ${offset.oy}px)` }}
        >
          <ShapeGlyph shape={shape} color="#38bdf8" />
        </g>
      </CoordinatePlane>

      <div className="translate-expr">
        <span className="translate-expr-label">translate by</span>
        <span className="translate-paren">(</span>
        <button
          type="button"
          className={`translate-box ${active === 'x' && xEditable ? 'active' : ''} ${
            xEditable ? '' : 'locked'
          }`}
          onClick={() => xEditable && setActive('x')}
          disabled={!xEditable}
        >
          {fmt(dx)}
        </button>
        <span className="translate-comma">,</span>
        <button
          type="button"
          className={`translate-box ${active === 'y' && yEditable ? 'active' : ''} ${
            yEditable ? '' : 'locked'
          }`}
          onClick={() => yEditable && setActive('y')}
          disabled={!yEditable}
        >
          {fmt(dy)}
        </button>
        <span className="translate-paren">)</span>
      </div>

      {showPalette && (
        <div className="num-palette">
          {palette.map((n) => (
            <button key={n} type="button" className="num-chip" onClick={() => pick(n)}>
              {n}
            </button>
          ))}
        </div>
      )}

      {ready && (
        <button type="button" className="play-btn" onClick={replay}>
          <span className="play-icon">▶</span> Play
        </button>
      )}
    </>
  )
}
