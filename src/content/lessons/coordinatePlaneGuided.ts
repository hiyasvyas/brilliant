import type { Lesson, LessonStep, LessonCheckQuestion } from '../../types/lesson'

export const coordinatePlaneGuidedLessonCheck: LessonCheckQuestion[] = [
  {
    id: 'cpg-check-1',
    title: 'Question 1 of 3',
    prompt:
      'A point sits 3 steps right of the origin and 2 steps up. What are its coordinates? Enter as (x, y).',
    answers: ['(3, 2)', '3, 2', '3,2'],
    hint: 'Read across first (how far right), then up. Right is x, up is y.',
    why: 'Across is the x-coordinate (3) and up is the y-coordinate (2), so the point is (3, 2). x always comes first.',
    variants: [
      {
        prompt:
          'A point is 1 step right and 5 steps up from the origin. What are its coordinates? Enter as (x, y).',
        answers: ['(1, 5)', '1, 5', '1,5'],
        hint: 'How far right is x; how far up is y.',
        why: 'Right 1 gives x = 1, up 5 gives y = 5, so the point is (1, 5).',
      },
      {
        prompt:
          'A point is 4 steps right and 4 steps up from the origin. What are its coordinates? Enter as (x, y).',
        answers: ['(4, 4)', '4, 4', '4,4'],
        hint: 'Count right for x, then up for y.',
        why: 'Right 4 gives x = 4 and up 4 gives y = 4, so the point is (4, 4).',
      },
    ],
  },
  {
    id: 'cpg-check-2',
    title: 'Question 2 of 3',
    prompt:
      'To plot the point (5, 1), how far do you go right, and how far up? Enter as (right, up).',
    answers: ['(5, 1)', '5, 1', '5,1'],
    hint: 'The first number tells you how far right, the second how far up.',
    why: 'In (5, 1) the x-coordinate 5 means 5 steps right, and the y-coordinate 1 means 1 step up.',
    variants: [
      {
        prompt: 'To plot the point (2, 6), how far right and how far up do you go? Enter as (right, up).',
        answers: ['(2, 6)', '2, 6', '2,6'],
        hint: 'First number is right, second number is up.',
        why: 'The 2 means 2 steps right and the 6 means 6 steps up.',
      },
      {
        prompt: 'To plot the point (6, 3), how far right and how far up do you go? Enter as (right, up).',
        answers: ['(6, 3)', '6, 3', '6,3'],
        hint: 'Read x first (right), then y (up).',
        why: 'The 6 means 6 steps right and the 3 means 3 steps up.',
      },
    ],
  },
  {
    id: 'cpg-check-3',
    title: 'Question 3 of 3',
    prompt:
      'Where is the origin — the point you always start counting from? Enter its coordinates as (x, y).',
    answers: ['(0, 0)', '0, 0', '0,0'],
    hint: 'It is where the two axes cross, before you move right or up at all.',
    why: 'The origin is (0, 0): zero steps right and zero steps up. Every other point is measured from here.',
    variants: [
      {
        prompt:
          'A point is 0 steps right and 3 steps up from the origin. What are its coordinates? Enter as (x, y).',
        answers: ['(0, 3)', '0, 3', '0,3'],
        hint: 'No steps right means x is 0; 3 steps up means y is 3.',
        why: 'Right 0 gives x = 0 and up 3 gives y = 3, so the point is (0, 3) — straight up the y-axis.',
      },
      {
        prompt:
          'A point is 4 steps right and 0 steps up from the origin. What are its coordinates? Enter as (x, y).',
        answers: ['(4, 0)', '4, 0', '4,0'],
        hint: '4 steps right means x is 4; no steps up means y is 0.',
        why: 'Right 4 gives x = 4 and up 0 gives y = 0, so the point is (4, 0) — right along the x-axis.',
      },
    ],
  },
]

export const coordinatePlaneGuidedPracticeSteps: LessonStep[] = [
  {
    id: 'cpg-practice-move-1',
    type: 'move-point',
    title: 'Practice: plot (2, 5)',
    prompt: 'Drag the point to (2, 5): 2 steps right and 5 steps up from the origin.',
    start: [0, 0],
    target: [2, 5],
    insight: 'You read x first (2 right) and y second (5 up) — that order never changes.',
    why: 'Start at the origin, go 2 steps right (x = 2), then 5 steps up (y = 5). The point lands at (2, 5).',
    hint: 'Count 2 grid lines to the right, then 5 grid lines up.',
  },
  {
    id: 'cpg-practice-read-1',
    type: 'number-input',
    title: 'Practice: read the point',
    prompt: 'A point is plotted below. What are its coordinates? Enter as (x, y).',
    answers: ['(4, 2)', '4, 2', '4,2'],
    inputLabel: 'Point =',
    why: 'The point is 4 steps right (x = 4) and 2 steps up (y = 2), so it is (4, 2).',
    hint: 'Count how far right it is for x, then how far up for y.',
    graph: {
      range: 6,
      points: [{ x: 4, y: 2, color: '#38bdf8', label: 'P' }],
    },
  },
  {
    id: 'cpg-practice-move-2',
    type: 'move-point',
    title: 'Practice: plot (6, 1)',
    prompt: 'Drag the point to (6, 1): 6 steps right and just 1 step up.',
    start: [0, 0],
    target: [6, 1],
    insight: 'A big x with a small y lives far to the right but close to the bottom.',
    why: 'Go 6 steps right (x = 6), then 1 step up (y = 1). The point lands at (6, 1).',
    hint: 'Count 6 grid lines right, then 1 up.',
  },
]

export const coordinatePlaneGuidedLesson: Lesson = {
  id: 'coordinate-plane-guided-101',
  title: 'Coordinate Plane: First Steps',
  description:
    'Take it slow and plot your first points. We stay in the friendly top-right corner — only positive numbers — reading how far right (x) and how far up (y), so you feel sure before we ever meet a negative.',
  subject: 'Coordinate Geometry',
  order: 7,
  region: 'Quadrant Quarry',
  icon: '🗺️',
  estimatedMinutes: 8,
  lessonCheck: coordinatePlaneGuidedLessonCheck,
  practiceSteps: coordinatePlaneGuidedPracticeSteps,
  steps: [
    // ── Part 1: Reading across, then up ───────────────────────────────────────
    {
      id: 'cpg-concept-x',
      type: 'concept',
      title: 'Read across first (the x)',
      body:
        "Every point on the grid has an address made of two numbers. The first number, called x, tells you how far to walk to the right. We always read it first — across before up. In this whole lesson we stay in the top-right corner, so x is 0 or bigger and you only ever move right. The dot below sits at x = 3: three steps to the right.",
      graph: {
        range: 6,
        points: [{ x: 3, y: 0, color: '#38bdf8', label: 'x = 3' }],
      },
    },
    {
      id: 'cpg-concept-y',
      type: 'concept',
      title: 'Then read up (the y) — and meet the origin',
      body:
        "The second number, called y, tells you how far to go up. So a point's address is (x, y): walk right, then up. The corner where both axes cross is the origin, written (0, 0) — zero right and zero up. Everything you plot starts from there. The dot below moved right 3, then up 2, landing at (3, 2).",
      graph: {
        range: 6,
        points: [
          { x: 0, y: 0, color: '#f472b6', label: 'origin (0,0)' },
          { x: 3, y: 2, color: '#38bdf8', label: '(3, 2)' },
        ],
      },
    },

    // ── Part 2: Plot your first point ─────────────────────────────────────────
    {
      id: 'cpg-move-1',
      type: 'move-point',
      title: 'Plot (3, 2)',
      prompt: 'Drag the point to (3, 2): start at the origin, go 3 steps right, then 2 steps up.',
      prediction: {
        question: 'To plot (3, 2), which do you do first?',
        options: [
          'Go up 3, then right 2',
          'Go right 3, then up 2',
          'Go up 2, then right 3',
          'It does not matter',
        ],
        correctIndex: 1,
        why: 'Always read x first: go right 3 (the first number), then up 2 (the second number). Reading in this order keeps points from getting mixed up.',
      },
      start: [0, 0],
      target: [3, 2],
      insight: 'You did it — right for x, up for y. That same order works for every point.',
      why: 'From the origin, 3 steps right gives x = 3, and 2 steps up gives y = 2, so the point is (3, 2).',
      hint: 'Count 3 grid lines to the right first, then 2 grid lines up.',
      remediation: {
        title: "Let's slow down and plot step by step",
        body:
          "Plotting a point is just two little walks, always in the same order. The first number is x — how far RIGHT you go. The second number is y — how far UP you go. So for (x, y) you put your finger on the origin, walk right that many steps, and only then walk up. Try saying it out loud: \"right first, then up.\"",
        tips: [
          'Always start your finger on the origin (0, 0).',
          'First number = steps RIGHT. Move there before doing anything else.',
          'Second number = steps UP. Now go up from where you stopped.',
          'Whisper "right, then up" every single time until it feels automatic.',
        ],
        graph: {
          range: 6,
          points: [
            { x: 0, y: 0, color: '#f472b6', label: 'start here' },
            { x: 3, y: 0, color: '#94a3b8', dashed: true, label: 'right 3' },
            { x: 3, y: 2, color: '#38bdf8', label: '(3, 2)' },
          ],
        },
      },
    },
    {
      id: 'cpg-move-2',
      type: 'move-point',
      title: 'Plot (5, 4)',
      prompt: 'Drag the point to (5, 4): 5 steps right, then 4 steps up.',
      start: [0, 0],
      target: [5, 4],
      insight: 'Bigger numbers just mean a longer walk — the right-then-up order is exactly the same.',
      why: '5 steps right gives x = 5 and 4 steps up gives y = 4, so the point lands at (5, 4).',
      hint: 'Count 5 grid lines right, then 4 grid lines up.',
    },

    // ── Part 3: Read a plotted point ──────────────────────────────────────────
    {
      id: 'cpg-read-mc',
      type: 'multiple-choice',
      title: 'Read the point',
      prompt: 'Look at the plotted point below. What are its coordinates?',
      options: ['(2, 4)', '(4, 2)', '(2, 2)', '(4, 4)'],
      correctIndex: 1,
      why: 'The point is 4 steps right (x = 4) and 2 steps up (y = 2). Read across first, so it is (4, 2), not (2, 4).',
      hint: 'Count how far right the point is for x, then how far up for y. x comes first.',
      graph: {
        range: 6,
        points: [{ x: 4, y: 2, color: '#38bdf8', label: '?' }],
      },
    },
    {
      id: 'cpg-read-input',
      type: 'number-input',
      title: 'Name the point',
      prompt: 'What are the coordinates of the point shown below? Enter as (x, y).',
      answers: ['(2, 5)', '2, 5', '2,5'],
      inputLabel: 'Point =',
      why: 'The point is 2 steps right (x = 2) and 5 steps up (y = 5), so it is (2, 5).',
      hint: 'How far right is it? That is x. How far up? That is y. Write (x, y).',
      graph: {
        range: 6,
        points: [{ x: 2, y: 5, color: '#38bdf8', label: 'Q' }],
      },
    },

    // ── Part 4: One more plot ─────────────────────────────────────────────────
    {
      id: 'cpg-move-3',
      type: 'move-point',
      title: 'Plot (6, 0)',
      prompt: 'Drag the point to (6, 0): 6 steps right, and 0 steps up.',
      prediction: {
        question: 'If y is 0, how far up does the point go?',
        options: ['All the way to the top', '0 steps — it stays on the bottom line', 'Up 6 steps', 'You cannot plot it'],
        correctIndex: 1,
        why: 'A y of 0 means zero steps up, so the point stays right on the x-axis (the bottom line). It just slides 6 to the right.',
      },
      start: [0, 0],
      target: [6, 0],
      insight: 'When y is 0 the point lives right on the x-axis — it never leaves the floor.',
      why: '6 steps right gives x = 6, and 0 steps up keeps y = 0, so the point lands at (6, 0) on the x-axis.',
      hint: 'Slide 6 grid lines to the right and stay on the bottom line.',
    },

    {
      id: 'cpg-complete',
      type: 'complete',
      title: 'Lesson complete!',
      message:
        'You plotted points in the top-right corner and read their addresses — always going right for x, then up for y. The origin (0, 0) is where every journey begins.',
      discovery:
        'A point on the grid has an address (x, y): the first number is how far right, the second is how far up. Read across before up, start from the origin, and plotting is just two little walks.',
    },
  ],
}
