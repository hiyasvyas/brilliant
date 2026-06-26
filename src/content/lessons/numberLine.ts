import type { Lesson, LessonStep, LessonCheckQuestion } from '../../types/lesson'

export const numberLineLessonCheck: LessonCheckQuestion[] = [
  {
    id: 'nl-check-1',
    title: 'Question 1 of 3',
    prompt:
      'Start at −2 and move 5 units right. Where do you land? Enter a single number.',
    answers: ['3', '+3'],
    hint: 'Moving right adds. Count up from −2: −1, 0, 1, 2, 3.',
    why: 'Right means add: −2 + 5 = 3. You land on 3.',
    variants: [
      {
        prompt: 'Start at −4 and move 6 units right. Where do you land?',
        answers: ['2', '+2'],
        hint: 'Right adds: −4 + 6.',
        why: '−4 + 6 = 2, so you land on 2.',
      },
      {
        prompt: 'Start at 1 and move 4 units right. Where do you land?',
        answers: ['5', '+5'],
        hint: 'Right adds: 1 + 4.',
        why: '1 + 4 = 5, so you land on 5.',
      },
    ],
  },
  {
    id: 'nl-check-2',
    title: 'Question 2 of 3',
    prompt:
      'Start at 4 and move 7 units left. Where do you land? Enter a single number.',
    answers: ['-3', '−3'],
    hint: 'Moving left subtracts. Count down from 4: 3, 2, 1, 0, −1, −2, −3.',
    why: 'Left means subtract: 4 − 7 = −3. You land on −3.',
    variants: [
      {
        prompt: 'Start at 2 and move 5 units left. Where do you land?',
        answers: ['-3', '−3'],
        hint: 'Left subtracts: 2 − 5.',
        why: '2 − 5 = −3, so you land on −3.',
      },
      {
        prompt: 'Start at 5 and move 8 units left. Where do you land?',
        answers: ['-3', '−3'],
        hint: 'Left subtracts: 5 − 8.',
        why: '5 − 8 = −3, so you land on −3.',
      },
    ],
  },
  {
    id: 'nl-check-3',
    title: 'Question 3 of 3',
    prompt:
      'How far apart are 3 and −4 on the number line? Enter the number of units.',
    answers: ['7'],
    hint: 'Distance is how many steps from one to the other — count across zero: from 3 down to 0 is 3, then 0 to −4 is 4.',
    why: 'The distance is 3 + 4 = 7 units (or 3 − (−4) = 7). Distance is always positive — it just counts the steps between them.',
    variants: [
      {
        prompt: 'How far apart are 2 and −3 on the number line?',
        answers: ['5'],
        hint: 'Count from 2 down to −3.',
        why: '2 − (−3) = 5, so they are 5 units apart.',
      },
      {
        prompt: 'How far apart are −1 and −6 on the number line?',
        answers: ['5'],
        hint: 'Both are negative — count the steps between them.',
        why: '−1 − (−6) = 5, so they are 5 units apart.',
      },
    ],
  },
]

export const numberLinePracticeSteps: LessonStep[] = [
  {
    id: 'nl-practice-1',
    type: 'number-line',
    title: 'Practice: move right',
    prompt: 'Start at −1 and move 4 units right — drag the marker to where you land.',
    start: -1,
    target: 3,
    min: -6,
    max: 6,
    insight: 'Each step right is +1, so four steps right is +4.',
    why: 'Right means add: −1 + 4 = 3. The marker lands on 3.',
    hint: 'Count four tick marks to the right of −1.',
  },
  {
    id: 'nl-practice-2',
    type: 'number-line',
    title: 'Practice: move left',
    prompt: 'Start at 3 and move 6 units left — drag the marker to where you land.',
    start: 3,
    target: -3,
    min: -8,
    max: 8,
    insight: 'Moving left past zero takes you into the negatives.',
    why: 'Left means subtract: 3 − 6 = −3. The marker lands on −3.',
    hint: 'Count six tick marks to the left of 3 — you will cross zero.',
  },
  {
    id: 'nl-practice-3',
    type: 'multiple-choice',
    title: 'Practice: name the move',
    prompt: 'To get from −5 to −1, how do you move?',
    options: ['4 units left', '4 units right', '6 units right', '6 units left'],
    correctIndex: 1,
    why: '−1 is to the right of −5. The distance is −1 − (−5) = 4, so you move 4 units right.',
    hint: 'Is −1 bigger or smaller than −5? Bigger numbers sit to the right.',
  },
]

export const numberLineLesson: Lesson = {
  id: 'number-line-101',
  title: 'Number Line: Coordinates & Direction',
  description:
    'Read positions on a number line and move left for negative, right for positive. Build the directional sense that coordinates are made of.',
  subject: 'Coordinate Geometry',
  order: 3,
  region: 'Number Line Outpost',
  icon: '📏',
  estimatedMinutes: 8,
  lessonCheck: numberLineLessonCheck,
  practiceSteps: numberLinePracticeSteps,
  steps: [
    // ── Concept 1: direction ─────────────────────────────────────────────────
    {
      id: 'nl-concept-direction',
      type: 'concept',
      title: 'Positive is right, negative is left',
      body:
        'A number line is just a ruler that keeps going both ways past zero. Bigger numbers sit to the right, smaller numbers to the left. So moving right means going up (more positive), and moving left means going down (more negative). Zero is the middle — everything to its right is positive, everything to its left is negative.',
    },
    // ── Concept 2: distance ──────────────────────────────────────────────────
    {
      id: 'nl-concept-distance',
      type: 'concept',
      title: 'Distance is how many units you move',
      body:
        'The direction tells you which way; the distance tells you how far. To move, just count tick marks: each step to the right adds 1, each step to the left subtracts 1. The distance between two spots is simply how many steps separate them — and that count is always positive, no matter which way you go.',
    },

    // ── Problem 1: move right (with prediction) ──────────────────────────────
    {
      id: 'nl-move-right',
      type: 'number-line',
      title: 'Move to the right',
      prompt: 'Start at −3 and move 5 units right — drag the marker to where you land.',
      prediction: {
        question: 'Before you move: starting at −3 and going 5 units right, will you end up positive or negative?',
        options: [
          'Negative — you stay on the left',
          'Positive — you cross zero into the right',
          'Exactly zero',
          'You cannot tell',
        ],
        correctIndex: 1,
        why: 'From −3 it only takes 3 steps to reach 0, and you have 5 steps. The extra 2 steps carry you to +2, on the positive side.',
      },
      start: -3,
      target: 2,
      min: -8,
      max: 8,
      insight: 'You crossed zero! Three steps got you to 0, and the last two pushed you to +2.',
      why: 'Right means add: −3 + 5 = 2. The marker lands on 2.',
      hint: 'Count five tick marks to the right of −3. You will pass through 0 on the way.',
    },

    // ── Problem 2: move left ─────────────────────────────────────────────────
    {
      id: 'nl-move-left',
      type: 'number-line',
      title: 'Move to the left',
      prompt: 'Start at 2 and move 6 units left — drag the marker to where you land.',
      start: 2,
      target: -4,
      min: -9,
      max: 9,
      insight: 'Moving left took you below zero into the negatives.',
      why: 'Left means subtract: 2 − 6 = −4. The marker lands on −4.',
      hint: 'Count six tick marks to the left of 2 — keep going past zero.',
    },

    // ── Problem 3: multiple-choice on distance + direction (prediction) ──────
    {
      id: 'nl-distance-mc',
      type: 'multiple-choice',
      title: 'How many units, and which way?',
      prompt: 'How many units, and in which direction, do you move from 2 to −4?',
      prediction: {
        question: 'From 2 to −4, which direction are you heading?',
        options: ['Right', 'Left', 'Neither — it stays the same', 'Both at once'],
        correctIndex: 1,
        why: '−4 is smaller than 2, and smaller numbers sit to the left, so you move left.',
      },
      options: ['6 units left', '6 units right', '2 units left', '4 units left'],
      correctIndex: 0,
      why: '−4 is to the left of 2. The distance is 2 − (−4) = 6, so you move 6 units left.',
      hint: 'Count the steps from 2 down to −4: 1, 0, −1, −2, −3, −4. How many steps, and which direction?',
    },

    // ── Problem 4: number-input landing spot ─────────────────────────────────
    {
      id: 'nl-input-land',
      type: 'number-input',
      title: 'Where do you land?',
      prompt: 'Start at −1 and move 4 units left. What number do you land on?',
      answers: ['-5', '−5'],
      inputLabel: 'land on',
      why: 'Left means subtract: −1 − 4 = −5. You land on −5, deeper into the negatives.',
      hint: 'You are already negative — moving left makes the number even smaller.',
    },

    {
      id: 'nl-complete',
      type: 'complete',
      title: 'Lesson complete!',
      message:
        'You read positions on the number line, moved right for positive and left for negative, and measured the distance between points by counting steps.',
      discovery:
        'Every spot on the number line is just a distance and a direction from zero — right is positive, left is negative. That single idea is exactly what each coordinate of a point measures.',
    },
  ],
}
