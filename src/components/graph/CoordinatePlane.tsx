import { useRef, type PointerEvent } from 'react'
import { fromSvg, snapToGrid, toSvg, GRAPH_RANGE, GRAPH_SIZE } from '../../lib/graph'
import type { GraphSpec } from '../../types/lesson'

interface CoordinatePlaneProps {
  size?: number
  range?: number
  children?: React.ReactNode
}

export function CoordinatePlane({ size = GRAPH_SIZE, range = GRAPH_RANGE, children }: CoordinatePlaneProps) {
  const gridLines: number[] = []
  for (let i = -range; i <= range; i++) gridLines.push(i)

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="coordinate-plane"
      role="img"
      aria-label="Coordinate plane"
    >
      <rect x={0} y={0} width={size} height={size} fill="#0f172a" rx={12} />
      {gridLines.map((i) => {
        const { sx: vx } = toSvg(i, 0, size, range)
        const { sy: hy } = toSvg(0, i, size, range)
        const isAxis = i === 0
        return (
          <g key={`grid-${i}`}>
            <line
              x1={vx}
              y1={0}
              x2={vx}
              y2={size}
              stroke={isAxis ? '#64748b' : '#1e293b'}
              strokeWidth={isAxis ? 1.5 : 0.5}
            />
            <line
              x1={0}
              y1={hy}
              x2={size}
              y2={hy}
              stroke={isAxis ? '#64748b' : '#1e293b'}
              strokeWidth={isAxis ? 1.5 : 0.5}
            />
          </g>
        )
      })}
      {children}
    </svg>
  )
}

interface DraggablePointProps {
  x: number
  y: number
  color?: string
  label?: string
  onMove: (x: number, y: number) => void
  size?: number
}

export function DraggablePoint({
  x,
  y,
  color = '#38bdf8',
  label,
  onMove,
  size = GRAPH_SIZE,
}: DraggablePointProps) {
  const dragging = useRef(false)
  const { sx, sy } = toSvg(x, y, size)

  const handlePointer = (e: PointerEvent, capture: boolean) => {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * size
    const py = ((e.clientY - rect.top) / rect.height) * size
    const raw = fromSvg(px, py, size)
    const [nx, ny] = snapToGrid(raw.x, raw.y)
    onMove(nx, ny)
    if (capture) (e.target as Element).setPointerCapture(e.pointerId)
  }

  return (
    <g
      onPointerDown={(e) => {
        dragging.current = true
        handlePointer(e, true)
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return
        handlePointer(e, false)
      }}
      onPointerUp={() => {
        dragging.current = false
      }}
      style={{ cursor: 'grab', touchAction: 'none' }}
    >
      <circle cx={sx} cy={sy} r={18} fill={color} opacity={0.25} />
      <circle cx={sx} cy={sy} r={9} fill={color} stroke="#fff" strokeWidth={2} />
      {label && (
        <text x={sx + 14} y={sy - 10} fill="#e2e8f0" fontSize={12} fontWeight={600}>
          {label} ({x}, {y})
        </text>
      )}
    </g>
  )
}

interface StaticPointProps {
  x: number
  y: number
  color?: string
  dashed?: boolean
  label?: string
  size?: number
}

export function StaticPoint({
  x,
  y,
  color = '#94a3b8',
  dashed,
  label,
  size = GRAPH_SIZE,
  range = GRAPH_RANGE,
}: StaticPointProps & { range?: number }) {
  const { sx, sy } = toSvg(x, y, size, range)
  return (
    <g>
      <circle
        cx={sx}
        cy={sy}
        r={7}
        fill={dashed ? 'none' : color}
        stroke={color}
        strokeWidth={2}
        strokeDasharray={dashed ? '4 3' : undefined}
        opacity={dashed ? 0.8 : 1}
      />
      {label && (
        <text x={sx + 10} y={sy - 8} fill={color} fontSize={11}>
          {label}
        </text>
      )}
    </g>
  )
}

/** Draws a shape (single point, segment, or polygon) in graph coordinates. */
export function ShapeGlyph({
  shape,
  color,
  dashed,
  opacity = 1,
  size = GRAPH_SIZE,
  range = GRAPH_RANGE,
}: {
  shape: [number, number][]
  color: string
  dashed?: boolean
  opacity?: number
  size?: number
  range?: number
}) {
  if (shape.length === 1) {
    const { sx, sy } = toSvg(shape[0]![0], shape[0]![1], size, range)
    return (
      <g opacity={opacity}>
        <circle
          cx={sx}
          cy={sy}
          r={9}
          fill={dashed ? 'none' : color}
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray={dashed ? '4 3' : undefined}
        />
      </g>
    )
  }

  const pts = shape.map(([x, y]) => toSvg(x, y, size, range))
  const isClosed = shape.length >= 3
  const d =
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.sx} ${p.sy}`).join(' ') +
    (isClosed ? ' Z' : '')

  return (
    <g opacity={opacity}>
      <path
        d={d}
        fill={isClosed && !dashed ? color : 'none'}
        fillOpacity={isClosed && !dashed ? 0.2 : 0}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray={dashed ? '6 4' : undefined}
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.sx}
          cy={p.sy}
          r={5}
          fill={dashed ? '#0f172a' : color}
          stroke={color}
          strokeWidth={2}
        />
      ))}
    </g>
  )
}

export function Polygon({
  points,
  color = '#38bdf8',
  dashed,
  size = GRAPH_SIZE,
  range = GRAPH_RANGE,
}: {
  points: [number, number][]
  color?: string
  dashed?: boolean
  size?: number
  range?: number
}) {
  const d = points
    .map(([px, py], i) => {
      const { sx, sy } = toSvg(px, py, size, range)
      return `${i === 0 ? 'M' : 'L'} ${sx} ${sy}`
    })
    .join(' ')
  return (
    <path
      d={`${d} Z`}
      fill={dashed ? 'none' : color}
      fillOpacity={dashed ? 0 : 0.2}
      stroke={color}
      strokeWidth={2}
      strokeDasharray={dashed ? '6 4' : undefined}
    />
  )
}

export function ParabolaPath({
  h,
  k,
  a,
  xMin,
  xMax,
  color = '#f97316',
  size = GRAPH_SIZE,
  range = GRAPH_RANGE,
  dashed,
}: {
  h: number
  k: number
  a: number
  xMin: number
  xMax: number
  color?: string
  size?: number
  range?: number
  dashed?: boolean
}) {
  const pts: string[] = []
  for (let x = xMin; x <= xMax; x += 0.1) {
    const y = a * (x - h) ** 2 + k
    if (Math.abs(y) > range) continue
    const { sx, sy } = toSvg(x, y, size, range)
    pts.push(`${pts.length === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`)
  }
  return (
    <path
      d={pts.join(' ')}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray={dashed ? '6 4' : undefined}
    />
  )
}

/** Straight line y = m·x + b clipped to the visible grid. */
export function LinePath({
  m,
  b,
  color = '#38bdf8',
  size = GRAPH_SIZE,
  range = GRAPH_RANGE,
  dashed,
  label,
}: {
  m: number
  b: number
  color?: string
  size?: number
  range?: number
  dashed?: boolean
  label?: string
}) {
  const x1 = -range
  const x2 = range
  const y1 = m * x1 + b
  const y2 = m * x2 + b
  const p1 = toSvg(x1, y1, size, range)
  const p2 = toSvg(x2, y2, size, range)
  const labelPt = toSvg(range - 1.5, m * (range - 1.5) + b, size, range)
  return (
    <g>
      <line
        x1={p1.sx}
        y1={p1.sy}
        x2={p2.sx}
        y2={p2.sy}
        stroke={color}
        strokeWidth={3}
        strokeDasharray={dashed ? '6 4' : undefined}
      />
      {label && (
        <text x={labelPt.sx} y={labelPt.sy - 8} fill={color} fontSize={12} fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  )
}

/** Exponential curve y = a·b^x clipped to the visible grid. */
export function ExpPath({
  a,
  b,
  color = '#a78bfa',
  size = GRAPH_SIZE,
  range = GRAPH_RANGE,
  dashed,
}: {
  a: number
  b: number
  color?: string
  size?: number
  range?: number
  dashed?: boolean
}) {
  const pts: string[] = []
  for (let x = -range; x <= range; x += 0.1) {
    const y = a * Math.pow(b, x)
    if (Math.abs(y) > range) continue
    const { sx, sy } = toSvg(x, y, size, range)
    pts.push(`${pts.length === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`)
  }
  return (
    <path
      d={pts.join(' ')}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray={dashed ? '6 4' : undefined}
    />
  )
}

/** Renders a declarative GraphSpec (lines, parabolas, exponentials, polygons, points). */
export function GraphView({ spec, size = GRAPH_SIZE }: { spec: GraphSpec; size?: number }) {
  const range = spec.range ?? GRAPH_RANGE
  return (
    <CoordinatePlane size={size} range={range}>
      {spec.lines?.map((l, i) => (
        <LinePath key={`line-${i}`} {...l} size={size} range={range} />
      ))}
      {spec.parabolas?.map((p, i) => (
        <ParabolaPath
          key={`par-${i}`}
          h={p.h}
          k={p.k}
          a={p.a}
          xMin={-range}
          xMax={range}
          color={p.color}
          dashed={p.dashed}
          size={size}
          range={range}
        />
      ))}
      {spec.exponentials?.map((e, i) => (
        <ExpPath key={`exp-${i}`} {...e} size={size} range={range} />
      ))}
      {spec.polygons?.map((poly, i) => (
        <Polygon key={`poly-${i}`} {...poly} size={size} range={range} />
      ))}
      {spec.points?.map((pt, i) => (
        <StaticPoint key={`pt-${i}`} {...pt} size={size} range={range} />
      ))}
    </CoordinatePlane>
  )
}

export function TranslationDemo({ size = GRAPH_SIZE }: { size?: number }) {
  const shape: [number, number][] = [
    [0, 0],
    [2, 0],
    [1, 1.5],
  ]
  const moved = shape.map(([x, y]) => [x + 3, y + 1] as [number, number])
  return (
    <CoordinatePlane size={size}>
      <Polygon points={shape} color="#64748b" />
      <Polygon points={moved} color="#38bdf8" dashed />
      <StaticPoint x={0} y={0} color="#64748b" label="start" size={size} />
      <StaticPoint x={3} y={1} color="#38bdf8" label="+(3,1)" size={size} />
    </CoordinatePlane>
  )
}

export function VertexDemo({ size = GRAPH_SIZE }: { size?: number }) {
  return (
    <CoordinatePlane size={size}>
      <ParabolaPath h={2} k={1} a={1} xMin={-1} xMax={5} size={size} />
      <StaticPoint x={2} y={1} color="#f97316" label="vertex (2,1)" size={size} />
    </CoordinatePlane>
  )
}
