import type { Lesson, LessonStep, LessonCheckQuestion } from '../../types/lesson'

/**
 * The expanded adaptive-path branches. These are intentionally lightweight but
 * real, interactive lessons: each one is a short concept + a couple of hands-on
 * problems + a typed lesson check that decides mastery vs. support, so every new
 * branch routes correctly (see `content/path.ts`). They reuse the same step
 * types the engine already renders (concept / multiple-choice / number-input /
 * move-point), and never touch the original seven lessons.
 */
interface LightLessonConfig {
  id: string
  title: string
  description: string
  order: number
  region: string
  icon: string
  estimatedMinutes?: number
  /** Content steps (the closing "complete" step is appended automatically). */
  steps: LessonStep[]
  complete: { message: string; discovery?: string }
  lessonCheck: LessonCheckQuestion[]
  practiceSteps?: LessonStep[]
}

function makeLightLesson(cfg: LightLessonConfig): Lesson {
  return {
    id: cfg.id,
    title: cfg.title,
    description: cfg.description,
    subject: 'Coordinate Geometry',
    order: cfg.order,
    region: cfg.region,
    icon: cfg.icon,
    estimatedMinutes: cfg.estimatedMinutes ?? 6,
    steps: [
      ...cfg.steps,
      {
        id: `${cfg.id}-complete`,
        type: 'complete',
        title: 'Lesson complete!',
        message: cfg.complete.message,
        discovery: cfg.complete.discovery,
      },
    ],
    lessonCheck: cfg.lessonCheck,
    practiceSteps: cfg.practiceSteps ?? [],
  }
}

// ── New concept track: Dilations → Combining → Congruence ────────────────────

export const dilationsLesson = makeLightLesson({
  id: 'dilations-101',
  title: 'Dilations: Scale from a Center',
  description:
    'Grow and shrink figures from the origin. A dilation multiplies every coordinate by the same scale factor — the shape stays the same, only its size changes.',
  order: 8,
  region: 'Scale Summit',
  icon: '🔍',
  steps: [
    {
      id: 'dil-concept',
      type: 'concept',
      title: 'A dilation multiplies the coordinates',
      body:
        'A dilation resizes a figure from a center point — we use the origin (0, 0). To dilate by a scale factor k, multiply BOTH coordinates by k: (x, y) → (k·x, k·y). If k > 1 the figure grows; if 0 < k < 1 it shrinks. The shape never distorts — it just gets bigger or smaller. Below, (2, 1) dilated by 2 lands at (4, 2).',
      graph: {
        range: 6,
        points: [
          { x: 2, y: 1, color: '#94a3b8', label: '(2, 1)' },
          { x: 4, y: 2, color: '#38bdf8', label: '(4, 2)' },
        ],
      },
    },
    {
      id: 'dil-mc',
      type: 'multiple-choice',
      title: 'Dilate by 2',
      prompt: 'Dilate the point (2, 3) by a scale factor of 2 from the origin. Where does it land?',
      options: ['(4, 6)', '(2, 6)', '(4, 3)', '(6, 4)'],
      correctIndex: 0,
      why: 'Multiply both coordinates by 2: (2·2, 3·2) = (4, 6).',
      hint: 'Multiply the x AND the y by the scale factor.',
    },
    {
      id: 'dil-input',
      type: 'number-input',
      title: 'Dilate by 3',
      prompt: 'Dilate (3, -1) by a scale factor of 3 from the origin. Enter the image as (x, y).',
      answers: ['(9, -3)'],
      inputLabel: 'Image =',
      why: 'Multiply both coordinates by 3: (3·3, -1·3) = (9, -3). A negative coordinate just stays negative.',
      hint: 'Multiply both numbers by 3 — keep the sign of each.',
    },
  ],
  complete: {
    message:
      'You scaled points from the origin by multiplying each coordinate by the scale factor. Bigger k grows the figure; a fraction shrinks it.',
    discovery: 'A dilation by factor k sends (x, y) → (k·x, k·y): same shape, new size.',
  },
  lessonCheck: [
    {
      id: 'dil-check-1',
      title: 'Question 1 of 3',
      prompt: 'Dilate (1, 4) by a scale factor of 2 from the origin. Enter as (x, y).',
      answers: ['(2, 8)'],
      hint: 'Multiply both coordinates by 2.',
      why: '(1·2, 4·2) = (2, 8).',
    },
    {
      id: 'dil-check-2',
      title: 'Question 2 of 3',
      prompt: 'Dilate (6, 2) by a scale factor of 1/2 (0.5) from the origin. Enter as (x, y).',
      answers: ['(3, 1)'],
      hint: 'Half of each coordinate — the figure shrinks.',
      why: '(6·0.5, 2·0.5) = (3, 1).',
    },
    {
      id: 'dil-check-3',
      title: 'Question 3 of 3',
      prompt: 'Dilate (-2, 5) by a scale factor of 3 from the origin. Enter as (x, y).',
      answers: ['(-6, 15)'],
      hint: 'Multiply both by 3; keep each sign.',
      why: '(-2·3, 5·3) = (-6, 15).',
    },
  ],
})

export const combiningTransformationsLesson = makeLightLesson({
  id: 'combining-transformations-101',
  title: 'Combining Transformations',
  description:
    'Chain moves together: translate then reflect, reflect then rotate. Apply one transformation, then run the next on the result — order matters.',
  order: 9,
  region: 'Scale Summit',
  icon: '🔗',
  steps: [
    {
      id: 'comb-concept',
      type: 'concept',
      title: 'Do them one at a time, in order',
      body:
        'To combine transformations, apply the first one to your point, then apply the next one to the RESULT — not to the original. The order you do them in can change where you end up, so work left to right and write down each step.',
    },
    {
      id: 'comb-input',
      type: 'number-input',
      title: 'Translate, then reflect',
      prompt:
        'Translate (1, 2) by (3, 0), then reflect the result across the x-axis. Enter the final point as (x, y).',
      answers: ['(4, -2)'],
      inputLabel: 'Final =',
      why: 'First translate: (1+3, 2+0) = (4, 2). Then reflect across the x-axis (flip the sign of y): (4, -2).',
      hint: 'Step 1: add the shift. Step 2: flip the sign of y on that result.',
    },
    {
      id: 'comb-mc',
      type: 'multiple-choice',
      title: 'Reflect, then translate',
      prompt: 'Reflect (2, 3) across the y-axis, then translate the result by (0, -1). Where does it end up?',
      options: ['(-2, 2)', '(2, 2)', '(-2, 4)', '(2, -2)'],
      correctIndex: 0,
      why: 'Reflect across the y-axis (flip x): (-2, 3). Then translate by (0, -1): (-2, 3-1) = (-2, 2).',
      hint: 'Flip the sign of x first, then subtract 1 from y.',
    },
  ],
  complete: {
    message:
      'You chained transformations by feeding the result of one into the next. Keeping the order straight is the whole trick.',
    discovery: 'Combining transformations = apply them in order, each acting on the previous result.',
  },
  lessonCheck: [
    {
      id: 'comb-check-1',
      title: 'Question 1 of 3',
      prompt: 'Translate (0, 0) by (2, 5), then reflect across the x-axis. Enter the final point as (x, y).',
      answers: ['(2, -5)'],
      hint: 'Translate first, then flip the sign of y.',
      why: 'Translate: (2, 5). Reflect across x-axis: (2, -5).',
    },
    {
      id: 'comb-check-2',
      title: 'Question 2 of 3',
      prompt: 'Reflect (4, 1) across the x-axis, then translate by (-4, 0). Enter the final point as (x, y).',
      answers: ['(0, -1)'],
      hint: 'Flip y first: (4, -1). Then add the shift.',
      why: 'Reflect: (4, -1). Translate by (-4, 0): (0, -1).',
    },
    {
      id: 'comb-check-3',
      title: 'Question 3 of 3',
      prompt: 'Translate (3, 1) by (0, 2), then reflect across the y-axis. Enter the final point as (x, y).',
      answers: ['(-3, 3)'],
      hint: 'Translate up first, then flip the sign of x.',
      why: 'Translate: (3, 3). Reflect across y-axis: (-3, 3).',
    },
  ],
})

export const congruenceSimilarityLesson = makeLightLesson({
  id: 'congruence-similarity-101',
  title: 'Congruence & Similarity',
  description:
    'The big idea behind every transformation: which ones keep a figure exactly the same size (congruent) and which only keep its shape (similar)?',
  order: 10,
  region: 'Scale Summit',
  icon: '🏆',
  steps: [
    {
      id: 'cong-concept',
      type: 'concept',
      title: 'Same size, or just same shape?',
      body:
        'Translations, reflections, and rotations are rigid motions — they slide, flip, or turn a figure without changing its size. The image is CONGRUENT to the original (identical size and shape). A dilation, on the other hand, resizes the figure: the image keeps the same shape but a different size, so it is SIMILAR but not congruent.',
    },
    {
      id: 'cong-mc-1',
      type: 'multiple-choice',
      title: 'Which one changes size?',
      prompt: 'Which transformation produces a figure that is the same shape but a DIFFERENT size?',
      options: ['Translation', 'Reflection', 'Rotation', 'Dilation'],
      correctIndex: 3,
      why: 'Only a dilation resizes a figure. The other three are rigid motions that preserve size.',
      hint: 'Three of these never change size. One is all about resizing.',
    },
    {
      id: 'cong-mc-2',
      type: 'multiple-choice',
      title: 'Rotate it',
      prompt: 'A triangle is rotated 90° about the origin. The image is ___ the original.',
      options: ['congruent to', 'similar but not congruent to', 'larger than', 'smaller than'],
      correctIndex: 0,
      why: 'Rotation is a rigid motion — it turns the figure without resizing, so the image is congruent.',
      hint: 'Did the turn change the size at all?',
    },
  ],
  complete: {
    message:
      'You can now sort transformations by what they preserve: rigid motions keep figures congruent, dilations make them similar.',
    discovery: 'Rigid motions (translate, reflect, rotate) → congruent. Dilations → similar (same shape, new size).',
  },
  lessonCheck: [
    {
      id: 'cong-check-1',
      title: 'Question 1 of 3',
      prompt:
        'Translations, reflections, and rotations all keep a figure the same size. Figures that are the same size AND shape are called ___ (one word).',
      answers: ['congruent'],
      hint: 'It starts with "con" and means identical in size and shape.',
      why: 'Same size and shape = congruent.',
    },
    {
      id: 'cong-check-2',
      title: 'Question 2 of 3',
      prompt:
        'A dilation by factor 3 makes a figure 3 times as big but keeps its shape. Such figures are called ___ (one word).',
      answers: ['similar'],
      hint: 'Same shape, different size.',
      why: 'Same shape but different size = similar.',
    },
    {
      id: 'cong-check-3',
      title: 'Question 3 of 3',
      prompt: 'A square is reflected across the y-axis. Is the image the same size as the original? (yes/no)',
      answers: ['yes'],
      hint: 'Reflection is a rigid motion.',
      why: 'Reflection never changes size, so yes — the image is congruent to the original.',
    },
  ],
})

// ── Remediation / scaffolded branch lessons ──────────────────────────────────

export const reflectionsGuidedLesson = makeLightLesson({
  id: 'reflections-guided-101',
  title: 'Reflections: Guided Mirror',
  description:
    'A slower walk through reflecting points across each axis, with the rule spelled out at every step.',
  order: 11,
  region: 'Mirror Marsh',
  icon: '🪞',
  steps: [
    {
      id: 'refg-concept',
      type: 'concept',
      title: 'One axis flips one sign',
      body:
        'Reflecting across the x-axis flips the point up/down: keep x the same, flip the sign of y. Reflecting across the y-axis flips it left/right: keep y the same, flip the sign of x. Only one coordinate ever changes sign — the other stays put.',
    },
    {
      id: 'refg-input',
      type: 'number-input',
      title: 'Across the x-axis',
      prompt: 'Reflect (3, 4) across the x-axis. Enter the image as (x, y).',
      answers: ['(3, -4)'],
      inputLabel: 'Image =',
      why: 'Across the x-axis, keep x = 3 and flip the sign of y: 4 → -4, giving (3, -4).',
      hint: 'Keep x. Flip the sign of y.',
    },
    {
      id: 'refg-mc',
      type: 'multiple-choice',
      title: 'Across the y-axis',
      prompt: 'Reflect (-2, 5) across the y-axis. Where does it land?',
      options: ['(2, 5)', '(-2, -5)', '(2, -5)', '(-2, 5)'],
      correctIndex: 0,
      why: 'Across the y-axis, keep y = 5 and flip the sign of x: -2 → 2, giving (2, 5).',
      hint: 'Keep y. Flip the sign of x.',
    },
  ],
  complete: {
    message: 'You reflected across both axes by flipping exactly one sign each time.',
    discovery: 'Across x-axis: flip y. Across y-axis: flip x. The other coordinate never moves.',
  },
  lessonCheck: [
    {
      id: 'refg-check-1',
      title: 'Question 1 of 3',
      prompt: 'Reflect (5, 2) across the x-axis. Enter as (x, y).',
      answers: ['(5, -2)'],
      hint: 'Keep x, flip y.',
      why: 'Across the x-axis: (5, -2).',
    },
    {
      id: 'refg-check-2',
      title: 'Question 2 of 3',
      prompt: 'Reflect (-3, 1) across the y-axis. Enter as (x, y).',
      answers: ['(3, 1)'],
      hint: 'Keep y, flip x.',
      why: 'Across the y-axis: (3, 1).',
    },
    {
      id: 'refg-check-3',
      title: 'Question 3 of 3',
      prompt: 'Reflect (4, -6) across the x-axis. Enter as (x, y).',
      answers: ['(4, 6)'],
      hint: 'Keep x, flip the sign of y.',
      why: 'Across the x-axis: (4, 6).',
    },
  ],
})

export const translationsRejoinLesson = makeLightLesson({
  id: 'translations-rejoin-101',
  title: 'Translations: Ready to Rejoin',
  description: 'A quick translation refresher to get you back onto the main track with confidence.',
  order: 12,
  region: 'Graph City',
  icon: '➡️',
  steps: [
    {
      id: 'trej-concept',
      type: 'concept',
      title: 'Translating adds the shift',
      body:
        'A translation slides a point without turning or flipping it. Add the shift to each coordinate: (x, y) shifted by (Δx, Δy) becomes (x + Δx, y + Δy). Right/up are positive; left/down are negative.',
    },
    {
      id: 'trej-input',
      type: 'number-input',
      title: 'Add the shift',
      prompt: 'Translate (2, 3) by (4, -1). Enter the image as (x, y).',
      answers: ['(6, 2)'],
      inputLabel: 'Image =',
      why: 'Add componentwise: (2+4, 3+(-1)) = (6, 2).',
      hint: 'Add 4 to x, add -1 to y.',
    },
    {
      id: 'trej-mc',
      type: 'multiple-choice',
      title: 'Slide it',
      prompt: 'Translate (-1, 0) by (2, 5). Where does it land?',
      options: ['(1, 5)', '(-1, 5)', '(1, -5)', '(3, 5)'],
      correctIndex: 0,
      why: '(-1+2, 0+5) = (1, 5).',
      hint: 'Add 2 to x, add 5 to y.',
    },
  ],
  complete: {
    message: 'Translations are just addition on each coordinate — you are ready to rejoin the main path.',
    discovery: 'Translate by (Δx, Δy): (x, y) → (x + Δx, y + Δy).',
  },
  lessonCheck: [
    {
      id: 'trej-check-1',
      title: 'Question 1 of 3',
      prompt: 'Translate (0, 0) by (3, 7). Enter as (x, y).',
      answers: ['(3, 7)'],
      hint: 'Add the shift to the origin.',
      why: '(0+3, 0+7) = (3, 7).',
    },
    {
      id: 'trej-check-2',
      title: 'Question 2 of 3',
      prompt: 'Translate (5, 5) by (-2, -3). Enter as (x, y).',
      answers: ['(3, 2)'],
      hint: 'Add the negative shifts.',
      why: '(5-2, 5-3) = (3, 2).',
    },
    {
      id: 'trej-check-3',
      title: 'Question 3 of 3',
      prompt: 'Translate (-4, 2) by (4, 0). Enter as (x, y).',
      answers: ['(0, 2)'],
      hint: 'Add 4 to x; y is unchanged.',
      why: '(-4+4, 2+0) = (0, 2).',
    },
  ],
})

export const numberLineExtraLesson = makeLightLesson({
  id: 'number-line-extra-101',
  title: 'Number Line: Extra Practice',
  description: 'More reps on the number line — moving left and right, and measuring distance between points.',
  order: 13,
  region: 'Number Line Outpost',
  icon: '📏',
  steps: [
    {
      id: 'nle-concept',
      type: 'concept',
      title: 'Right adds, left subtracts',
      body:
        'On the number line, moving right adds and moving left subtracts. The distance between two numbers is how far apart they are — always count the gap as a positive number of steps.',
    },
    {
      id: 'nle-input',
      type: 'number-input',
      title: 'Move along the line',
      prompt: 'Start at 3 and move left 5 steps. Where do you land?',
      answers: ['-2'],
      inputLabel: 'Position =',
      why: 'Moving left subtracts: 3 - 5 = -2.',
      hint: 'Left means subtract: 3 - 5.',
    },
    {
      id: 'nle-mc',
      type: 'multiple-choice',
      title: 'Distance',
      prompt: 'How far apart are -2 and 4 on the number line?',
      options: ['6', '2', '-6', '8'],
      correctIndex: 0,
      why: 'From -2 to 4 is 6 steps: |4 - (-2)| = 6.',
      hint: 'Count the steps from -2 up to 4.',
    },
  ],
  complete: {
    message: 'You moved along the line and measured gaps between points — the backbone of coordinates.',
    discovery: 'Right adds, left subtracts; distance is the positive gap between two numbers.',
  },
  lessonCheck: [
    {
      id: 'nle-check-1',
      title: 'Question 1 of 3',
      prompt: 'Start at -1 and move right 4 steps. Where do you land?',
      answers: ['3'],
      hint: 'Right adds: -1 + 4.',
      why: '-1 + 4 = 3.',
    },
    {
      id: 'nle-check-2',
      title: 'Question 2 of 3',
      prompt: 'How far apart are -5 and -1 on the number line?',
      answers: ['4'],
      hint: 'Count the steps from -5 to -1.',
      why: '|-1 - (-5)| = 4.',
    },
    {
      id: 'nle-check-3',
      title: 'Question 3 of 3',
      prompt: 'Start at 2 and move left 6 steps. Where do you land?',
      answers: ['-4'],
      hint: 'Left subtracts: 2 - 6.',
      why: '2 - 6 = -4.',
    },
  ],
})

export const reflectionsRejoinLesson = makeLightLesson({
  id: 'reflections-rejoin-101',
  title: 'Reflections: Back on Track',
  description: 'Prove your reflections are solid and step back onto the main path.',
  order: 14,
  region: 'Mirror Marsh',
  icon: '↔️',
  steps: [
    {
      id: 'rrej-concept',
      type: 'concept',
      title: 'Quick recap of both mirrors',
      body:
        'Across the x-axis: keep x, flip the sign of y. Across the y-axis: keep y, flip the sign of x. That is the whole rule — only one coordinate changes sign.',
    },
    {
      id: 'rrej-input-1',
      type: 'number-input',
      title: 'Across the x-axis',
      prompt: 'Reflect (6, -2) across the x-axis. Enter as (x, y).',
      answers: ['(6, 2)'],
      inputLabel: 'Image =',
      why: 'Keep x = 6, flip y: -2 → 2, giving (6, 2).',
      hint: 'Flip the sign of y.',
    },
    {
      id: 'rrej-input-2',
      type: 'number-input',
      title: 'Across the y-axis',
      prompt: 'Reflect (-5, 3) across the y-axis. Enter as (x, y).',
      answers: ['(5, 3)'],
      inputLabel: 'Image =',
      why: 'Keep y = 3, flip x: -5 → 5, giving (5, 3).',
      hint: 'Flip the sign of x.',
    },
  ],
  complete: {
    message: 'Reflections across both axes are second nature now — back to the main track.',
    discovery: 'Across x-axis flip y; across y-axis flip x.',
  },
  lessonCheck: [
    {
      id: 'rrej-check-1',
      title: 'Question 1 of 3',
      prompt: 'Reflect (2, 7) across the x-axis. Enter as (x, y).',
      answers: ['(2, -7)'],
      hint: 'Flip y.',
      why: '(2, -7).',
    },
    {
      id: 'rrej-check-2',
      title: 'Question 2 of 3',
      prompt: 'Reflect (-1, -1) across the y-axis. Enter as (x, y).',
      answers: ['(1, -1)'],
      hint: 'Flip x.',
      why: '(1, -1).',
    },
    {
      id: 'rrej-check-3',
      title: 'Question 3 of 3',
      prompt: 'Reflect (3, 5) across the x-axis. Enter as (x, y).',
      answers: ['(3, -5)'],
      hint: 'Flip y.',
      why: '(3, -5).',
    },
  ],
})

export const coordinatePlaneReviewLesson = makeLightLesson({
  id: 'coordinate-plane-review-101',
  title: 'Coordinate Plane: Quick Review',
  description: 'A fast refresher on reading coordinates and naming quadrants before you push forward.',
  order: 15,
  region: 'Quadrant Quarry',
  icon: '🧭',
  steps: [
    {
      id: 'cpr-concept',
      type: 'concept',
      title: 'Signs tell you the quadrant',
      body:
        'A point is (x, y): x is left/right, y is up/down. The signs place it in a quadrant — I: (+, +), II: (-, +), III: (-, -), IV: (+, -). Quadrants are numbered counterclockwise starting from the top-right.',
    },
    {
      id: 'cpr-mc',
      type: 'multiple-choice',
      title: 'Name the quadrant',
      prompt: 'The point (-3, 2) is in which quadrant?',
      options: ['I', 'II', 'III', 'IV'],
      correctIndex: 1,
      why: 'x is negative and y is positive, which is the top-left: Quadrant II.',
      hint: 'Negative x, positive y → top-left.',
    },
    {
      id: 'cpr-input',
      type: 'number-input',
      title: 'Read the address',
      prompt: 'A point is 4 steps left and 1 step down from the origin. What are its coordinates? Enter as (x, y).',
      answers: ['(-4, -1)'],
      inputLabel: 'Point =',
      why: 'Left 4 makes x = -4; down 1 makes y = -1, so the point is (-4, -1).',
      hint: 'Left is negative x; down is negative y.',
    },
  ],
  complete: {
    message: 'You can read any point and name its quadrant from the signs alone.',
    discovery: 'Signs of (x, y) fix the quadrant: I (+,+), II (-,+), III (-,-), IV (+,-).',
  },
  lessonCheck: [
    {
      id: 'cpr-check-1',
      title: 'Question 1 of 3',
      prompt: 'The point (5, -2) is in which quadrant? (I, II, III, or IV)',
      answers: ['IV', '4'],
      hint: 'Positive x, negative y → bottom-right.',
      why: '(+, -) is Quadrant IV.',
    },
    {
      id: 'cpr-check-2',
      title: 'Question 2 of 3',
      prompt: 'A point is 2 right and 3 up from the origin. What are its coordinates? Enter as (x, y).',
      answers: ['(2, 3)'],
      hint: 'Right is x, up is y.',
      why: '(2, 3).',
    },
    {
      id: 'cpr-check-3',
      title: 'Question 3 of 3',
      prompt: 'The point (-1, -6) is in which quadrant? (I, II, III, or IV)',
      answers: ['III', '3'],
      hint: 'Both negative → bottom-left.',
      why: '(-, -) is Quadrant III.',
    },
  ],
})

export const translationsMovingUpLesson = makeLightLesson({
  id: 'translations-movingup-101',
  title: 'Translations: Moving Up',
  description: 'Step up from the first-quadrant basics to translations that cross into negative numbers.',
  order: 16,
  region: 'Graph City',
  icon: '⬆️',
  steps: [
    {
      id: 'tmu-concept',
      type: 'concept',
      title: 'Shifts can be negative',
      body:
        'Translating still means adding the shift to each coordinate — but now the shift (or the result) can be negative. Left and down are negative; the arithmetic is the same, just watch the signs.',
    },
    {
      id: 'tmu-input',
      type: 'number-input',
      title: 'A negative shift',
      prompt: 'Translate (1, 1) by (-3, 2). Enter the image as (x, y).',
      answers: ['(-2, 3)'],
      inputLabel: 'Image =',
      why: '(1 + (-3), 1 + 2) = (-2, 3).',
      hint: 'Add -3 to x, add 2 to y.',
    },
    {
      id: 'tmu-mc',
      type: 'multiple-choice',
      title: 'Back to the origin',
      prompt: 'Translate (4, -2) by (-4, 2). Where does it land?',
      options: ['(0, 0)', '(8, -4)', '(0, -4)', '(8, 0)'],
      correctIndex: 0,
      why: '(4 + (-4), -2 + 2) = (0, 0).',
      hint: 'Add the shifts — they cancel each coordinate out.',
    },
  ],
  complete: {
    message: 'You handled translations with negative shifts and negative results. Onward and upward.',
    discovery: 'Negative shifts work exactly like positive ones — add carefully and mind the signs.',
  },
  lessonCheck: [
    {
      id: 'tmu-check-1',
      title: 'Question 1 of 3',
      prompt: 'Translate (2, 2) by (-5, -5). Enter as (x, y).',
      answers: ['(-3, -3)'],
      hint: 'Add the negative shifts.',
      why: '(2-5, 2-5) = (-3, -3).',
    },
    {
      id: 'tmu-check-2',
      title: 'Question 2 of 3',
      prompt: 'Translate (-1, 3) by (1, -3). Enter as (x, y).',
      answers: ['(0, 0)'],
      hint: 'The shifts cancel each coordinate.',
      why: '(-1+1, 3-3) = (0, 0).',
    },
    {
      id: 'tmu-check-3',
      title: 'Question 3 of 3',
      prompt: 'Translate (0, -4) by (0, 4). Enter as (x, y).',
      answers: ['(0, 0)'],
      hint: 'Only y changes.',
      why: '(0+0, -4+4) = (0, 0).',
    },
  ],
})

export const teacherInterventionLesson = makeLightLesson({
  id: 'teacher-intervention-101',
  title: 'Check-In Point',
  description:
    'A friendly pause to lock in the very basics. Hitting a wall here is normal — this check-in confirms the foundation so you (or a teacher) know exactly what to revisit.',
  order: 17,
  region: 'Quadrant Quarry',
  icon: '🤝',
  estimatedMinutes: 4,
  steps: [
    {
      id: 'tint-concept',
      type: 'concept',
      title: 'Let’s reset the foundation',
      body:
        'You have hit a tricky spot, and that is completely normal — it just means a couple of basics need another pass. There is no rush and no penalty. Answer these gentle questions to confirm the foundation, then take a break or revisit Coordinate Plane: First Steps whenever you are ready.',
    },
    {
      id: 'tint-mc',
      type: 'multiple-choice',
      title: 'The origin',
      prompt: 'Where is the origin — the point you always start counting from?',
      options: ['(0, 0)', '(1, 1)', '(0, 1)', '(1, 0)'],
      correctIndex: 0,
      why: 'The origin is (0, 0): zero right and zero up. Every other point is measured from here.',
      hint: 'It is where the two axes cross, before you move at all.',
    },
  ],
  complete: {
    message:
      'Check-in complete. There is no rush — revisit Coordinate Plane: First Steps any time, and reach out for help if you want a hand. You have got this.',
    discovery: 'Everything in coordinate geometry is measured from the origin (0, 0).',
  },
  lessonCheck: [
    {
      id: 'tint-check-1',
      title: 'Question 1 of 2',
      prompt: 'What are the coordinates of the origin? Enter as (x, y).',
      answers: ['(0, 0)'],
      hint: 'Zero right, zero up.',
      why: 'The origin is (0, 0).',
    },
    {
      id: 'tint-check-2',
      title: 'Question 2 of 2',
      prompt: 'In a coordinate pair (x, y), which letter is written first — x or y?',
      answers: ['x'],
      hint: 'Read across before up.',
      why: 'x always comes first: across (x), then up (y).',
    },
  ],
})

export const rotationsBackOnTrackLesson = makeLightLesson({
  id: 'rotations-backontrack-101',
  title: 'Rotations: Back on Track',
  description: 'Rebuild your rotation skills with the friendliest turns: 180° about the origin, plus a clean 90°.',
  order: 18,
  region: 'Spin City',
  icon: '🔄',
  steps: [
    {
      id: 'rbot-concept',
      type: 'concept',
      title: 'Turning about the origin',
      body:
        'Rotating 180° about the origin flips a point straight through the center: (x, y) → (-x, -y). A 90° counterclockwise turn (turning left) sends (x, y) → (-y, x). We always rotate about the origin here.',
    },
    {
      id: 'rbot-mc',
      type: 'multiple-choice',
      title: '90° counterclockwise',
      prompt: 'Rotate (3, 0) by 90° counterclockwise about the origin. Where does it land?',
      options: ['(0, 3)', '(0, -3)', '(-3, 0)', '(3, 0)'],
      correctIndex: 0,
      why: 'A 90° counterclockwise turn sends (x, y) → (-y, x): (3, 0) → (-0, 3) = (0, 3).',
      hint: 'Use (x, y) → (-y, x).',
    },
    {
      id: 'rbot-input',
      type: 'number-input',
      title: '180°',
      prompt: 'Rotate (2, 5) by 180° about the origin. Enter the image as (x, y).',
      answers: ['(-2, -5)'],
      inputLabel: 'Image =',
      why: 'A 180° turn flips both signs: (x, y) → (-x, -y), so (2, 5) → (-2, -5).',
      hint: 'Flip the sign of both coordinates.',
    },
  ],
  complete: {
    message: 'You turned points 90° and 180° about the origin — rotations are back under control.',
    discovery: '180°: (x, y) → (-x, -y). 90° counterclockwise: (x, y) → (-y, x).',
  },
  lessonCheck: [
    {
      id: 'rbot-check-1',
      title: 'Question 1 of 3',
      prompt: 'Rotate (2, 5) by 180° about the origin. Enter as (x, y).',
      answers: ['(-2, -5)'],
      hint: 'Flip both signs.',
      why: '(-2, -5).',
    },
    {
      id: 'rbot-check-2',
      title: 'Question 2 of 3',
      prompt: 'Rotate (-1, 4) by 180° about the origin. Enter as (x, y).',
      answers: ['(1, -4)'],
      hint: 'Flip both signs.',
      why: '(1, -4).',
    },
    {
      id: 'rbot-check-3',
      title: 'Question 3 of 3',
      prompt: 'Rotate (3, -2) by 180° about the origin. Enter as (x, y).',
      answers: ['(-3, 2)'],
      hint: 'Flip both signs.',
      why: '(-3, 2).',
    },
  ],
})

export const reflectionsFullLesson = makeLightLesson({
  id: 'reflections-full-101',
  title: 'Reflections: Full Lesson (No Scaffolds)',
  description: 'The real thing, no training wheels: reflect across either axis and chain two reflections together.',
  order: 19,
  region: 'Mirror Marsh',
  icon: '✨',
  steps: [
    {
      id: 'rful-concept',
      type: 'concept',
      title: 'Two reflections make a half-turn',
      body:
        'Reflecting across the x-axis flips y; across the y-axis flips x. Reflect across BOTH axes and you flip both signs — exactly the same as a 180° rotation: (x, y) → (-x, -y).',
    },
    {
      id: 'rful-input',
      type: 'number-input',
      title: 'Across both axes',
      prompt: 'Reflect (3, 4) across the x-axis, then across the y-axis. Enter the final point as (x, y).',
      answers: ['(-3, -4)'],
      inputLabel: 'Final =',
      why: 'Across the x-axis: (3, -4). Then across the y-axis: (-3, -4). Both signs flipped.',
      hint: 'Flip y, then flip x — both signs end up flipped.',
    },
    {
      id: 'rful-mc',
      type: 'multiple-choice',
      title: 'One mirror',
      prompt: 'Reflect (-2, 5) across the x-axis. Where does it land?',
      options: ['(-2, -5)', '(2, 5)', '(2, -5)', '(-2, 5)'],
      correctIndex: 0,
      why: 'Across the x-axis, keep x = -2 and flip y: 5 → -5, giving (-2, -5).',
      hint: 'Keep x, flip the sign of y.',
    },
  ],
  complete: {
    message: 'You reflected across single axes and saw that two reflections equal a 180° rotation.',
    discovery: 'Reflect across both axes = flip both signs = a 180° rotation about the origin.',
  },
  lessonCheck: [
    {
      id: 'rful-check-1',
      title: 'Question 1 of 3',
      prompt: 'Reflect (7, -3) across the y-axis. Enter as (x, y).',
      answers: ['(-7, -3)'],
      hint: 'Flip x.',
      why: '(-7, -3).',
    },
    {
      id: 'rful-check-2',
      title: 'Question 2 of 3',
      prompt: 'Reflect (4, 4) across the x-axis. Enter as (x, y).',
      answers: ['(4, -4)'],
      hint: 'Flip y.',
      why: '(4, -4).',
    },
    {
      id: 'rful-check-3',
      title: 'Question 3 of 3',
      prompt: 'Reflect (-5, 2) across the x-axis. Enter as (x, y).',
      answers: ['(-5, -2)'],
      hint: 'Flip y.',
      why: '(-5, -2).',
    },
  ],
})

export const combiningRevisitLesson = makeLightLesson({
  id: 'combining-revisit-101',
  title: 'Combining Transformations: Revisit',
  description: 'A gentler pass at chaining transformations, one careful step at a time.',
  order: 20,
  region: 'Scale Summit',
  icon: '🧩',
  steps: [
    {
      id: 'crev-concept',
      type: 'concept',
      title: 'Track the result each step',
      body:
        'When you combine moves, write down the point after the first transformation, then apply the second to THAT point. Going one step at a time keeps the signs and order straight.',
    },
    {
      id: 'crev-input',
      type: 'number-input',
      title: 'Translate, then reflect',
      prompt: 'Translate (1, 1) by (2, 2), then reflect across the x-axis. Enter the final point as (x, y).',
      answers: ['(3, -3)'],
      inputLabel: 'Final =',
      why: 'Translate: (3, 3). Reflect across the x-axis: (3, -3).',
      hint: 'Add the shift first, then flip y.',
    },
    {
      id: 'crev-mc',
      type: 'multiple-choice',
      title: 'Reflect, then translate',
      prompt: 'Reflect (2, 2) across the y-axis, then translate by (2, 0). Where does it end up?',
      options: ['(0, 2)', '(-4, 2)', '(4, 2)', '(0, -2)'],
      correctIndex: 0,
      why: 'Reflect across the y-axis: (-2, 2). Translate by (2, 0): (0, 2).',
      hint: 'Flip x first, then add 2 to x.',
    },
  ],
  complete: {
    message: 'You chained transformations carefully, one result at a time.',
    discovery: 'Combine transformations by applying each to the previous result, in order.',
  },
  lessonCheck: [
    {
      id: 'crev-check-1',
      title: 'Question 1 of 3',
      prompt: 'Translate (0, 1) by (0, -1), then reflect across the x-axis. Enter as (x, y).',
      answers: ['(0, 0)'],
      hint: 'Translate to the origin first.',
      why: 'Translate: (0, 0). Reflect: (0, 0).',
    },
    {
      id: 'crev-check-2',
      title: 'Question 2 of 3',
      prompt: 'Reflect (3, 1) across the x-axis, then translate by (0, 1). Enter as (x, y).',
      answers: ['(3, 0)'],
      hint: 'Flip y first: (3, -1), then add 1 to y.',
      why: 'Reflect: (3, -1). Translate: (3, 0).',
    },
    {
      id: 'crev-check-3',
      title: 'Question 3 of 3',
      prompt: 'Translate (-2, 0) by (2, 3), then reflect across the y-axis. Enter as (x, y).',
      answers: ['(0, 3)'],
      hint: 'Translate first: (0, 3), then flip x.',
      why: 'Translate: (0, 3). Reflect across y-axis: (0, 3).',
    },
  ],
})

export const rotationsContinuingLesson = makeLightLesson({
  id: 'rotations-continuing-101',
  title: 'Rotations: Continuing the Track',
  description: 'Keep your rotation skills sharp with more turns about the origin.',
  order: 21,
  region: 'Spin City',
  icon: '🌀',
  steps: [
    {
      id: 'rcon-concept',
      type: 'concept',
      title: 'The turning rules',
      body:
        '180° about the origin: (x, y) → (-x, -y). 90° counterclockwise: (x, y) → (-y, x). Picture the point swinging around the center and the rules will feel natural.',
    },
    {
      id: 'rcon-input',
      type: 'number-input',
      title: '180°',
      prompt: 'Rotate (5, 1) by 180° about the origin. Enter the image as (x, y).',
      answers: ['(-5, -1)'],
      inputLabel: 'Image =',
      why: 'Flip both signs: (5, 1) → (-5, -1).',
      hint: 'Flip both signs.',
    },
    {
      id: 'rcon-mc',
      type: 'multiple-choice',
      title: '90° counterclockwise',
      prompt: 'Rotate (0, 2) by 90° counterclockwise about the origin. Where does it land?',
      options: ['(-2, 0)', '(2, 0)', '(0, -2)', '(0, 2)'],
      correctIndex: 0,
      why: 'Use (x, y) → (-y, x): (0, 2) → (-2, 0).',
      hint: 'Apply (x, y) → (-y, x).',
    },
  ],
  complete: {
    message: 'Rotations of 90° and 180° about the origin are locked in. Great turning.',
    discovery: '180°: flip both signs. 90° counterclockwise: (x, y) → (-y, x).',
  },
  lessonCheck: [
    {
      id: 'rcon-check-1',
      title: 'Question 1 of 3',
      prompt: 'Rotate (3, 3) by 180° about the origin. Enter as (x, y).',
      answers: ['(-3, -3)'],
      hint: 'Flip both signs.',
      why: '(-3, -3).',
    },
    {
      id: 'rcon-check-2',
      title: 'Question 2 of 3',
      prompt: 'Rotate (-4, 1) by 180° about the origin. Enter as (x, y).',
      answers: ['(4, -1)'],
      hint: 'Flip both signs.',
      why: '(4, -1).',
    },
    {
      id: 'rcon-check-3',
      title: 'Question 3 of 3',
      prompt: 'Rotate (2, 0) by 180° about the origin. Enter as (x, y).',
      answers: ['(-2, 0)'],
      hint: 'Flip both signs.',
      why: '(-2, 0).',
    },
  ],
})

export const reflectionsGuidedRetryLesson = makeLightLesson({
  id: 'reflections-guidedretry-101',
  title: 'Reflections: Guided Retry',
  description: 'The gentlest reflection practice — one axis, one rule, repeated until it clicks.',
  order: 22,
  region: 'Mirror Marsh',
  icon: '🔁',
  steps: [
    {
      id: 'rgr-concept',
      type: 'concept',
      title: 'Across the x-axis: flip y',
      body:
        'We will stick to one mirror: the x-axis. The rule could not be simpler — keep x exactly the same, and flip the sign of y. Up becomes down, down becomes up; left/right never changes.',
    },
    {
      id: 'rgr-input-1',
      type: 'number-input',
      title: 'Try one',
      prompt: 'Reflect (2, 3) across the x-axis. Enter as (x, y).',
      answers: ['(2, -3)'],
      inputLabel: 'Image =',
      why: 'Keep x = 2, flip y: 3 → -3, giving (2, -3).',
      hint: 'Keep x. Flip the sign of y.',
    },
    {
      id: 'rgr-input-2',
      type: 'number-input',
      title: 'One more',
      prompt: 'Reflect (1, 5) across the x-axis. Enter as (x, y).',
      answers: ['(1, -5)'],
      inputLabel: 'Image =',
      why: 'Keep x = 1, flip y: 5 → -5, giving (1, -5).',
      hint: 'Keep x. Flip the sign of y.',
    },
  ],
  complete: {
    message: 'You flipped points across the x-axis again and again — the rule is yours now.',
    discovery: 'Across the x-axis: keep x, flip the sign of y.',
  },
  lessonCheck: [
    {
      id: 'rgr-check-1',
      title: 'Question 1 of 3',
      prompt: 'Reflect (4, 2) across the x-axis. Enter as (x, y).',
      answers: ['(4, -2)'],
      hint: 'Flip y.',
      why: '(4, -2).',
    },
    {
      id: 'rgr-check-2',
      title: 'Question 2 of 3',
      prompt: 'Reflect (3, 7) across the x-axis. Enter as (x, y).',
      answers: ['(3, -7)'],
      hint: 'Flip y.',
      why: '(3, -7).',
    },
    {
      id: 'rgr-check-3',
      title: 'Question 3 of 3',
      prompt: 'Reflect (6, 1) across the x-axis. Enter as (x, y).',
      answers: ['(6, -1)'],
      hint: 'Flip y.',
      why: '(6, -1).',
    },
  ],
})

export const rotationsRatioWarmupLesson = makeLightLesson({
  id: 'rotations-ratiowarmup-101',
  title: 'Rotations Revisit + Ratio Warmup',
  description:
    'Dilations lean on multiplying by a scale factor, so we warm up with ratios and scale factors first, then revisit the friendly turns about the origin before climbing back to dilations.',
  order: 23,
  region: 'Spin City',
  icon: '⚙️',
  steps: [
    {
      id: 'rrw-concept',
      type: 'concept',
      title: 'Warm up: a scale factor is just a multiplier',
      body:
        'Dilations multiply each coordinate by a scale factor k — that is really just a ratio. A factor of 2 means “twice as far from the origin”, a factor of 1/2 means “half as far”. Once that ratio feels comfortable, rotations are easy again: turning 180° about the origin flips both signs, (x, y) → (-x, -y), and a 90° counterclockwise turn sends (x, y) → (-y, x). Notice neither turn changes how far the point is from the origin — only a scale factor does that.',
      graph: {
        range: 6,
        points: [
          { x: 2, y: 1, color: '#94a3b8', label: '(2, 1)' },
          { x: 4, y: 2, color: '#38bdf8', label: '×2 = (4, 2)' },
        ],
      },
    },
    {
      id: 'rrw-mc',
      type: 'multiple-choice',
      title: 'Ratio warmup',
      prompt: 'A point sits 3 units from the origin. After a dilation by a scale factor of 2, how far from the origin is its image?',
      options: ['6 units', '5 units', '3 units', '1.5 units'],
      correctIndex: 0,
      why: 'A scale factor of 2 doubles the distance from the origin: 3 × 2 = 6 units.',
      hint: 'Multiply the distance by the scale factor.',
    },
    {
      id: 'rrw-input',
      type: 'number-input',
      title: 'Now revisit a rotation',
      prompt: 'Rotate (4, 1) by 180° about the origin. Enter the image as (x, y).',
      answers: ['(-4, -1)'],
      inputLabel: 'Image =',
      why: 'A 180° turn flips both signs: (x, y) → (-x, -y), so (4, 1) → (-4, -1). The distance from the origin is unchanged — a turn never rescales.',
      hint: 'Flip the sign of both coordinates.',
    },
  ],
  complete: {
    message:
      'You warmed up with scale-factor ratios, then turned a point 180° about the origin. Now the difference is clear: dilations rescale, rotations only turn.',
    discovery: 'A scale factor multiplies distance from the origin; a rotation keeps that distance the same and only turns the point.',
  },
  lessonCheck: [
    {
      id: 'rrw-check-1',
      title: 'Question 1 of 3',
      prompt: 'A point is 5 units from the origin. After a dilation by a scale factor of 3, how far from the origin is its image? Enter just the number of units.',
      answers: ['15'],
      hint: 'Multiply the distance by 3.',
      why: '5 × 3 = 15 units.',
    },
    {
      id: 'rrw-check-2',
      title: 'Question 2 of 3',
      prompt: 'Rotate (2, 5) by 180° about the origin. Enter as (x, y).',
      answers: ['(-2, -5)'],
      hint: 'Flip both signs.',
      why: '(-2, -5).',
    },
    {
      id: 'rrw-check-3',
      title: 'Question 3 of 3',
      prompt: 'Rotate (3, 0) by 90° counterclockwise about the origin. Enter as (x, y).',
      answers: ['(0, 3)'],
      hint: 'Use (x, y) → (-y, x).',
      why: '(3, 0) → (-0, 3) = (0, 3).',
    },
  ],
})

export const linearEquationsLesson = makeLightLesson({
  id: 'linear-equations-101',
  title: 'Linear Equations: A New Unit',
  description:
    'Congruence and similarity complete the transformations unit — now step into the next major topic. A linear equation balances both sides; solve it by undoing operations to isolate the variable.',
  order: 24,
  region: 'Linear Mountain',
  icon: '🧮',
  steps: [
    {
      id: 'lin-concept',
      type: 'concept',
      title: 'Keep both sides balanced',
      body:
        'A linear equation says two expressions are equal, like x + 4 = 9. To solve it, undo whatever is done to x by doing the opposite to BOTH sides, keeping the equation balanced. For x + 4 = 9, subtract 4 from both sides: x = 5. For 3x = 12, divide both sides by 3: x = 4. The goal is always to get x alone on one side.',
    },
    {
      id: 'lin-mc',
      type: 'multiple-choice',
      title: 'Undo the operation',
      prompt: 'To solve x + 7 = 10, what should you do to both sides?',
      options: ['Subtract 7', 'Add 7', 'Multiply by 7', 'Divide by 7'],
      correctIndex: 0,
      why: 'x is increased by 7, so subtract 7 from both sides to undo it: x = 3.',
      hint: 'Do the opposite of the operation attached to x.',
    },
    {
      id: 'lin-input',
      type: 'number-input',
      title: 'Solve a one-step equation',
      prompt: 'Solve for x:  3x = 12. Enter just the value of x.',
      answers: ['4'],
      inputLabel: 'x =',
      why: 'x is multiplied by 3, so divide both sides by 3: 12 ÷ 3 = 4, giving x = 4.',
      hint: 'Divide both sides by the number multiplying x.',
    },
  ],
  complete: {
    message:
      'You have crossed into linear equations: solving by undoing operations to isolate the variable, always keeping both sides balanced. This is the gateway to the next unit.',
    discovery: 'Solve a linear equation by doing the inverse operation to both sides until x stands alone.',
  },
  lessonCheck: [
    {
      id: 'lin-check-1',
      title: 'Question 1 of 3',
      prompt: 'Solve for x:  x + 5 = 12. Enter just the value of x.',
      answers: ['7'],
      hint: 'Subtract 5 from both sides.',
      why: '12 - 5 = 7, so x = 7.',
    },
    {
      id: 'lin-check-2',
      title: 'Question 2 of 3',
      prompt: 'Solve for x:  x - 3 = 4. Enter just the value of x.',
      answers: ['7'],
      hint: 'Add 3 to both sides.',
      why: '4 + 3 = 7, so x = 7.',
    },
    {
      id: 'lin-check-3',
      title: 'Question 3 of 3',
      prompt: 'Solve for x:  5x = 20. Enter just the value of x.',
      answers: ['4'],
      hint: 'Divide both sides by 5.',
      why: '20 ÷ 5 = 4, so x = 4.',
    },
  ],
})

/** All expansion lessons, in a single array for easy registration. */
export const expansionLessons: Lesson[] = [
  dilationsLesson,
  combiningTransformationsLesson,
  congruenceSimilarityLesson,
  reflectionsGuidedLesson,
  translationsRejoinLesson,
  numberLineExtraLesson,
  reflectionsRejoinLesson,
  coordinatePlaneReviewLesson,
  translationsMovingUpLesson,
  teacherInterventionLesson,
  rotationsBackOnTrackLesson,
  reflectionsFullLesson,
  combiningRevisitLesson,
  rotationsContinuingLesson,
  reflectionsGuidedRetryLesson,
  rotationsRatioWarmupLesson,
  linearEquationsLesson,
]
