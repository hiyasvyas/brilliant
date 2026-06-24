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
      'The parabola y = x² is translated to y = (x − 3)² + 2. Its vertex starts at (0, 0). Where does the vertex land? Enter as (x, y).',
    answers: ['(3, 2)', '3, 2', '3,2'],
    hint: 'x − 3 slides it 3 right; + 2 slides it 2 up. Apply that to (0, 0).',
    why: 'Sliding (0, 0) by 3 right and 2 up gives (3, 2) — the vertex of y = (x − 3)² + 2.',
    variants: [
      {
        prompt:
          'y = x² is translated to y = (x − 1)² + 5. Where does the vertex land? Enter as (x, y).',
        answers: ['(1, 5)', '1, 5', '1,5'],
        hint: 'Slide (0, 0) by 1 right and 5 up.',
        why: '(0, 0) slid 1 right and 5 up lands at (1, 5).',
      },
      {
        prompt:
          'y = x² is translated to y = (x + 2)² − 4. Where does the vertex land? Enter as (x, y).',
        answers: ['(-2, -4)', '-2, -4', '-2,-4'],
        hint: 'x + 2 means 2 left; − 4 means 4 down. Apply that to (0, 0).',
        why: '(0, 0) slid 2 left and 4 down lands at (−2, −4).',
      },
    ],
  },
  {
    id: 'check-3',
    title: 'Question 3 of 3',
    prompt:
      'A vertex of a triangle moves from (1, 1) to (4, 3). What is the translation vector (Δx, Δy)? Enter as (Δx, Δy).',
    answers: ['(3, 2)', '3, 2', '3,2'],
    hint: 'Δx = new x − old x. Δy = new y − old y.',
    why: 'Δx = 4 − 1 = 3. Δy = 3 − 1 = 2. The translation vector is (3, 2).',
    variants: [
      {
        prompt:
          'A vertex moves from (2, 1) to (5, 6). What is the translation vector (Δx, Δy)?',
        answers: ['(3, 5)', '3, 5', '3,5'],
        hint: 'Subtract the old coordinates from the new ones.',
        why: 'Δx = 5 − 2 = 3 and Δy = 6 − 1 = 5, so the vector is (3, 5).',
      },
      {
        prompt:
          'A vertex moves from (−1, 2) to (3, 0). What is the translation vector (Δx, Δy)?',
        answers: ['(4, -2)', '4, -2', '4,-2'],
        hint: 'Δx = new x − old x; Δy = new y − old y, even when answers are negative.',
        why: 'Δx = 3 − (−1) = 4 and Δy = 0 − 2 = −2, so the vector is (4, −2).',
      },
    ],
  },
]

export const translationsInteractiveCheck: TranslationCheckQuestion[] = [
  {
    id: 'icheck-1',
    title: 'Question 1 of 3',
    prompt:
      'Slide the point onto the dashed target. Build the translation (Δx, Δy) from the number palette.',
    shape: [[-1, 2]],
    targetDx: 4,
    targetDy: 0,
    axis: 'both',
    why: 'Each point needs to move 4 steps right and 0 steps up, so the translation is (4, 0).',
  },
  {
    id: 'icheck-2',
    title: 'Question 2 of 3',
    prompt: 'Slide the segment onto the dashed target. Enter the translation (Δx, Δy).',
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
    prompt: 'Slide the triangle onto the dashed target. Enter the translation (Δx, Δy).',
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
    title: 'Practice: Move the point',
    prompt: 'Start at (−1, 1). Drag the point 2 steps right and 3 steps up.',
    start: [-1, 1],
    target: [1, 4],
    why: '2 right: −1 + 2 = 1. 3 up: 1 + 3 = 4. The point lands at (1, 4).',
    hint: 'Count 2 grid lines to the right, then 3 up.',
  },
  {
    id: 'practice-vertex-1',
    type: 'find-vertex',
    title: 'Practice: Translate the vertex',
    prompt: 'y = (x + 1)² − 2 slides y = x² left and down. Drag the dot to where the vertex lands.',
    h: -1,
    k: -2,
    a: 1,
    xMin: -5,
    xMax: 3,
    why: 'x + 1 means a slide of 1 left (h = −1) and −2 means 2 down (k = −2), so the vertex moves from (0, 0) to (−1, −2).',
    hint: 'The vertex starts at the origin, then slides 1 left and 2 down.',
  },
  {
    id: 'practice-translate-v-1',
    type: 'translate-by',
    title: 'Practice: Slide it up',
    prompt:
      'Pick a number so the segment slides up onto the dashed outline. Press Play to replay the slide.',
    shape: [
      [-1, -2],
      [2, -2],
    ],
    targetDx: 0,
    targetDy: 3,
    axis: 'y',
    why:
      'The outline is 3 units above the segment, so every point moves by +3 in y: the translation is (0, 3).',
    hint: 'The segment sits at y = −2 and the outline is at y = 1. How far up is that?',
  },
  {
    id: 'practice-translate-xy-1',
    type: 'translate-by',
    title: 'Practice: Slide the triangle',
    prompt:
      'Fill in both numbers so the triangle matches the dashed outline. Each pick replays the slide.',
    shape: [
      [0, 0],
      [2, 0],
      [1, 2],
    ],
    targetDx: -3,
    targetDy: -1,
    axis: 'both',
    why:
      'Every corner moves 3 left and 1 down, so the translation is (−3, −1). For example (0, 0) → (−3, −1).',
    hint: 'Follow the bottom-left corner: (0, 0) should reach (−3, −1).',
  },
  {
    id: 'practice-translation-1',
    type: 'translation-input',
    title: 'Practice: Match the translation',
    prompt: 'Enter the translation (Δx, Δy) so the triangle matches the dashed outline.',
    points: [
      [0, 1],
      [2, 1],
      [1, 3],
    ],
    goalPoints: [
      [2, 0],
      [4, 0],
      [3, 2],
    ],
    why: 'Each point moved 2 right and 1 down: the translation vector is (2, −1).',
    hint: 'Compare the leftmost point: (0, 1) became (2, 0).',
  },
]

export const translationsLesson: Lesson = {
  id: 'translations-101',
  title: 'Translations on the Coordinate Plane',
  description:
    'Slide points, shapes, and graphs around the grid — same size, same orientation, new position.',
  subject: 'Coordinate Geometry',
  order: 1,
  region: 'Graph City',
  icon: '🏙️',
  estimatedMinutes: 8,
  lessonCheck: translationsLessonCheck,
  interactiveCheck: translationsInteractiveCheck,
  practiceSteps: translationsPracticeSteps,
  steps: [
    {
      id: 'conf-1',
      type: 'confidence',
      title: 'Quick check',
      question: 'Have you worked with translations on a graph before?',
    },
    {
      id: 'concept-translation',
      type: 'concept',
      title: 'What is a translation?',
      body:
        'A translation slides every point the same direction and distance. The shape keeps its size and orientation — it just moves. On a graph, moving 3 units right and 1 unit up adds (3, 1) to every coordinate.',
      visual: 'translation',
    },
    {
      id: 'translate-h-1',
      type: 'translate-by',
      title: 'Slide it left',
      prompt:
        'Pick a number so the blue segment slides onto the dashed outline. Watch it move, and press Play to replay.',
      shape: [
        [1, -1],
        [3, -1],
      ],
      targetDx: -4,
      targetDy: 0,
      axis: 'x',
      why:
        'The outline is 4 units to the left of the segment, so every point moves by −4 in x: the translation is (−4, 0).',
      hint: 'The left end starts at x = 1 but the outline’s left end is at x = −3. How far left is that?',
    },
    {
      id: 'move-1',
      type: 'move-point',
      title: 'Move the point',
      prompt:
        'The blue point is at (1, 2). Drag it 3 steps to the right and 1 step up. Where does it land?',
      start: [1, 2],
      target: [4, 3],
      why:
        'Moving 3 right adds 3 to x: 1 + 3 = 4. Moving 1 up adds 1 to y: 2 + 1 = 3. The new point is (4, 3).',
      hint: 'Try counting grid lines: 3 to the right, then 1 up from the starting point.',
    },
    {
      id: 'conf-2',
      type: 'confidence',
      title: 'Checkpoint',
      question: 'Do you feel confident moving a single point on the grid?',
    },
    {
      id: 'concept-vertex',
      type: 'concept',
      title: 'Translating a parabola',
      body:
        'Translations slide curves too, not just points. The basic parabola y = x² has its vertex at the origin (0, 0). Writing it as y = (x − h)² + k slides that whole curve h units right and k units up, so the vertex lands at (h, k). Finding the vertex is just reading off the translation.',
      visual: 'vertex',
    },
    {
      id: 'vertex-1',
      type: 'find-vertex',
      title: 'Find the translated vertex',
      prompt:
        'y = (x − 2)² + 1 is the parabola y = x² slid right and up. Drag the orange dot to where the vertex lands.',
      h: 2,
      k: 1,
      a: 1,
      xMin: -2,
      xMax: 6,
      why:
        'Sliding y = x² by 2 right and 1 up moves the vertex from (0, 0) to (2, 1). In y = (x − h)² + k that is just (h, k).',
      hint: 'The origin vertex of y = x² slides the same way the curve does: 2 right, then 1 up.',
    },
    {
      id: 'concept-translation-2',
      type: 'concept',
      title: 'Translating a whole shape',
      body:
        'When you translate a shape, every corner moves by the same (Δx, Δy). If point A moves from (0, 0) to (3, 1), the translation vector is (3, 1).',
      visual: 'translation',
    },
    {
      id: 'translate-xy-1',
      type: 'translate-by',
      title: 'Slide the triangle',
      prompt:
        'Fill in both numbers so the triangle lands on the dashed outline. Each pick replays the slide — use Play to watch again.',
      shape: [
        [-2, 0],
        [0, 0],
        [-1, 2],
      ],
      targetDx: 3,
      targetDy: -1,
      axis: 'both',
      why:
        'The outline sits 3 right and 1 down from the triangle, so every corner moves by (3, −1). For example (−2, 0) → (1, −1).',
      hint: 'Track one corner: (−2, 0) needs to reach (1, −1). What is added to x, and to y?',
    },
    {
      id: 'translation-input-1',
      type: 'translation-input',
      title: 'Match the translation',
      prompt:
        'The triangle should land on the dashed outline. Enter the translation (Δx, Δy) and watch the shape move. Adjust until it matches, then check.',
      points: [
        [0, 0],
        [2, 0],
        [1, 2],
      ],
      goalPoints: [
        [3, 1],
        [5, 1],
        [4, 3],
      ],
      why:
        'Each point moved 3 right and 1 up: (0, 0) → (3, 1), (2, 0) → (5, 1), (1, 2) → (4, 3). The translation vector is (3, 1).',
      hint: 'Compare the bottom-left corner: it went from (0, 0) to (3, 1). What changed in x and y?',
    },
    {
      id: 'complete',
      type: 'complete',
      title: 'Lesson complete!',
      message: 'You slid a point, a parabola, and a whole triangle — every one by adding the same (Δx, Δy).',
      discovery:
        'A translation adds the same (Δx, Δy) to every point of a figure, so the whole thing slides without changing size or orientation.',
    },
  ],
}
