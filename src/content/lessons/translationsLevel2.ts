import type { Lesson, LessonStep, LessonCheckQuestion } from '../../types/lesson'

const translationsLevel2Check: LessonCheckQuestion[] = [
  {
    id: 'l2-check-1',
    title: 'Question 1 of 3',
    prompt:
      'A point at (−3, 4) is translated 6 units right and 5 units down. What are its new coordinates? Enter as (x, y).',
    answers: ['(3, -1)', '3, -1', '3,-1'],
    hint: 'Right adds to x, down subtracts from y: x becomes −3 + 6, y becomes 4 − 5.',
    why: 'Moving 6 right: −3 + 6 = 3. Moving 5 down: 4 − 5 = −1. The new point is (3, −1).',
    variants: [
      {
        prompt:
          'A point at (−4, −2) is translated 7 units right and 1 unit up. What are its new coordinates? Enter as (x, y).',
        answers: ['(3, -1)', '3, -1', '3,-1'],
        hint: 'Add 7 to x, add 1 to y.',
        why: '−4 + 7 = 3 and −2 + 1 = −1, so the new point is (3, −1).',
      },
      {
        prompt:
          'A point at (5, 5) is translated 8 units left and 4 units down. What are its new coordinates? Enter as (x, y).',
        answers: ['(-3, 1)', '-3, 1', '-3,1'],
        hint: 'Subtract 8 from x, subtract 4 from y.',
        why: '5 − 8 = −3 and 5 − 4 = 1, so the new point is (−3, 1).',
      },
    ],
  },
  {
    id: 'l2-check-2',
    title: 'Question 2 of 3',
    prompt:
      'A whole triangle is translated by (−5, −4). One corner is at (4, 3). Where does that corner land? Enter as (x, y).',
    answers: ['(-1, -1)', '-1, -1', '-1,-1'],
    hint: 'Every corner follows the same slide: add −5 to x and −4 to y.',
    why: 'Apply (Δx, Δy) = (−5, −4) to the corner: 4 − 5 = −1 and 3 − 4 = −1, so it lands at (−1, −1).',
    variants: [
      {
        prompt:
          'A square is translated by (6, −2). One corner is at (−5, 4). Where does that corner land? Enter as (x, y).',
        answers: ['(1, 2)', '1, 2', '1,2'],
        hint: 'Add 6 to x and −2 to y.',
        why: '−5 + 6 = 1 and 4 − 2 = 2, so the corner lands at (1, 2).',
      },
      {
        prompt:
          'A polygon is translated by (−3, 5). One corner is at (2, −4). Where does that corner land? Enter as (x, y).',
        answers: ['(-1, 1)', '-1, 1', '-1,1'],
        hint: 'Add −3 to x and 5 to y.',
        why: '2 − 3 = −1 and −4 + 5 = 1, so the corner lands at (−1, 1).',
      },
    ],
  },
  {
    id: 'l2-check-3',
    title: 'Question 3 of 3',
    prompt:
      'A point moves from P (−4, 5) to P′ (3, −2). How far was it translated? Enter as (right, up) — use negatives for left/down: (Δx, Δy).',
    answers: ['(7, -7)', '7, -7', '7,-7'],
    hint: 'Δx = new x − old x. Δy = new y − old y.',
    why: 'Δx = 3 − (−4) = 7 (seven units right). Δy = −2 − 5 = −7 (seven units down). So the translation is (7, −7).',
    variants: [
      {
        prompt: 'A point moves from (5, −3) to (−1, 4). How far was it translated? (Δx, Δy)?',
        answers: ['(-6, 7)', '-6, 7', '-6,7'],
        hint: 'Subtract the old coordinates from the new ones.',
        why: 'Δx = −1 − 5 = −6 and Δy = 4 − (−3) = 7, so the translation is (−6, 7).',
      },
      {
        prompt: 'A point moves from (−2, −2) to (4, 5). How far was it translated? (Δx, Δy)?',
        answers: ['(6, 7)', '6, 7', '6,7'],
        hint: 'Δx = new x − old x; Δy = new y − old y, even when both grow.',
        why: 'Δx = 4 − (−2) = 6 and Δy = 5 − (−2) = 7, so the translation is (6, 7).',
      },
    ],
  },
]

const translationsLevel2Practice: LessonStep[] = [
  {
    id: 'l2-practice-move-1',
    type: 'move-point',
    title: 'Practice: a big combined slide',
    prompt: 'Drag the point 6 steps right and 5 steps down to draw its image.',
    start: [-3, 3],
    target: [3, -2],
    insight: 'Even on a long slide, right only changes x and down only changes y.',
    why: '6 right: −3 + 6 = 3. 5 down: 3 − 5 = −2. The point lands at (3, −2).',
    hint: 'Count 6 grid lines to the right, then 5 down.',
  },
  {
    id: 'l2-practice-drag-poly-1',
    type: 'drag-shape',
    title: 'Practice: draw the image of the quadrilateral',
    prompt: 'Translate the quadrilateral 5 left and 4 up, then drag it to where its image belongs. No outline this time.',
    shape: [
      [1, -2],
      [3, -2],
      [3, 0],
      [1, 0],
    ],
    targetDx: -5,
    targetDy: 4,
    showTarget: false,
    insight: 'All four corners follow the same arrow, so the figure keeps its exact size and shape.',
    why: 'Every corner moves 5 left and 4 up. For example (1, −2) → (−4, 2) and (3, 0) → (−2, 4).',
    hint: 'Follow the bottom-left corner: (1, −2) should land at (−4, 2).',
  },
  {
    id: 'l2-practice-translate-by-1',
    type: 'translate-by',
    title: 'Practice: translate by the numbers',
    prompt: 'Translate the triangle by (−6, 3). Drag the number boxes and watch each number slide it.',
    shape: [
      [3, -3],
      [5, -3],
      [4, -1],
    ],
    targetDx: -6,
    targetDy: 3,
    axis: 'both',
    min: -6,
    max: 6,
    why: 'The first number, −6, slides it 6 left; the second, 3, slides it 3 up: (3, −3) → (−3, 0).',
    hint: 'Set the first box to −6 (left) and the second box to 3 (up).',
  },
]

export const translationsLevel2Lesson: Lesson = {
  id: 'translations-201',
  title: 'Translations, Level 2: New Challenges',
  description:
    'More challenging translation problems: bigger slides, combined left-and-down directions, and translating whole shapes onto and off the grid.',
  subject: 'Coordinate Geometry',
  order: 6,
  region: 'Graph City',
  icon: '🏙️',
  estimatedMinutes: 10,
  lessonCheck: translationsLevel2Check,
  practiceSteps: translationsLevel2Practice,
  steps: [
    // ── Recap ────────────────────────────────────────────────────────────────
    {
      id: 'l2-concept-recap',
      type: 'concept',
      title: 'The slide rule, one more time',
      body:
        'Every translation follows one rule: each point (x, y) slides to (x + Δx, y + Δy). The same two numbers move every point, so the figure keeps its size, shape, and direction. The starting figure is the pre-image and the slid copy is the image. In this level the slides get bigger and combine directions — but the rule never changes.',
      graph: {
        range: 6,
        points: [
          { x: -4, y: -2, color: '#38bdf8', label: 'P' },
          { x: 2, y: 3, color: '#f472b6', label: "P'" },
        ],
      },
    },
    {
      id: 'l2-concept-naming',
      type: 'concept',
      title: 'Naming the image',
      body:
        'When a point P slides to a new spot, we name the result P′, said “P prime”. A triangle ABC slides to A′B′C′. No matter how far it travels, the image is just the pre-image moved by (Δx, Δy) — same figure, new address.',
      visual: 'translation',
    },

    // ── Problem 1: big combined slide (with prediction) ──────────────────────
    {
      id: 'l2-move-point-1',
      type: 'move-point',
      title: 'A big slide, two directions',
      prompt: 'Grab the blue point and drag it 7 steps right and 6 steps down.',
      prediction: {
        question: 'Before you move it: sliding 7 right and 6 down, what happens to the coordinates?',
        options: [
          'x increases and y increases',
          'x increases and y decreases',
          'x decreases and y decreases',
          'Only y changes',
        ],
        correctIndex: 1,
        why: 'Right is a positive x-change, so x increases. Down is a negative y-change, so y decreases. Both move, in opposite directions.',
      },
      start: [-4, 4],
      target: [3, -2],
      insight: 'A long, diagonal slide is still just Δx on x and Δy on y, handled separately.',
      why: '7 right: −4 + 7 = 3. 6 down: 4 − 6 = −2. The point lands at (3, −2).',
      hint: 'From (−4, 4), count 7 grid lines right, then 6 down.',
    },

    // ── Problem 2: bigger translate-by on a triangle ─────────────────────────
    {
      id: 'l2-translate-by-1',
      type: 'translate-by',
      title: 'Translate the triangle far left',
      prompt:
        'Translate the triangle by (−6, 2). Drag the number boxes to set how far it moves, and watch each number slide it.',
      shape: [
        [2, 0],
        [4, 0],
        [3, 2],
      ],
      targetDx: -6,
      targetDy: 2,
      axis: 'both',
      min: -6,
      max: 6,
      insight: 'Even a 6-unit slide is fine as long as every image point stays on the grid.',
      why: 'The first box, −6, slides it 6 left; the second box, 2, slides it 2 up. For example (4, 0) → (−2, 2) and (3, 2) → (−3, 4).',
      hint: 'Set the first box to −6 (left) and the second box to 2 (up).',
    },

    // ── Problem 3: drag a square, combined right + up, match outline ──────────
    {
      id: 'l2-drag-square-1',
      type: 'drag-shape',
      title: 'Slide the square onto the outline',
      prompt: 'Grab the square and drag the whole shape onto the dashed outline.',
      shape: [
        [-5, -4],
        [-3, -4],
        [-3, -2],
        [-5, -2],
      ],
      targetDx: 7,
      targetDy: 6,
      showTarget: true,
      insight: 'All four corners traveled the same arrow (7 right, 6 up), so the square is unchanged — only relocated.',
      why: 'The outline sits 7 right and 6 up, so for example (−5, −4) → (2, 2) and (−3, −2) → (4, 4).',
      hint: 'Drag from inside the square until it covers the dashed outline in the upper area of the grid.',
    },

    // ── Problem 4: translate-by on a segment, combined left + down ────────────
    {
      id: 'l2-translate-by-2',
      type: 'translate-by',
      title: 'Slide the segment left and down',
      prompt:
        'Translate the segment by (−4, −5). Drag the number boxes and watch each number slide it.',
      shape: [
        [2, 5],
        [5, 5],
      ],
      targetDx: -4,
      targetDy: -5,
      axis: 'both',
      min: -6,
      max: 6,
      why: 'The first box, −4, slides it 4 left; the second box, −5, slides it 5 down. So (2, 5) → (−2, 0) and (5, 5) → (1, 0).',
      hint: 'Set the first box to −4 (left) and the second box to −5 (down).',
    },

    // ── Problem 5: draw the image with no outline (showTarget: false) ─────────
    {
      id: 'l2-drag-triangle-noimage',
      type: 'drag-shape',
      title: 'Draw the image — no outline',
      prompt:
        'Translate the triangle 5 right and 5 down, then drag it to draw its image. There is no outline — you decide exactly where it lands.',
      shape: [
        [-4, 2],
        [-2, 2],
        [-3, 4],
      ],
      targetDx: 5,
      targetDy: -5,
      showTarget: false,
      insight: 'With no outline to copy, you used the rule itself: every corner moves by the same (Δx, Δy).',
      why: 'Each corner moves 5 right and 5 down: (−4, 2) → (1, −3), (−2, 2) → (3, −3), and (−3, 4) → (2, −1).',
      hint: 'Follow the top corner: (−3, 4) should land at (2, −1).',
    },

    // ── Problem 6: number-input on a combined slide ──────────────────────────
    {
      id: 'l2-number-input-1',
      type: 'number-input',
      title: 'Where does the corner land?',
      prompt:
        'A pentagon is translated by (−2, −6). One corner is at (5, 6). Where does that corner land? Enter as (x, y).',
      answers: ['(3, 0)', '3, 0', '3,0'],
      why: 'Apply (Δx, Δy) = (−2, −6): 5 − 2 = 3 and 6 − 6 = 0, so the corner lands at (3, 0).',
      hint: 'Add −2 to the x-coordinate and −6 to the y-coordinate.',
    },

    {
      id: 'l2-complete',
      type: 'complete',
      title: 'Level 2 complete!',
      message:
        'You handled bigger slides, combined left-and-down moves, dragged a whole square and triangle, and even drew an image with no outline to copy.',
      discovery:
        'No matter how large the slide or which directions it combines, a translation always applies the same (Δx, Δy) to every point — so the image is the pre-image moved, never resized or turned.',
    },
  ],
}
