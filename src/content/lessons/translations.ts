import type {
  Lesson,
  LessonStep,
  LessonCheckQuestion,
  TranslationCheckQuestion,
} from '../../types/lesson'

export const translationsLessonCheck: LessonCheckQuestion[] = [
  {
    id: 'check-1',
    title: 'Question 1 of 3',
    prompt:
      'A point at (2, 5) is translated 4 units right and 2 units down. What are its new coordinates? Enter as (x, y).',
    answers: ['(6, 3)', '6, 3', '6,3'],
    hint: 'Right adds to x, down subtracts from y: x becomes 2 + 4, y becomes 5 − 2.',
    why: 'Moving 4 right: 2 + 4 = 6. Moving 2 down: 5 − 2 = 3. The new point is (6, 3).',
    variants: [
      {
        prompt:
          'A point at (1, 4) is translated 3 units right and 5 units down. What are its new coordinates? Enter as (x, y).',
        answers: ['(4, -1)', '4, -1', '4,-1'],
        hint: 'Add 3 to x, subtract 5 from y.',
        why: '1 + 3 = 4 and 4 − 5 = −1, so the new point is (4, −1).',
      },
      {
        prompt:
          'A point at (−2, 3) is translated 5 units right and 1 unit down. What are its new coordinates? Enter as (x, y).',
        answers: ['(3, 2)', '3, 2', '3,2'],
        hint: 'Add 5 to x, subtract 1 from y.',
        why: '−2 + 5 = 3 and 3 − 1 = 2, so the new point is (3, 2).',
      },
    ],
  },
  {
    id: 'check-2',
    title: 'Question 2 of 3',
    prompt:
      'Point A is at (−1, 4). It is translated 3 units right and 5 units down to its image A′. What are the coordinates of A′? Enter as (x, y).',
    answers: ['(2, -1)', '2, -1', '2,-1'],
    hint: 'Add 3 to x (right) and subtract 5 from y (down): (−1 + 3, 4 − 5).',
    why: 'Right adds 3 to x: −1 + 3 = 2. Down subtracts 5 from y: 4 − 5 = −1. So A′ is (2, −1).',
    variants: [
      {
        prompt: 'B is at (0, 2). It is translated 4 left and 1 up to B′. What are the coordinates of B′?',
        answers: ['(-4, 3)', '-4, 3', '-4,3'],
        hint: 'Subtract 4 from x (left) and add 1 to y (up).',
        why: '0 − 4 = −4 and 2 + 1 = 3, so B′ is (−4, 3).',
      },
      {
        prompt: 'C is at (3, −2). It is translated 1 left and 3 down to C′. What are the coordinates of C′?',
        answers: ['(2, -5)', '2, -5', '2,-5'],
        hint: 'Subtract 1 from x and subtract 3 from y.',
        why: '3 − 1 = 2 and −2 − 3 = −5, so C′ is (2, −5).',
      },
    ],
  },
  {
    id: 'check-3',
    title: 'Question 3 of 3',
    prompt:
      'A point moves from B (2, 1) to B′ (1, 5). How far was it translated? Enter as (right, up) — use negatives for left/down: (Δx, Δy).',
    answers: ['(-1, 4)', '-1, 4', '-1,4'],
    hint: 'Δx = new x − old x. Δy = new y − old y.',
    why: 'Δx = 1 − 2 = −1 (one unit left). Δy = 5 − 1 = 4 (four units up). So the translation is 1 left and 4 up: (−1, 4).',
    variants: [
      {
        prompt: 'A point moves from (2, 1) to (5, 6). How far was it translated? (Δx, Δy)?',
        answers: ['(3, 5)', '3, 5', '3,5'],
        hint: 'Subtract the old coordinates from the new ones.',
        why: 'Δx = 5 − 2 = 3 and Δy = 6 − 1 = 5, so the translation is (3, 5).',
      },
      {
        prompt: 'A point moves from (−1, 2) to (3, 0). How far was it translated? (Δx, Δy)?',
        answers: ['(4, -2)', '4, -2', '4,-2'],
        hint: 'Δx = new x − old x; Δy = new y − old y, even when answers are negative.',
        why: 'Δx = 3 − (−1) = 4 and Δy = 0 − 2 = −2, so the translation is (4, −2).',
      },
    ],
  },
]

export const translationsInteractiveCheck: TranslationCheckQuestion[] = [
  {
    id: 'icheck-1',
    title: 'Question 1 of 3',
    prompt:
      'Slide the point onto the dashed target. Build the translation (right, up) from the number boxes.',
    shape: [[-1, 2]],
    targetDx: 4,
    targetDy: 0,
    axis: 'both',
    why: 'Each point needs to move 4 steps right and 0 steps up, so the translation is (4, 0).',
  },
  {
    id: 'icheck-2',
    title: 'Question 2 of 3',
    prompt: 'Slide the segment onto the dashed target. Enter the translation (right, up).',
    shape: [
      [2, 2],
      [5, 2],
    ],
    targetDx: 1,
    targetDy: 2,
    axis: 'both',
    why: 'Every point slides 1 right and 2 up — for example (2, 2) → (3, 4). The translation is (1, 2).',
  },
  {
    id: 'icheck-3',
    title: 'Question 3 of 3',
    prompt: 'Slide the triangle onto the dashed target. Enter the translation (right, up).',
    shape: [
      [0, 1],
      [2, 1],
      [1, 3],
    ],
    targetDx: -3,
    targetDy: -1,
    axis: 'both',
    why: 'Every corner moves 3 left and 1 down — for example (0, 1) → (−3, 0). The translation is (−3, −1).',
  },
]

export const translationsPracticeSteps: LessonStep[] = [
  {
    id: 'practice-move-1',
    type: 'move-point',
    title: 'Practice: move the point',
    prompt: 'Drag the point 2 steps right and 3 steps up to draw its image.',
    start: [-1, 1],
    target: [1, 4],
    insight: 'Across changed the first coordinate, up changed the second — the two never interfere.',
    why: '2 right: −1 + 2 = 1. 3 up: 1 + 3 = 4. The point lands at (1, 4).',
    hint: 'Count 2 grid lines to the right, then 3 up.',
  },
  {
    id: 'practice-drag-seg-1',
    type: 'drag-shape',
    title: 'Practice: slide the segment',
    prompt: 'Grab the segment and drag the whole thing onto the dashed outline.',
    shape: [
      [-2, 2],
      [1, 2],
    ],
    targetDx: 2,
    targetDy: -3,
    showTarget: true,
    insight: 'The segment kept its exact length and direction — only its position changed.',
    why: 'Every point moves 2 right and 3 down, so the translation is (2, −3). For example (−2, 2) → (0, −1).',
    hint: 'Grab the middle of the segment and slide it until it covers the dashed outline.',
  },
  {
    id: 'practice-drag-shape-1',
    type: 'drag-shape',
    title: 'Practice: draw the image',
    prompt: 'Translate the square 4 left and 1 down. Drag it to where its image belongs.',
    shape: [
      [2, 1],
      [4, 1],
      [4, 3],
      [2, 3],
    ],
    targetDx: -4,
    targetDy: -1,
    showTarget: false,
    insight: 'All four corners followed the same slide, so the square stays the same size and shape.',
    why: 'Every corner moves 4 left and 1 down. For example (2, 1) → (−2, 0).',
    hint: 'Follow the bottom-left corner: (2, 1) should land at (−2, 0).',
  },
  {
    id: 'practice-translate-by-1',
    type: 'translate-by',
    title: 'Practice: translate by the numbers',
    prompt:
      'Translate the triangle by (2, −1). Drag the number boxes and watch each number slide it.',
    shape: [
      [0, 1],
      [2, 1],
      [1, 3],
    ],
    targetDx: 2,
    targetDy: -1,
    axis: 'both',
    why: 'The first number, 2, slides it 2 right; the second, −1, slides it 1 down: (0, 1) → (2, 0).',
    hint: 'Set the first box to 2 (right) and the second box to −1 (down).',
  },
]

export const translationsLesson: Lesson = {
  id: 'translations-101',
  title: 'Translations: How Things Slide',
  description:
    'Slide points, segments, and shapes by hand, learn to name the move and its image, then capture any slide with two numbers — all on an interactive grid.',
  subject: 'Coordinate Geometry',
  order: 1,
  region: 'Graph City',
  icon: '🏙️',
  estimatedMinutes: 10,
  lessonCheck: translationsLessonCheck,
  interactiveCheck: translationsInteractiveCheck,
  practiceSteps: translationsPracticeSteps,
  steps: [
    // ── Part 1: Moving a point ───────────────────────────────────────────────
    {
      id: 'concept-point',
      type: 'concept',
      title: 'Moving a point',
      body:
        'A translation just slides something to a new place — it never resizes it or turns it. Watch the shape below slide along the same path over and over. In a moment you’ll grab a point and slide it yourself.',
      visual: 'translation',
    },
    {
      id: 'move-point-1',
      type: 'move-point',
      title: 'Slide the point',
      prompt: 'Grab the blue point and drag it 4 steps right and 3 steps up.',
      start: [-3, -1],
      target: [1, 2],
      insight: 'Nice — you translated the point! It slid to a new spot without changing at all.',
      why: 'Moving 4 right and 3 up takes (−3, −1) to (1, 2).',
      hint: 'Drag the dot 4 grid lines right, then 3 grid lines up.',
    },

    // ── Part 2: Moving a segment ─────────────────────────────────────────────
    {
      id: 'concept-segment',
      type: 'concept',
      title: 'Moving a segment',
      body:
        'A segment slides the same way a point does — grab it anywhere and the whole thing moves together. Watch how its length and its direction never change as it slides.',
      visual: 'translation',
    },
    {
      id: 'drag-seg-1',
      type: 'drag-shape',
      title: 'Slide the segment',
      prompt:
        'Grab the segment from the middle and drag the whole thing onto the dashed outline.',
      shape: [
        [-1, 2],
        [2, 2],
      ],
      targetDx: -2,
      targetDy: -3,
      showTarget: true,
      insight:
        'Notice the segment’s length and direction stayed exactly the same — only its position changed.',
      why: 'Every point slides 2 left and 3 down, so for example (−1, 2) → (−3, −1).',
      hint: 'Drag from the middle of the segment, not the end dots, and cover the dashed outline.',
    },

    // ── Part 3: Naming the move (terminology) ────────────────────────────────
    {
      id: 'concept-terminology',
      type: 'concept',
      title: 'Naming the move and its image',
      body:
        'Here B was slid 2 units right and 3 units up, and it lands on a brand-new point. We name that new point with the same letter plus a little mark: B becomes B′, said “B prime”. The starting figure is the pre-image, and the slid result is the image.',
      graph: {
        range: 6,
        points: [
          { x: -2, y: -1, color: '#38bdf8', label: 'B' },
          { x: 0, y: 2, color: '#f472b6', label: "B'" },
        ],
      },
    },

    // ── Part 4: Draw the translation yourself ────────────────────────────────
    {
      id: 'draw-point-1',
      type: 'move-point',
      title: 'Draw the image of A',
      prompt:
        'Translate point A by 3 right and 2 up, then drag it to where its image A′ belongs. There’s no outline this time — you decide where it lands.',
      start: [-2, -2],
      target: [1, 0],
      insight: 'You found A′ on your own: right changed x, up changed y.',
      why: '3 right: −2 + 3 = 1. 2 up: −2 + 2 = 0. So A′ is (1, 0).',
      hint: 'From A at (−2, −2), count 3 right and 2 up.',
    },
    {
      id: 'draw-seg-1',
      type: 'drag-shape',
      title: 'Draw the image of the segment',
      prompt:
        'Translate the segment 4 right and 1 down, then drag it to draw its image. No outline — figure out where it goes.',
      shape: [
        [-3, 1],
        [-1, 1],
      ],
      targetDx: 4,
      targetDy: -1,
      showTarget: false,
      insight: 'Every point followed the same slide, so the image is the same size and direction.',
      why: 'Each end moves 4 right and 1 down: (−3, 1) → (1, 0) and (−1, 1) → (3, 0).',
      hint: 'Follow the left end: (−3, 1) should land at (1, 0).',
    },

    // ── Part 5: Translating shapes ───────────────────────────────────────────
    {
      id: 'concept-shapes',
      type: 'concept',
      title: 'Translating whole shapes',
      body:
        'Whole shapes slide too — every corner follows the exact same arrow at once. Watch the triangle slide, then you’ll move shapes yourself: first by dragging, then by setting the numbers.',
      visual: 'translation',
    },
    {
      id: 'drag-shape-1',
      type: 'drag-shape',
      title: 'Slide the triangle',
      prompt: 'Grab the triangle and drag the whole shape onto the dashed outline.',
      shape: [
        [-2, 0],
        [0, 0],
        [-1, 2],
      ],
      targetDx: 3,
      targetDy: -1,
      showTarget: true,
      insight: 'Every corner moved by the same slide (3 right, 1 down) — that’s what keeps the shape identical.',
      why: 'The outline sits 3 right and 1 down, so for example (−2, 0) → (1, −1).',
      hint: 'Drag from inside the triangle until it covers the dashed outline.',
    },
    {
      id: 'translate-by-1',
      type: 'translate-by',
      title: 'Translate by the numbers',
      prompt:
        'Translate the triangle by (−3, −1). Drag the number boxes to set how far it moves, and watch each number slide it.',
      shape: [
        [1, 1],
        [3, 1],
        [2, 3],
      ],
      targetDx: -3,
      targetDy: -1,
      axis: 'both',
      insight:
        'The first number slides it left/right; the second slides it up/down. Together they are the whole translation.',
      why:
        'The first box, −3, slides it 3 left; the second box, −1, slides it 1 down. For example (1, 1) → (−2, 0).',
      hint: 'Set the first box to −3 (left) and the second box to −1 (down).',
    },
    {
      id: 'complete',
      type: 'complete',
      title: 'Lesson complete!',
      message:
        'You slid points, segments, and whole shapes by hand, learned to name an image (like B′), and translated a shape by setting its two numbers.',
      discovery:
        'A translation slides every point by the same amount, so size, shape, and direction stay fixed — only position changes. We name the slid figure the image (B → B′), and we can capture any slide with two numbers: how far right, and how far up.',
    },
  ],
}
