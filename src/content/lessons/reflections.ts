import type { Lesson, LessonStep, LessonCheckQuestion } from '../../types/lesson'

export const reflectionsLessonCheck: LessonCheckQuestion[] = [
  {
    id: 'check-1',
    title: 'Question 1 of 3',
    prompt:
      'Reflect the point (3, 5) across the x-axis. What are the coordinates of its image? Enter as (x, y).',
    answers: ['(3, -5)', '3, -5', '3,-5'],
    hint: 'Reflecting across the x-axis keeps x the same and flips the sign of y.',
    why: 'Across the x-axis, (x, y) → (x, −y). The x stays 3 and the y flips from 5 to −5, so the image is (3, −5).',
    variants: [
      {
        prompt:
          'Reflect the point (2, 4) across the x-axis. What are the coordinates of its image? Enter as (x, y).',
        answers: ['(2, -4)', '2, -4', '2,-4'],
        hint: 'Keep x, negate y.',
        why: 'Across the x-axis, (x, y) → (x, −y): (2, 4) becomes (2, −4).',
      },
      {
        prompt:
          'Reflect the point (−1, 6) across the x-axis. What are the coordinates of its image? Enter as (x, y).',
        answers: ['(-1, -6)', '-1, -6', '-1,-6'],
        hint: 'x is unchanged; flip the sign of y.',
        why: 'Across the x-axis, (x, y) → (x, −y): (−1, 6) becomes (−1, −6).',
      },
    ],
  },
  {
    id: 'check-2',
    title: 'Question 2 of 3',
    prompt:
      'Reflect the point (−4, 2) across the y-axis. What are the coordinates of its image? Enter as (x, y).',
    answers: ['(4, 2)', '4, 2', '4,2'],
    hint: 'Reflecting across the y-axis keeps y the same and flips the sign of x.',
    why: 'Across the y-axis, (x, y) → (−x, y). The y stays 2 and the x flips from −4 to 4, so the image is (4, 2).',
    variants: [
      {
        prompt:
          'Reflect the point (3, −2) across the y-axis. What are the coordinates of its image? Enter as (x, y).',
        answers: ['(-3, -2)', '-3, -2', '-3,-2'],
        hint: 'Negate x, keep y.',
        why: 'Across the y-axis, (x, y) → (−x, y): (3, −2) becomes (−3, −2).',
      },
      {
        prompt:
          'Reflect the point (5, 1) across the y-axis. What are the coordinates of its image? Enter as (x, y).',
        answers: ['(-5, 1)', '-5, 1', '-5,1'],
        hint: 'The y-axis flip changes only the sign of x.',
        why: 'Across the y-axis, (x, y) → (−x, y): (5, 1) becomes (−5, 1).',
      },
    ],
  },
  {
    id: 'check-3',
    title: 'Question 3 of 3',
    prompt:
      'A point A is at (2, −3). Its image A′ is at (2, 3). Which axis was A reflected across? Answer "x" or "y".',
    answers: ['x', 'x-axis', 'the x-axis', 'x axis'],
    hint: 'Compare the coordinates: which one changed sign — x or y?',
    why: 'Only the y-coordinate flipped sign (−3 → 3) while x stayed 2. Flipping y is the rule for a reflection across the x-axis.',
    variants: [
      {
        prompt:
          'A point is at (4, 1) and its image is at (−4, 1). Which axis was it reflected across? Answer "x" or "y".',
        answers: ['y', 'y-axis', 'the y-axis', 'y axis'],
        hint: 'See which coordinate changed sign.',
        why: 'Only the x-coordinate flipped sign (4 → −4), which is the rule for a reflection across the y-axis.',
      },
      {
        prompt:
          'A point is at (−2, 5) and its image is at (−2, −5). Which axis was it reflected across? Answer "x" or "y".',
        answers: ['x', 'x-axis', 'the x-axis', 'x axis'],
        hint: 'Which coordinate flipped — the first or the second?',
        why: 'Only the y-coordinate flipped sign (5 → −5), which is the rule for a reflection across the x-axis.',
      },
    ],
  },
]

export const reflectionsPracticeSteps: LessonStep[] = [
  {
    id: 'practice-reflect-point-1',
    type: 'reflect-shape',
    title: 'Practice: flip a point',
    prompt: 'Tap the axis that flips the point onto the dashed target.',
    shape: [[-3, 2]],
    axis: 'y',
    insight: 'The point landed straight across the y-axis at the same height — only its left/right side changed.',
    why: 'The target (3, 2) keeps the same y as (−3, 2) but flips x from −3 to 3, which is a reflection across the y-axis.',
    hint: 'The height (y) is unchanged and only the side (x) flips, so reflect across the y-axis.',
  },
  {
    id: 'practice-reflect-seg-1',
    type: 'reflect-shape',
    title: 'Practice: flip a segment',
    prompt: 'Tap the axis that flips the segment onto the dashed target below it.',
    shape: [
      [1, 3],
      [4, 3],
    ],
    axis: 'x',
    insight: 'The whole segment dropped below the x-axis as a mirror image, keeping its length.',
    why: 'Each endpoint keeps its x and flips its y: (1, 3) → (1, −3) and (4, 3) → (4, −3), a reflection across the x-axis.',
    hint: 'The image sits below the x-axis at the same x-values, so reflect across the x-axis.',
  },
  {
    id: 'practice-mc-1',
    type: 'multiple-choice',
    title: 'Practice: name the rule',
    prompt: 'Which rule describes a reflection across the y-axis?',
    options: ['(x, y) → (x, −y)', '(x, y) → (−x, y)', '(x, y) → (−x, −y)', '(x, y) → (y, x)'],
    correctIndex: 1,
    why: 'A reflection across the y-axis flips left/right, so it negates x and leaves y alone: (x, y) → (−x, y).',
    hint: 'The y-axis is the vertical mirror, so the left/right value (x) is the one that flips.',
  },
]

export const reflectionsLesson: Lesson = {
  id: 'reflections-101',
  title: 'Reflections: Flip Across Axes',
  description:
    'Mirror points, segments, and shapes across the x- and y-axes, and learn the simple sign-flip rules that turn any figure into its reflected image.',
  subject: 'Coordinate Geometry',
  order: 2,
  region: 'Mirror Marsh',
  icon: '🪞',
  estimatedMinutes: 9,
  lessonCheck: reflectionsLessonCheck,
  practiceSteps: reflectionsPracticeSteps,
  steps: [
    // ── Part 1: Reflecting across the x-axis ─────────────────────────────────
    {
      id: 'concept-x-axis',
      type: 'concept',
      title: 'Flipping across the x-axis',
      body:
        'A reflection is a mirror flip. When you flip a point across the x-axis, it lands the same distance on the other side of that line. Its left/right position never changes, but its up/down position flips: (x, y) → (x, −y). Here (3, 2) mirrors down to (3, −2).',
      graph: {
        range: 6,
        points: [
          { x: 3, y: 2, color: '#38bdf8', label: 'P' },
          { x: 3, y: -2, color: '#f472b6', dashed: true, label: "P'" },
        ],
      },
    },
    {
      id: 'reflect-point-x',
      type: 'reflect-shape',
      title: 'Flip a point across the x-axis',
      prompt: 'Tap the axis that flips the point onto the dashed target.',
      prediction: {
        question: 'Before you flip it: reflecting (3, 4) across the x-axis, which coordinate changes sign?',
        options: ['Only x', 'Only y', 'Both x and y', 'Neither'],
        correctIndex: 1,
        why: 'The x-axis is a horizontal mirror, so a point keeps its left/right value (x) and flips its up/down value (y). Only y changes sign.',
      },
      shape: [[3, 4]],
      axis: 'x',
      insight: 'The point mirrored straight down to (3, −4) — same column, opposite side of the x-axis.',
      why: 'Across the x-axis, (x, y) → (x, −y): (3, 4) becomes (3, −4). The x stays 3 and the y flips from 4 to −4.',
      hint: 'The dashed target sits below at the same x-value, so the mirror line is the x-axis.',
    },

    // ── Part 2: Reflecting across the y-axis ─────────────────────────────────
    {
      id: 'concept-y-axis',
      type: 'concept',
      title: 'Flipping across the y-axis',
      body:
        'Flipping across the y-axis is the same idea, but the mirror is now vertical. The up/down position stays put while the left/right position flips: (x, y) → (−x, y). Here (2, 3) mirrors over to (−2, 3).',
      graph: {
        range: 6,
        points: [
          { x: 2, y: 3, color: '#38bdf8', label: 'Q' },
          { x: -2, y: 3, color: '#f472b6', dashed: true, label: "Q'" },
        ],
      },
    },
    {
      id: 'reflect-point-y',
      type: 'reflect-shape',
      title: 'Flip a point across the y-axis',
      prompt: 'Tap the axis that flips the point onto the dashed target.',
      shape: [[-4, 1]],
      axis: 'y',
      insight: 'The point mirrored across to (4, 1) — same height, opposite side of the y-axis.',
      why: 'Across the y-axis, (x, y) → (−x, y): (−4, 1) becomes (4, 1). The y stays 1 and the x flips from −4 to 4.',
      hint: 'The target is at the same height but on the other side, so the mirror line is the y-axis.',
    },

    // ── Part 3: Reflecting a segment ─────────────────────────────────────────
    {
      id: 'reflect-segment',
      type: 'reflect-shape',
      title: 'Flip a segment',
      prompt: 'Tap the axis that flips the whole segment onto the dashed target.',
      prediction: {
        question: 'The segment is below the x-axis and the target is above it at the same x-values. Which axis flips it there?',
        options: ['The x-axis', 'The y-axis', 'Either one works', 'Neither — it must slide'],
        correctIndex: 0,
        why: 'The target is directly above with the same left/right positions, so only the up/down value flips. That is a reflection across the x-axis.',
      },
      shape: [
        [-5, -2],
        [-2, -4],
      ],
      axis: 'x',
      insight: 'Both endpoints flipped their y-values, so the segment mirrored above the x-axis with the same length.',
      why: 'Across the x-axis each endpoint keeps x and negates y: (−5, −2) → (−5, 2) and (−2, −4) → (−2, 4).',
      hint: 'The image sits above at the same x-values, so reflect across the x-axis.',
    },

    // ── Part 4: Reflecting a triangle ────────────────────────────────────────
    {
      id: 'reflect-triangle',
      type: 'reflect-shape',
      title: 'Flip a triangle',
      prompt: 'Tap the axis that flips the triangle onto the dashed target.',
      shape: [
        [2, 1],
        [5, 1],
        [3, 4],
      ],
      axis: 'y',
      insight: 'Every corner flipped its x-value, so the triangle mirrored to the left side, same size and shape.',
      why: 'Across the y-axis each corner keeps y and negates x: (2, 1) → (−2, 1), (5, 1) → (−5, 1), (3, 4) → (−3, 4).',
      hint: 'The image is the same height but on the left, so the mirror line is the y-axis.',
    },

    // ── Part 5: Naming the coordinate rules ──────────────────────────────────
    {
      id: 'mc-rule',
      type: 'multiple-choice',
      title: 'Pick the right rule',
      prompt: 'Reflecting the point (3, 5) across the x-axis gives which image?',
      options: ['(−3, 5)', '(3, −5)', '(−3, −5)', '(5, 3)'],
      correctIndex: 1,
      insight: 'Across the x-axis only the second coordinate flips sign — the first stays exactly the same.',
      why: 'Across the x-axis, (x, y) → (x, −y). Keep x = 3 and flip y from 5 to −5, so the image is (3, −5).',
      hint: 'The x-axis flip keeps x and negates y.',
    },
    {
      id: 'number-input-rule',
      type: 'number-input',
      title: 'Compute the image',
      prompt: 'Reflect the point (−2, 4) across the y-axis. Enter its image as (x, y).',
      answers: ['(2, 4)', '2, 4', '2,4'],
      insight: 'A y-axis reflection touches only the x-coordinate — the height never moves.',
      why: 'Across the y-axis, (x, y) → (−x, y). Flip x from −2 to 2 and keep y = 4, so the image is (2, 4).',
      hint: 'Negate the x-coordinate and leave the y-coordinate alone.',
    },

    // ── Part 6: Plot the image yourself — no outline to copy ──────────────────
    {
      id: 'reflect-plot-x',
      type: 'reflect-plot',
      title: 'Plot the reflection yourself',
      prompt:
        'No outline this time. Reflect (4, 2) across the x-axis, then drag the point to where its image lands.',
      point: [4, 2],
      axis: 'x',
      prediction: {
        question: 'Reflecting (4, 2) across the x-axis, which coordinate changes sign?',
        options: ['Only x', 'Only y', 'Both x and y', 'Neither'],
        correctIndex: 1,
        why: 'The x-axis is a horizontal mirror: the left/right value (x) stays and only the up/down value (y) flips sign.',
      },
      insight:
        'You placed the image with no outline to copy — that means you used the rule, not your eyes.',
      why: 'Across the x-axis, (x, y) → (x, −y): (4, 2) → (4, −2). Keep x = 4 and flip y from 2 to −2.',
      hint: 'The mirror is the x-axis, so keep x the same and flip the sign of y.',
    },
    {
      id: 'reflect-plot-y',
      type: 'reflect-plot',
      title: 'Now flip across the y-axis',
      prompt: 'Reflect (−3, 4) across the y-axis and drag the point to its image.',
      point: [-3, 4],
      axis: 'y',
      insight:
        'Starting on the left, the image landed the same height on the right — only the side changed.',
      why: 'Across the y-axis, (x, y) → (−x, y): (−3, 4) → (3, 4). Keep y = 4 and flip x from −3 to 3.',
      hint: 'The mirror is the y-axis, so keep y the same and flip the sign of x.',
    },
    {
      id: 'reflect-plot-q3',
      type: 'reflect-plot',
      title: 'A trickier one',
      prompt: 'Reflect (−2, −5) across the x-axis and drag the point to its image.',
      point: [-2, -5],
      axis: 'x',
      insight:
        'The x stayed negative — only y flipped. It is easy to change the wrong coordinate when both start negative.',
      why: 'Across the x-axis, (x, y) → (x, −y): (−2, −5) → (−2, 5). x stays −2 — do not touch it — and y flips from −5 to 5.',
      hint: 'Only y flips across the x-axis. Leave x exactly where it is, even when it is negative.',
    },
    {
      id: 'complete',
      type: 'complete',
      title: 'Lesson complete!',
      message:
        'You flipped points, a segment, and a triangle across both axes, and you named the coordinate rules behind each mirror.',
      discovery:
        'A reflection is a mirror flip across a line. Across the x-axis, (x, y) → (x, −y) — the height flips. Across the y-axis, (x, y) → (−x, y) — the left/right side flips. The figure keeps its exact size and shape; only which side of the mirror it sits on changes.',
    },
  ],
}
