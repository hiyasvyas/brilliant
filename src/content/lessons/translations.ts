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
    insight: 'Across changed the first coordinate, up changed the second — the two never interfere.',
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
    insight: 'A “+1” inside the parentheses shifts left, because the curve has to reach back to x = −1 to hit its old low point.',
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
  title: 'Translations: How Things Slide',
  description:
    'Start from a hiker on a trail and build all the way up to sliding whole graphs — capturing any move with a single two-number arrow.',
  subject: 'Coordinate Geometry',
  order: 1,
  region: 'Graph City',
  icon: '🏙️',
  estimatedMinutes: 14,
  lessonCheck: translationsLessonCheck,
  interactiveCheck: translationsInteractiveCheck,
  practiceSteps: translationsPracticeSteps,
  steps: [
    {
      id: 'conf-1',
      type: 'confidence',
      title: 'Quick check',
      question:
        'A chess piece sliding to a new square, an app icon you drag — could you describe that move with numbers?',
    },
    {
      id: 'concept-hook',
      type: 'concept',
      title: 'Everything that slides',
      body:
        'Drag an app icon, push a chess piece, walk a game character across the screen — each one is a translation: the object moves to a new spot but keeps its exact size, shape, and direction. Your goal in this lesson: capture ANY slide with just two numbers, and predict exactly where things land.',
      visual: 'translation',
    },

    // ── Rung 1: build the intuition in 1D first ──────────────────────────────
    {
      id: 'nl-right',
      type: 'number-line',
      title: 'One direction first',
      prompt:
        'Forget the full grid for a second. Our hiker stands at 2 on a straight trail. Walk them to the marker at 6.',
      start: 2,
      target: 6,
      min: -8,
      max: 8,
      insight:
        'Four steps right took 2 → 6. On a number line, moving right always ADDS: 2 + 4 = 6.',
      why: 'Each step to the right is +1. Going from 2 up to 6 is 4 steps, and 2 + 4 = 6.',
      hint: 'Count the gaps between 2 and 6 — that is how many steps right you need.',
    },
    {
      id: 'mc-left',
      type: 'multiple-choice',
      title: 'Predict before you move',
      prompt:
        'The hiker is back at 3 and walks 5 steps to the LEFT. Don’t move anything yet — predict where they land.',
      options: ['−2', '8', '2', '−5'],
      correctIndex: 0,
      insight:
        'Left is just the opposite of right, so left SUBTRACTS: 3 − 5 = −2. A negative answer only means “past zero” — nothing scary.',
      why: 'Right adds, so left subtracts. Starting at 3 and taking 5 steps left: 3 − 5 = −2.',
      hint: 'If right means +5, what does the opposite direction do to the number?',
    },

    // ── Rung 2: step up to 2D — why a slide needs two numbers ────────────────
    {
      id: 'concept-two-numbers',
      type: 'concept',
      title: 'A grid has two directions',
      body:
        'A flat grid offers two ways to move: across (the x-direction) and up (the y-direction). So one slide on a grid needs TWO numbers — how far across, and how far up. Right and up count as positive; left and down count as negative.',
      visual: 'translation',
    },
    {
      id: 'move-1',
      type: 'move-point',
      title: 'Move the point',
      prompt:
        'The blue point is at (1, 2). Drag it 3 steps to the right and 1 step up. Where does it land?',
      start: [1, 2],
      target: [4, 3],
      insight:
        'Across changed only the first coordinate (1 → 4); up changed only the second (2 → 3). The two moves never interfere.',
      why:
        'Moving 3 right adds 3 to x: 1 + 3 = 4. Moving 1 up adds 1 to y: 2 + 1 = 3. The new point is (4, 3).',
      hint: 'Count grid lines: 3 to the right, then 1 up from the starting point.',
    },
    {
      id: 'mc-down',
      type: 'multiple-choice',
      title: 'Which way is negative?',
      prompt:
        'A treasure chest sits at (2, 5). You drag it 4 right and 2 DOWN. Predict its new coordinates.',
      options: ['(6, 3)', '(6, 7)', '(−2, 3)', '(2, 6)'],
      correctIndex: 0,
      insight:
        'Down subtracts from y (5 − 2 = 3); right adds to x (2 + 4 = 6). Up/right are +, down/left are −.',
      why:
        'Right adds to x: 2 + 4 = 6. Down subtracts from y: 5 − 2 = 3. The chest lands at (6, 3).',
      hint: 'Right is positive x; down is negative y. Apply each to its own coordinate.',
    },

    // ── Rung 3: name the move — the translation vector ───────────────────────
    {
      id: 'concept-vector',
      type: 'concept',
      title: 'One arrow for the whole move',
      body:
        'Instead of saying “right 4, down 2,” we bundle the slide into a single arrow: (4, −2). The first number is the across-shift, the second is the up-shift. This pair is the translation vector — the recipe that every single point follows.',
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
      insight:
        'The arrow is (−4, 0). That 0 is doing real work — it says “don’t move up or down at all.”',
      why:
        'The outline is 4 units to the left, so every point moves by −4 in x: the translation is (−4, 0).',
      hint: 'The left end starts at x = 1 but the outline’s left end is at x = −3. How far left is that?',
    },
    {
      id: 'translate-v-1',
      type: 'translate-by',
      title: 'Now slide it up',
      prompt:
        'Same idea, other direction. Pick a number so the segment rises onto the dashed outline.',
      shape: [
        [-1, -2],
        [2, -2],
      ],
      targetDx: 0,
      targetDy: 3,
      axis: 'y',
      insight:
        'A pure-up slide is the arrow (0, 3): the shape rises but never drifts sideways.',
      why:
        'The outline sits 3 units above the segment, so every point moves +3 in y: the translation is (0, 3).',
      hint: 'The segment is at y = −2 and the outline is at y = 1. How far up is that?',
    },
    {
      id: 'translate-xy-1',
      type: 'translate-by',
      title: 'Slide the whole triangle',
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
      insight:
        'Every corner followed the SAME arrow (3, −1). That’s the heart of a translation — one arrow moves the entire shape at once.',
      why:
        'The outline sits 3 right and 1 down, so every corner moves by (3, −1). For example (−2, 0) → (1, −1).',
      hint: 'Track one corner: (−2, 0) needs to reach (1, −1). What is added to x, and to y?',
    },

    // ── Rung 4: depth — what stays the same, and stacking slides ─────────────
    {
      id: 'concept-invariants',
      type: 'concept',
      title: 'What a slide does NOT change',
      body:
        'Here is the deep idea: a translation changes position and nothing else. Size, angles, orientation — all untouched. That is why it is called a rigid motion: imagine tracing the shape, sliding the paper, and it still fits perfectly on the copy.',
      visual: 'translation',
    },
    {
      id: 'mc-invariant',
      type: 'multiple-choice',
      title: 'Spot what changes',
      prompt: 'You translate a triangle by (5, −3). Which ONE of these actually changes?',
      options: ['Its position', 'Its side lengths', 'Its angles', 'Its shape'],
      correctIndex: 0,
      insight:
        'Only position. The slid triangle is congruent — an identical copy — to the original, just parked somewhere new.',
      why:
        'A translation moves every point by the same arrow, so distances and angles between points are preserved. Only where the shape sits changes.',
      hint: 'If every point moves by the exact same amount, can the gaps between points change?',
    },
    {
      id: 'translation-input-1',
      type: 'translation-input',
      title: 'Find the hidden arrow',
      prompt:
        'This time the slide is hidden — figure it out. Enter the (Δx, Δy) that lands the triangle on the dashed outline, then check.',
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
      insight:
        'To FIND a slide, subtract old from new: (0, 1) → (2, 0) gives (2 − 0, 0 − 1) = (2, −1). Finding the arrow is just “new − old.”',
      why:
        'Each point moved 2 right and 1 down: (0, 1) → (2, 0), so the translation vector is (2, −1).',
      hint: 'Pick one corner and compare: (0, 1) became (2, 0). What was added to x, and to y?',
    },
    {
      id: 'mc-compose',
      type: 'multiple-choice',
      title: 'Stack two slides',
      prompt:
        'You slide a point by (3, 1), then slide the result again by (−1, 2). What single arrow does both moves at once?',
      options: ['(2, 3)', '(4, 3)', '(3, 2)', '(−3, −2)'],
      correctIndex: 0,
      insight:
        'Stack slides by adding the arrows: (3 + (−1), 1 + 2) = (2, 3). Two translations in a row are always just one translation.',
      why:
        'Add the across-shifts (3 + (−1) = 2) and the up-shifts (1 + 2 = 3). The combined arrow is (2, 3).',
      hint: 'Add the first numbers together, then add the second numbers together.',
    },

    // ── Rung 5: the payoff — sliding a whole graph ───────────────────────────
    {
      id: 'concept-graph-intro',
      type: 'concept',
      title: 'A graph is just a lot of points',
      body:
        'Since a graph is really a huge set of points, it slides exactly like a shape. Take the U-shaped curve y = x² — it is called a parabola. The tip of the U, its lowest point, is the vertex, and for plain y = x² the vertex sits right at (0, 0).',
      visual: 'vertex',
    },
    {
      id: 'concept-graph-shift',
      type: 'concept',
      title: 'Reading the slide off the equation',
      body:
        'Writing the curve as y = (x − h)² + k slides the whole U: h is the across-shift, k is the up-shift. So the vertex moves from (0, 0) straight to (h, k). Finding the vertex becomes nothing more than reading the arrow.',
      visual: 'vertex',
    },
    {
      id: 'vertex-1',
      type: 'find-vertex',
      title: 'Find the translated vertex',
      prompt:
        'y = (x − 2)² + 1 is the parabola y = x² after a slide. Drag the orange dot to where the vertex lands.',
      h: 2,
      k: 1,
      a: 1,
      xMin: -2,
      xMax: 6,
      insight:
        'The vertex slid from (0, 0) to (2, 1) — that’s the arrow (2, 1) hiding inside (x − 2)² + 1.',
      why:
        'Sliding y = x² by 2 right and 1 up moves the vertex from (0, 0) to (2, 1). In y = (x − h)² + k that is just (h, k).',
      hint: 'The origin vertex of y = x² slides the same way the curve does: 2 right, then 1 up.',
    },
    {
      id: 'mc-sign-trap',
      type: 'multiple-choice',
      title: 'The classic trap',
      prompt: 'In y = (x − 3)², which way does the parabola slide compared with y = x²?',
      options: ['3 units RIGHT', '3 units LEFT', '3 units UP', '3 units DOWN'],
      correctIndex: 0,
      insight:
        'The famous gotcha: (x − 3) slides RIGHT, not left. The minus sign fools almost everyone the first time.',
      why:
        'To hit the old lowest point (where the inside is 0), x must now equal 3. So every point shifts to a bigger x — the curve moves 3 to the right.',
      hint: 'Ask: what value of x makes (x − 3) equal to 0? That is where the vertex now sits.',
    },
    {
      id: 'complete',
      type: 'complete',
      title: 'Lesson complete!',
      message:
        'You climbed the whole ladder: a hiker on a line, a point, a triangle, stacked slides, and a parabola — every move captured by one two-number arrow.',
      discovery:
        'A translation adds the same arrow (Δx, Δy) to every point, so size, shape, and orientation stay fixed and only position changes. Stacking slides just adds the arrows — and inside an equation, (x − h)² + k hides the arrow (h, k).',
    },
  ],
}
