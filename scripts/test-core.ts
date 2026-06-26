/**
 * Standalone correctness tests for the app's pure logic — the parts that must be
 * provably right for the lessons to teach correctly and for the Phase 2 AI
 * guardrails to hold. Run with:  npm run test
 *
 * No test framework is needed: this is a self-contained harness that exercises
 * the geometry transforms, the math engine (answer grounding + hint
 * verification), mastery scoring, the adaptive path, XP/levels, streaks, and the
 * translation-feedback diagnostics. It imports only pure modules (no React, no
 * Firebase), so it runs fast under tsx/node.
 */
import { reflectPoints, rotatePoints } from '../src/lib/transforms'
import { computeGroundTruth, verifyHintIsSafe } from '../src/lib/mathEngine'
import { computeOutcome } from '../src/lib/mastery'
import { getNextOnPath, resolvePath, type PathNodeState } from '../src/content/path'
import {
  checkTextAnswer,
  normalizeCheckAnswer,
  levelForXp,
  resetWeeklyXpIfNeeded,
} from '../src/lib/xp'
import {
  applyLessonCompletion,
  normalizeProfile,
  getWeekStartMonday,
  getWeekdayIndex,
  daysBetween,
} from '../src/lib/streak'
import {
  signErrorMessage,
  directionalGuidance,
  coordinateChanges,
} from '../src/lib/translationFeedback'
import {
  reflectErrorMessage,
  rotateErrorMessage,
  reflectPlotMessage,
  reflectionMap,
  rotationMap,
  reflectionRule,
  rotationRule,
} from '../src/lib/transformFeedback'
import type { LessonStep, StepResult } from '../src/types/lesson'

let passed = 0
let failed = 0
const failures: string[] = []

function ok(cond: boolean, msg: string) {
  if (cond) {
    passed++
  } else {
    failed++
    failures.push(msg)
  }
}

function eq(actual: unknown, expected: unknown, msg: string) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  ok(a === e, `${msg}\n    expected: ${e}\n    actual:   ${a}`)
}

function group(name: string, fn: () => void) {
  try {
    fn()
  } catch (err) {
    failed++
    failures.push(`${name} threw: ${(err as Error).message}`)
  }
}

// ── Geometry transforms ────────────────────────────────────────────────────
group('transforms', () => {
  eq(reflectPoints([[3, 5]], 'x'), [[3, -5]], 'reflect across x negates y')
  eq(reflectPoints([[3, 5]], 'y'), [[-3, 5]], 'reflect across y negates x')
  eq(reflectPoints([[-1, 6]], 'x'), [[-1, -6]], 'reflect (-1,6) across x')
  // Reflecting twice across the same axis is the identity.
  eq(reflectPoints(reflectPoints([[3, 5]], 'x'), 'x'), [[3, 5]], 'double reflect = identity')

  eq(rotatePoints([[1, 0]], 90), [[0, 1]], 'rotate (1,0) 90° ccw → (0,1)')
  eq(rotatePoints([[1, 0]], 180), [[-1, 0]], 'rotate (1,0) 180° → (-1,0)')
  eq(rotatePoints([[1, 0]], 270), [[0, -1]], 'rotate (1,0) 270° → (0,-1)')
  eq(rotatePoints([[2, 3]], 90), [[-3, 2]], 'rotate (2,3) 90° → (-3,2)')
  // Four 90° turns return to the start.
  let p: [number, number][] = [[2, 3]]
  for (let i = 0; i < 4; i++) p = rotatePoints(p, 90)
  eq(p, [[2, 3]], 'four 90° rotations = identity')
  // 90° then 270° is the identity.
  eq(rotatePoints(rotatePoints([[2, 3]], 90), 270), [[2, 3]], '90°+270° = identity')
})

// ── Math engine: grounding ──────────────────────────────────────────────────
group('computeGroundTruth', () => {
  const balance = {
    id: 'b', type: 'balance-scale', title: '', prompt: '', coeff: 2, constant: 3, total: 11,
    why: '', hint: '',
  } satisfies LessonStep
  eq(computeGroundTruth(balance).text, 'x = 4', 'solve 2x+3=11 → x=4')
  eq(computeGroundTruth(balance).numbers, [4], 'balance numbers = [4]')

  const move = {
    id: 'm', type: 'move-point', title: '', prompt: '', start: [0, 0], target: [2, 5],
    why: '', hint: '',
  } satisfies LessonStep
  eq(computeGroundTruth(move).coords, [[2, 5]], 'move-point coords = target')

  const tby = {
    id: 't', type: 'translate-by', title: '', prompt: '', shape: [[0, 0], [1, 1]],
    targetDx: 3, targetDy: -2, why: '', hint: '',
  } satisfies LessonStep
  eq(computeGroundTruth(tby).text, '(3, -2)', 'translate-by text = delta')
  eq(computeGroundTruth(tby).coords, [[3, -2], [4, -1]], 'translate-by image coords')

  const refl = {
    id: 'r', type: 'reflect-shape', title: '', prompt: '', shape: [[3, 5]], axis: 'x',
    why: '', hint: '',
  } satisfies LessonStep
  eq(computeGroundTruth(refl).coords, [[3, -5]], 'reflect grounding via transforms')

  const rot = {
    id: 'ro', type: 'rotate-shape', title: '', prompt: '', shape: [[1, 0]], degrees: 90,
    why: '', hint: '',
  } satisfies LessonStep
  eq(computeGroundTruth(rot).coords, [[0, 1]], 'rotate grounding via transforms')

  const vertex = {
    id: 'v', type: 'find-vertex', title: '', prompt: '', h: 1, k: -3, a: 1, xMin: -5, xMax: 5,
    why: '', hint: '',
  } satisfies LessonStep
  eq(computeGroundTruth(vertex).coords, [[1, -3]], 'vertex = (h,k)')

  const num = {
    id: 'n', type: 'number-input', title: '', prompt: '', answers: ['7'], why: '', hint: '',
  } satisfies LessonStep
  eq(computeGroundTruth(num).numbers, [7], 'number-input parses numeric answer')

  // Non-math steps ground to empty without throwing.
  const concept = { id: 'c', type: 'concept', title: '', body: '' } satisfies LessonStep
  eq(computeGroundTruth(concept), { text: '', numbers: [], coords: [] }, 'concept grounds empty')
})

// ── Math engine: hint verification (the AI safety guard) ─────────────────────
group('verifyHintIsSafe', () => {
  const balance = {
    id: 'b', type: 'balance-scale', title: '', prompt: '', coeff: 2, constant: 3, total: 11,
    why: '', hint: '',
  } satisfies LessonStep

  ok(verifyHintIsSafe('Try subtracting 3 from both sides first.', balance), 'safe hint accepted')
  ok(!verifyHintIsSafe('The answer is x = 4.', balance), 'reject hint that leaks the answer')
  ok(!verifyHintIsSafe('Since 2 + 2 = 5, keep going.', balance), 'reject false equation 2+2=5')
  ok(verifyHintIsSafe('Remember that 2 + 2 = 4 when you check.', balance), 'allow true equation 2+2=4')
  ok(verifyHintIsSafe('', balance), 'empty hint is treated as safe (caller handles)')

  const refl = {
    id: 'r', type: 'reflect-shape', title: '', prompt: '', shape: [[3, 5]], axis: 'x',
    why: '', hint: '',
  } satisfies LessonStep
  ok(!verifyHintIsSafe('It lands at (3, -5).', refl), 'reject hint leaking all image coords')
  ok(verifyHintIsSafe('Keep x the same and flip the sign of y.', refl), 'safe reflect hint accepted')

  // A wrong inequality is rejected; a true one is allowed.
  ok(!verifyHintIsSafe('Note 5 < 2 here.', balance), 'reject false inequality 5<2')
  ok(verifyHintIsSafe('Note 2 < 5 here.', balance), 'allow true inequality 2<5')
})

// ── Mastery scoring ─────────────────────────────────────────────────────────
group('computeOutcome', () => {
  const prob = (id: string) => ({ id, type: 'multiple-choice' }) as unknown as LessonStep
  const concept = (id: string) => ({ id, type: 'concept' }) as unknown as LessonStep
  const clean = (id: string): StepResult => ({ stepId: id, correct: true, attempts: 1, usedHelp: false })
  const wrong = (id: string): StepResult => ({ stepId: id, correct: false, attempts: 2, usedHelp: false })
  const hinted = (id: string): StepResult => ({ stepId: id, correct: true, attempts: 1, usedHelp: true })

  const five = [prob('p1'), prob('p2'), prob('p3'), prob('p4'), prob('p5')]

  eq(
    computeOutcome(five.map((s) => clean(s.id)), five).outcome,
    'mastery',
    'all clean → mastery',
  )
  eq(
    computeOutcome([clean('p1'), clean('p2'), clean('p3'), clean('p4'), wrong('p5')], five).outcome,
    'mastery',
    '4/5 clean (0.8) → mastery',
  )
  eq(
    computeOutcome([clean('p1'), clean('p2'), clean('p3'), wrong('p4'), wrong('p5')], five).outcome,
    'support',
    '3/5 clean (0.6) → support',
  )
  eq(
    computeOutcome([clean('p1'), hinted('p2'), hinted('p3'), hinted('p4'), hinted('p5')], five).outcome,
    'support',
    'hints break the clean ratio → support',
  )

  // Struggle-limit override: ratio is exactly 0.8 but >3 problems struggled.
  const twenty = Array.from({ length: 20 }, (_, i) => prob(`q${i}`))
  const twentyResults = twenty.map((s, i) => (i < 16 ? clean(s.id) : wrong(s.id)))
  const det = computeOutcome(twentyResults, twenty)
  eq(det.ratio, 0.8, '16/20 clean = 0.8 ratio')
  eq(det.struggled, 4, '4 struggled')
  eq(det.outcome, 'support', 'struggle limit (>3) overrides the 0.8 ratio → support')

  // Concept steps never count; duplicate results keep the last attempt.
  const mixed = [concept('c1'), prob('p1'), prob('p2')]
  const dupResults: StepResult[] = [
    { stepId: 'p1', correct: false, attempts: 1, usedHelp: false },
    { stepId: 'p1', correct: true, attempts: 1, usedHelp: false }, // later clean attempt wins
    clean('p2'),
    clean('c1'), // concept result is ignored
  ]
  eq(computeOutcome(dupResults, mixed).cleanCorrect, 2, 'dedupe keeps last; concept excluded')
  eq(computeOutcome(dupResults, mixed).problemCount, 2, 'only 2 gradeable problems counted')
})

// ── Adaptive path ───────────────────────────────────────────────────────────
group('path', () => {
  eq(getNextOnPath('reflections-101', 'mastery'), 'rotations-101', 'reflections pass → rotations')
  eq(
    getNextOnPath('reflections-101', 'support'),
    'coordinate-plane-101',
    'reflections fail → coordinate plane',
  )
  eq(getNextOnPath('translations-101', 'mastery'), 'reflections-101', 'translations pass → reflections')
  eq(getNextOnPath('translations-101', 'support'), 'number-line-101', 'translations fail → number line')
  eq(getNextOnPath('rotations-101', 'mastery'), undefined, 'rotations is terminal')

  const state = (entries: Record<string, PathNodeState>) => entries

  eq(resolvePath(state({})).nextLessonId, 'translations-101', 'empty state → start lesson')
  eq(resolvePath(state({})).finished, false, 'empty state not finished')

  // Pass translations → next is reflections.
  eq(
    resolvePath(state({ 'translations-101': { completed: true, outcome: 'mastery' } })).nextLessonId,
    'reflections-101',
    'after translations mastery → reflections is next',
  )

  // Full mastery chain ending on a completed terminal → finished.
  const finishedState = state({
    'translations-101': { completed: true, outcome: 'mastery' },
    'reflections-101': { completed: true, outcome: 'mastery' },
    'rotations-101': { completed: true, outcome: 'mastery' },
  })
  eq(resolvePath(finishedState).finished, true, 'completed terminal → path finished')
  eq(resolvePath(finishedState).nextLessonId, undefined, 'finished path has no next lesson')
  eq(resolvePath(finishedState).completed.length, 3, 'three lessons recorded as completed')

  // Support branch routing.
  const supportState = state({
    'translations-101': { completed: true, outcome: 'support' },
    'number-line-101': { completed: true, outcome: 'support' },
  })
  eq(
    resolvePath(supportState).nextLessonId,
    'coordinate-plane-guided-101',
    'support → number line → guided coordinate plane',
  )
})

// ── XP, levels, answer checking ─────────────────────────────────────────────
group('xp', () => {
  eq(levelForXp(0), { level: 1, intoLevel: 0, forNext: 100, pct: 0 }, 'level 1 at 0 XP')
  eq(levelForXp(100).level, 2, '100 XP → level 2')
  eq(levelForXp(150), { level: 2, intoLevel: 50, forNext: 100, pct: 50 }, '150 XP → level 2, 50%')
  eq(levelForXp(999).level, 10, '999 XP → level 10')

  eq(normalizeCheckAnswer('  (2, 4) '), '2,4', 'normalize strips spaces & parens')
  ok(checkTextAnswer('(2, 4)', ['2,4']), 'accept equivalent coordinate formats')
  ok(checkTextAnswer('X', ['x']), 'answer check is case-insensitive')
  ok(checkTextAnswer(' 3 , -5 ', ['(3,-5)']), 'whitespace/paren tolerant match')
  ok(!checkTextAnswer('', ['x']), 'empty answer is never correct')
  ok(!checkTextAnswer('5', ['4']), 'wrong answer rejected')

  const sameWeek = resetWeeklyXpIfNeeded(120, getWeekStartMonday(new Date('2024-01-03T12:00:00')), new Date('2024-01-03T12:00:00'))
  eq(sameWeek.weeklyXp, 120, 'same week keeps weekly XP')
  const newWeek = resetWeeklyXpIfNeeded(120, '2023-12-25', new Date('2024-01-03T12:00:00'))
  eq(newWeek.weeklyXp, 0, 'new week resets weekly XP to 0')
})

// ── Streaks ─────────────────────────────────────────────────────────────────
group('streak', () => {
  eq(getWeekStartMonday(new Date('2024-01-03T12:00:00')), '2024-01-01', 'Mon of week containing Wed 1/3')
  eq(getWeekStartMonday(new Date('2024-01-07T12:00:00')), '2024-01-01', 'Sunday still maps to that Monday')
  eq(getWeekdayIndex(new Date('2024-01-01T12:00:00')), 0, 'Monday → index 0')
  eq(getWeekdayIndex(new Date('2024-01-07T12:00:00')), 6, 'Sunday → index 6')
  eq(daysBetween('2024-01-01', '2024-01-02'), 1, 'one day apart')
  eq(daysBetween('2024-01-01', '2024-01-08'), 7, 'a week apart')

  const base = normalizeProfile({}, 'Tester')

  const first = applyLessonCompletion(base, '2024-01-01')
  eq(first.streak, 1, 'first ever completion → streak 1')
  ok(first.weeklyCompleted[0], 'Monday marked complete')

  const next = applyLessonCompletion({ ...first }, '2024-01-02')
  eq(next.streak, 2, 'consecutive day → streak 2')

  const sameDay = applyLessonCompletion({ ...next }, '2024-01-02')
  eq(sameDay.streak, 2, 'second completion same day → streak unchanged')

  // Gap of 2 days (missed 1) with a streak saver available keeps the streak.
  const withSaver = applyLessonCompletion({ ...next, streakCharges: 1 }, '2024-01-04')
  eq(withSaver.streak, 3, 'missed day covered by a saver → streak continues')
  eq(withSaver.streakCharges, 0, 'saver was spent')

  // Same gap with no savers resets the streak.
  const noSaver = applyLessonCompletion({ ...next, streakCharges: 0 }, '2024-01-04')
  eq(noSaver.streak, 1, 'missed day with no saver → streak resets to 1')
})

// ── Translation feedback diagnostics ────────────────────────────────────────
group('translationFeedback', () => {
  eq(signErrorMessage(3, -2, 3, -2), null, 'correct attempt → no error message')
  ok(
    (signErrorMessage(-3, -2, 3, -2) ?? '').includes('right'),
    'wrong x sign diagnosed as a direction error',
  )
  ok(
    (signErrorMessage(0, -2, 3, -2) ?? '').includes("haven't moved along x"),
    'missing x move is called out',
  )
  ok(
    (signErrorMessage(3, -1, 3, -2) ?? '').includes('double-check'),
    'right directions, wrong distance → units note',
  )

  ok(directionalGuidance(3, -2, 3, -2).toLowerCase().includes('right on the spot'), 'on-target live guide')
  ok(directionalGuidance(0, 0, 3, 0).length > 0, 'live guide returns guidance while off-target')

  eq(
    coordinateChanges([[1, 1], [2, 2]], 3, -2),
    [{ from: [1, 1], to: [4, -1] }, { from: [2, 2], to: [5, 0] }],
    'coordinate changes apply the same delta to each point',
  )
})

// ── Transform feedback (Phase 3: explanatory feedback for reflect/rotate) ────
group('transformFeedback', () => {
  // Reflections: a correct pick yields no error; a wrong pick is diagnosed.
  eq(reflectErrorMessage('x', 'x'), null, 'correct reflection axis → no error')
  ok(
    (reflectErrorMessage('y', 'x') ?? '').includes('x-axis'),
    'wrong reflection axis names the correct axis',
  )
  ok(
    (reflectErrorMessage('y', 'x') ?? '').includes('left to right'),
    'reflection diagnosis explains what the wrong axis flips',
  )
  ok(
    (reflectErrorMessage(null, 'x') ?? '').toLowerCase().includes('choose'),
    'no reflection pick prompts a choice',
  )

  // Rotations: correct degree → null; wrong degree reframed as turns.
  eq(rotateErrorMessage(180, 180), null, 'correct rotation → no error')
  ok(
    (rotateErrorMessage(90, 270) ?? '').includes('270°'),
    'wrong rotation names the correct degree',
  )
  ok(
    (rotateErrorMessage(90, 270) ?? '').includes('quarter turn'),
    'rotation diagnosis reframes the picked turn',
  )

  // Rules are the canonical coordinate maps.
  eq(reflectionRule('x'), '(x, y) → (x, −y)', 'x-axis reflection rule')
  eq(reflectionRule('y'), '(x, y) → (−x, y)', 'y-axis reflection rule')
  eq(rotationRule(90), '(x, y) → (−y, x)', '90° rotation rule')
  eq(rotationRule(270), '(x, y) → (y, −x)', '270° rotation rule')

  // Maps pair each point with its true image (matches the transforms).
  eq(
    reflectionMap([[3, 5], [-1, 2]], 'x'),
    [{ from: [3, 5], to: [3, -5] }, { from: [-1, 2], to: [-1, -2] }],
    'reflection map applies the axis flip to every point',
  )
  eq(
    rotationMap([[1, 0], [2, 3]], 90),
    [{ from: [1, 0], to: [0, 1] }, { from: [2, 3], to: [-3, 2] }],
    'rotation map applies the 90° turn to every point',
  )

  // Drag-to-reflect (no target shown) diagnosis — must never leak the coordinate.
  eq(reflectPlotMessage([4, -2], [4, 2], 'x'), null, 'correct x-axis plot → no error')
  eq(reflectPlotMessage([3, 4], [-3, 4], 'y'), null, 'correct y-axis plot → no error')
  ok(
    (reflectPlotMessage([2, 2], [4, 2], 'x') ?? '').toLowerCase().includes('left/right'),
    'x-axis plot: changing x is called out (should stay)',
  )
  ok(
    (reflectPlotMessage([4, 2], [4, 2], 'x') ?? '').toLowerCase().includes('flip the sign of y'),
    'x-axis plot: not flipping y is diagnosed',
  )
  ok(
    (reflectPlotMessage([-3, 1], [-3, 4], 'y') ?? '').toLowerCase().includes('up/down'),
    'y-axis plot: changing y is called out (should stay)',
  )
  // The diagnosis must not reveal the exact image coordinate.
  ok(
    !(reflectPlotMessage([4, 2], [4, 2], 'x') ?? '').includes('-2'),
    'plot diagnosis never reveals the target coordinate',
  )
})

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(48)}`)
console.log(`Core logic tests: ${passed} passed, ${failed} failed`)
if (failures.length) {
  console.log(`\nFailures:`)
  for (const f of failures) console.log(`  ✗ ${f}`)
  console.log('')
  process.exit(1)
} else {
  console.log('All core logic tests passed. ✓\n')
}
