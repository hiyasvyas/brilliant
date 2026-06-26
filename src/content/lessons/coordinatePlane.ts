import type { Lesson, LessonStep, LessonCheckQuestion } from '../../types/lesson'

export const coordinatePlaneLessonCheck: LessonCheckQuestion[] = [
  {
    id: 'check-1',
    title: 'Question 1 of 3',
    prompt:
      'Which quadrant contains the point (−3, 4)? Answer with the quadrant number (I, II, III, or IV).',
    answers: ['II', '2', 'quadrant ii', 'quadrant 2'],
    hint: 'x is negative (left) and y is positive (up). That corner is the top-left.',
    why: 'A negative x means left of the y-axis and a positive y means above the x-axis. The top-left region is Quadrant II, so (−3, 4) is in Quadrant II.',
    variants: [
      {
        prompt: 'Which quadrant contains the point (5, −2)? Answer I, II, III, or IV.',
        answers: ['IV', '4', 'quadrant iv', 'quadrant 4'],
        hint: 'Positive x is right, negative y is down — that is the bottom-right corner.',
        why: 'x is positive (right) and y is negative (down), which is the bottom-right region: Quadrant IV.',
      },
      {
        prompt: 'Which quadrant contains the point (−4, −1)? Answer I, II, III, or IV.',
        answers: ['III', '3', 'quadrant iii', 'quadrant 3'],
        hint: 'Both coordinates are negative — left and down.',
        why: 'Negative x is left and negative y is down, so the point sits in the bottom-left region: Quadrant III.',
      },
    ],
  },
  {
    id: 'check-2',
    title: 'Question 2 of 3',
    prompt:
      'Start at the origin. Move 2 left and 5 up. What ordered pair do you land on? Enter as (x, y).',
    answers: ['(-2, 5)', '-2, 5', '-2,5'],
    hint: 'Left makes x negative; up makes y positive. The origin is (0, 0).',
    why: 'From (0, 0), 2 left makes x = −2 and 5 up makes y = 5, so you land on (−2, 5).',
    variants: [
      {
        prompt: 'Start at the origin. Move 3 right and 4 down. What ordered pair do you land on? (x, y)',
        answers: ['(3, -4)', '3, -4', '3,-4'],
        hint: 'Right is positive x; down is negative y.',
        why: 'From (0, 0), 3 right gives x = 3 and 4 down gives y = −4, so the point is (3, −4).',
      },
      {
        prompt: 'Start at the origin. Move 6 left and 1 down. What ordered pair do you land on? (x, y)',
        answers: ['(-6, -1)', '-6, -1', '-6,-1'],
        hint: 'Both directions are negative this time.',
        why: 'From (0, 0), 6 left gives x = −6 and 1 down gives y = −1, so the point is (−6, −1).',
      },
    ],
  },
  {
    id: 'check-3',
    title: 'Question 3 of 3',
    prompt:
      'A point is read as (4, −3). How far right (or left) of the y-axis is it, and how far above (or below) the x-axis? Enter as (x, y).',
    answers: ['(4, -3)', '4, -3', '4,-3'],
    hint: 'The first number is the horizontal distance (right/left); the second is vertical (up/down).',
    why: 'x = 4 means 4 units right of the y-axis, and y = −3 means 3 units below the x-axis, so the point is (4, −3).',
    variants: [
      {
        prompt: 'A point sits 5 units left of the y-axis and 2 units above the x-axis. Name it as (x, y).',
        answers: ['(-5, 2)', '-5, 2', '-5,2'],
        hint: 'Left is negative x; above is positive y.',
        why: '5 left makes x = −5 and 2 above makes y = 2, so the point is (−5, 2).',
      },
      {
        prompt: 'A point sits 1 unit right of the y-axis and 6 units below the x-axis. Name it as (x, y).',
        answers: ['(1, -6)', '1, -6', '1,-6'],
        hint: 'Right is positive x; below is negative y.',
        why: '1 right makes x = 1 and 6 below makes y = −6, so the point is (1, −6).',
      },
    ],
  },
]

export const coordinatePlanePracticeSteps: LessonStep[] = [
  {
    id: 'practice-move-1',
    type: 'move-point',
    title: 'Practice: plot in Quadrant II',
    prompt: 'Drag the point to (−4, 3).',
    start: [0, 0],
    target: [-4, 3],
    insight: 'Negative x sent it left, positive y sent it up — straight into Quadrant II.',
    why: 'x = −4 is 4 units left of the y-axis and y = 3 is 3 units up, landing at (−4, 3).',
    hint: 'Count 4 grid lines left, then 3 up.',
  },
  {
    id: 'practice-mc-1',
    type: 'multiple-choice',
    title: 'Practice: name the quadrant',
    prompt: 'In which quadrant is the plotted point?',
    graph: {
      range: 6,
      points: [{ x: 2, y: -5, color: '#38bdf8', label: 'P' }],
    },
    options: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'],
    correctIndex: 3,
    insight: 'Right + down always lands you in Quadrant IV.',
    why: 'P is at (2, −5): x is positive (right) and y is negative (down), which is Quadrant IV.',
    hint: 'Is the point left or right of the y-axis? Above or below the x-axis?',
  },
  {
    id: 'practice-num-1',
    type: 'number-input',
    title: 'Practice: read the point',
    prompt: 'Read the plotted point and enter its coordinates as (x, y).',
    graph: {
      range: 6,
      points: [{ x: -1, y: -4, color: '#f472b6', label: 'Q' }],
    },
    answers: ['(-1, -4)', '-1, -4', '-1,-4'],
    inputLabel: '(x, y) =',
    why: 'Q sits 1 unit left of the y-axis and 4 units below the x-axis, so it is (−1, −4).',
    hint: 'Read the horizontal distance first, then the vertical distance. Both are negative here.',
  },
]

export const coordinatePlaneLesson: Lesson = {
  id: 'coordinate-plane-101',
  title: 'Coordinate Plane: All Four Quadrants',
  description:
    'Plot and read ordered pairs (x, y) across all four quadrants, including negative coordinates — x tells you left or right, y tells you up or down.',
  subject: 'Coordinate Geometry',
  order: 5,
  region: 'Quadrant Quarry',
  icon: '🧭',
  estimatedMinutes: 9,
  lessonCheck: coordinatePlaneLessonCheck,
  practiceSteps: coordinatePlanePracticeSteps,
  steps: [
    // ── Part 1: Reading an ordered pair ──────────────────────────────────────
    {
      id: 'concept-order',
      type: 'concept',
      title: 'x first, then y',
      body:
        'Every point is named by an ordered pair (x, y). The first number, x, tells you how far to go left or right from the center; positive goes right, negative goes left. The second number, y, tells you how far up or down; positive goes up, negative goes down. The order matters — always read across first, then up or down.',
      graph: {
        range: 6,
        points: [{ x: 3, y: 2, color: '#38bdf8', label: '(3, 2)' }],
      },
    },
    {
      id: 'concept-quadrants',
      type: 'concept',
      title: 'The four quadrants',
      body:
        'The two axes cut the plane into four quadrants, numbered counterclockwise starting from the top-right. Quadrant I is (+, +), Quadrant II is (−, +), Quadrant III is (−, −), and Quadrant IV is (+, −). The sign pattern of (x, y) tells you exactly which quadrant a point lives in.',
      graph: {
        range: 6,
        points: [
          { x: 3, y: 3, color: '#38bdf8', label: 'I (+,+)' },
          { x: -3, y: 3, color: '#f472b6', label: 'II (-,+)' },
          { x: -3, y: -3, color: '#a78bfa', label: 'III (-,-)' },
          { x: 3, y: -3, color: '#34d399', label: 'IV (+,-)' },
        ],
      },
    },

    // ── Part 2: Plot points in different quadrants ───────────────────────────
    {
      id: 'move-q1',
      type: 'move-point',
      title: 'Plot a point in Quadrant I',
      prompt: 'Drag the point to (4, 2).',
      prediction: {
        question: 'Before you move it: (4, 2) has a positive x and a positive y. Which quadrant is that?',
        options: ['Quadrant I (top-right)', 'Quadrant II (top-left)', 'Quadrant III (bottom-left)', 'Quadrant IV (bottom-right)'],
        correctIndex: 0,
        why: 'Positive x is right and positive y is up, so the point lands in the top-right region — Quadrant I.',
      },
      start: [0, 0],
      target: [4, 2],
      insight: 'Right then up — both coordinates positive — keeps you in Quadrant I.',
      why: 'x = 4 moves 4 units right and y = 2 moves 2 units up, landing at (4, 2) in Quadrant I.',
      hint: 'From the origin, count 4 grid lines right, then 2 up.',
    },
    {
      id: 'move-q3',
      type: 'move-point',
      title: 'Plot a point in Quadrant III',
      prompt: 'Drag the point to (−3, −4).',
      prediction: {
        question: 'Where will (−3, −4) end up?',
        options: ['Top-right', 'Top-left', 'Bottom-left', 'Bottom-right'],
        correctIndex: 2,
        why: 'A negative x goes left and a negative y goes down, so both negatives put the point in the bottom-left — Quadrant III.',
      },
      start: [0, 0],
      target: [-3, -4],
      insight: 'Two negatives send the point down and to the left into Quadrant III.',
      why: 'x = −3 moves 3 units left and y = −4 moves 4 units down, landing at (−3, −4) in Quadrant III.',
      hint: 'Count 3 grid lines left, then 4 down.',
    },
    {
      id: 'move-q2',
      type: 'move-point',
      title: 'Plot a point in Quadrant II',
      prompt: 'Drag the point to (−5, 1).',
      start: [0, 0],
      target: [-5, 1],
      insight: 'Negative x and positive y means left and up — that is Quadrant II.',
      why: 'x = −5 moves 5 units left and y = 1 moves 1 unit up, landing at (−5, 1) in Quadrant II.',
      hint: 'Count 5 grid lines left, then 1 up.',
    },

    // ── Part 3: Name and read points ─────────────────────────────────────────
    {
      id: 'mc-quadrant',
      type: 'multiple-choice',
      title: 'Which quadrant?',
      prompt: 'Which quadrant is the point (−3, 4) in?',
      graph: {
        range: 6,
        points: [{ x: -3, y: 4, color: '#f472b6', label: '(-3, 4)' }],
      },
      options: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'],
      correctIndex: 1,
      insight: 'The (−, +) sign pattern always means top-left: Quadrant II.',
      why: 'x = −3 is negative (left) and y = 4 is positive (up). Left and up is the top-left region, which is Quadrant II.',
      hint: 'Check the signs: negative x means left, positive y means up.',
    },
    {
      id: 'num-read',
      type: 'number-input',
      title: 'Read the point',
      prompt: 'Read the plotted point and enter its coordinates as (x, y).',
      graph: {
        range: 6,
        points: [{ x: -2, y: -3, color: '#a78bfa', label: 'R' }],
      },
      answers: ['(-2, -3)', '-2, -3', '-2,-3'],
      inputLabel: '(x, y) =',
      insight: 'Reading a point is the reverse of plotting: measure across, then up or down.',
      why: 'R sits 2 units left of the y-axis (x = −2) and 3 units below the x-axis (y = −3), so it is (−2, −3).',
      hint: 'Measure the horizontal distance from the y-axis first, then the vertical distance from the x-axis.',
    },

    // ── Completion ───────────────────────────────────────────────────────────
    {
      id: 'complete',
      type: 'complete',
      title: 'Lesson complete!',
      message:
        'You plotted and read ordered pairs across all four quadrants, including negative coordinates, and matched each sign pattern to its quadrant.',
      discovery:
        'An ordered pair (x, y) is read across first (x: left/right) then up or down (y: up/down). The signs of x and y place the point in one of four quadrants: I (+,+), II (−,+), III (−,−), and IV (+,−).',
    },
  ],
}
