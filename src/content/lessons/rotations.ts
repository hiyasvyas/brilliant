import type { Lesson, LessonStep, LessonCheckQuestion } from '../../types/lesson'

// Rotation rules (counterclockwise about the origin):
//   90°  → (x, y) → (−y,  x)
//   180° → (x, y) → (−x, −y)
//   270° → (x, y) → ( y, −x)
// Every shape below is chosen so the pre-image AND the rotated image stay
// inside [−6, 6] on both axes (|x|, |y| ≤ 5).

export const rotationsLessonCheck: LessonCheckQuestion[] = [
  {
    id: 'check-1',
    title: 'Question 1 of 3',
    prompt:
      'Rotate the point (3, 1) by 90° counterclockwise about the origin. What are its new coordinates? Enter as (x, y).',
    answers: ['(-1, 3)', '-1, 3', '-1,3'],
    hint: 'The 90° rule is (x, y) → (−y, x): swap the numbers, then negate the new first coordinate.',
    why: 'For 90°, (x, y) → (−y, x). With (3, 1): the new x is −1 (that is −y) and the new y is 3 (that is x), so the image is (−1, 3).',
    variants: [
      {
        prompt:
          'Rotate the point (2, 5) by 90° counterclockwise about the origin. New coordinates? Enter as (x, y).',
        answers: ['(-5, 2)', '-5, 2', '-5,2'],
        hint: 'Use (x, y) → (−y, x).',
        why: '(2, 5) → (−5, 2): the new x is −5 (−y) and the new y is 2 (x).',
      },
      {
        prompt:
          'Rotate the point (4, −2) by 90° counterclockwise about the origin. New coordinates? Enter as (x, y).',
        answers: ['(2, 4)', '2, 4', '2,4'],
        hint: 'Use (x, y) → (−y, x); remember −(−2) = 2.',
        why: '(4, −2) → (−(−2), 4) = (2, 4).',
      },
    ],
  },
  {
    id: 'check-2',
    title: 'Question 2 of 3',
    prompt:
      'Rotate the point (−2, 3) by 180° about the origin. What are its new coordinates? Enter as (x, y).',
    answers: ['(2, -3)', '2, -3', '2,-3'],
    hint: 'The 180° rule is (x, y) → (−x, −y): just flip the sign of both numbers.',
    why: 'For 180°, (x, y) → (−x, −y). With (−2, 3): −(−2) = 2 and −(3) = −3, so the image is (2, −3).',
    variants: [
      {
        prompt: 'Rotate the point (5, 1) by 180° about the origin. New coordinates? Enter as (x, y).',
        answers: ['(-5, -1)', '-5, -1', '-5,-1'],
        hint: 'Negate both coordinates.',
        why: '(5, 1) → (−5, −1).',
      },
      {
        prompt: 'Rotate the point (−4, −2) by 180° about the origin. New coordinates? Enter as (x, y).',
        answers: ['(4, 2)', '4, 2', '4,2'],
        hint: 'Negate both coordinates; two negatives become positive.',
        why: '(−4, −2) → (4, 2).',
      },
    ],
  },
  {
    id: 'check-3',
    title: 'Question 3 of 3',
    prompt:
      'Rotate the point (1, 4) by 270° counterclockwise about the origin. What are its new coordinates? Enter as (x, y).',
    answers: ['(4, -1)', '4, -1', '4,-1'],
    hint: 'The 270° rule is (x, y) → (y, −x): swap the numbers, then negate the new second coordinate.',
    why: 'For 270°, (x, y) → (y, −x). With (1, 4): the new x is 4 (that is y) and the new y is −1 (that is −x), so the image is (4, −1).',
    variants: [
      {
        prompt:
          'Rotate the point (3, 2) by 270° counterclockwise about the origin. New coordinates? Enter as (x, y).',
        answers: ['(2, -3)', '2, -3', '2,-3'],
        hint: 'Use (x, y) → (y, −x).',
        why: '(3, 2) → (2, −3): the new x is 2 (y) and the new y is −3 (−x).',
      },
      {
        prompt:
          'Rotate the point (−2, 5) by 270° counterclockwise about the origin. New coordinates? Enter as (x, y).',
        answers: ['(5, 2)', '5, 2', '5,2'],
        hint: 'Use (x, y) → (y, −x); remember −(−2) = 2.',
        why: '(−2, 5) → (5, −(−2)) = (5, 2).',
      },
    ],
  },
]

export const rotationsPracticeSteps: LessonStep[] = [
  {
    id: 'practice-rotate-90',
    type: 'rotate-shape',
    title: 'Practice: spin a point 90°',
    prompt: 'Tap the rotation that turns the point 90° counterclockwise about the origin onto the dashed image.',
    shape: [[5, 2]],
    degrees: 90,
    insight: 'The point stayed the same distance from the origin — it just swept a quarter turn around it.',
    why: '90° sends (x, y) → (−y, x), so (5, 2) → (−2, 5).',
    hint: 'A quarter turn counterclockwise is 90°. Use (x, y) → (−y, x).',
  },
  {
    id: 'practice-mc-270',
    type: 'multiple-choice',
    title: 'Practice: name the 270° image',
    prompt: 'Rotating (2, 1) by 270° counterclockwise about the origin gives which point?',
    options: ['(1, -2)', '(-1, 2)', '(-2, -1)', '(2, -1)'],
    correctIndex: 0,
    why: '270° sends (x, y) → (y, −x), so (2, 1) → (1, −2).',
    hint: 'For 270° use (x, y) → (y, −x): swap, then negate the new second coordinate.',
  },
  {
    id: 'practice-input-180',
    type: 'number-input',
    title: 'Practice: 180° turn',
    prompt: 'Rotate (−3, 4) by 180° about the origin. Enter the image as (x, y).',
    answers: ['(3, -4)', '3, -4', '3,-4'],
    inputLabel: 'image =',
    why: '180° sends (x, y) → (−x, −y), so (−3, 4) → (3, −4).',
    hint: 'A half turn negates both coordinates.',
  },
]

export const rotationsLesson: Lesson = {
  id: 'rotations-101',
  title: 'Rotations: Turn Around the Origin',
  description:
    'Spin points, segments, and shapes 90°, 180°, and 270° counterclockwise about the origin, and learn the coordinate rule behind every turn.',
  subject: 'Coordinate Geometry',
  order: 4,
  region: 'Spin City',
  icon: '🔄',
  estimatedMinutes: 9,
  lessonCheck: rotationsLessonCheck,
  practiceSteps: rotationsPracticeSteps,
  steps: [
    // ── Part 1: The quarter turn (90°) ───────────────────────────────────────
    {
      id: 'concept-90',
      type: 'concept',
      title: 'The quarter turn: 90°',
      body:
        'A rotation spins a figure around a fixed point — here always the origin (0, 0) — without changing its size or shape. Spinning a quarter turn counterclockwise is 90°. The coordinate rule is (x, y) → (−y, x): swap the two numbers, then make the new first coordinate negative. Below, P (4, 2) turns 90° to land on P′ (−2, 4) — same distance from the origin, just swung a quarter of the way around.',
      graph: {
        range: 6,
        points: [
          { x: 4, y: 2, color: '#38bdf8', label: 'P' },
          { x: -2, y: 4, color: '#f472b6', label: "P'" },
        ],
      },
    },

    // ── Part 2: Half and three-quarter turns (180°, 270°) ────────────────────
    {
      id: 'concept-180-270',
      type: 'concept',
      title: 'Half and three-quarter turns: 180° and 270°',
      body:
        'Keep spinning counterclockwise. A half turn is 180°, with the rule (x, y) → (−x, −y): just flip the sign of both numbers. A three-quarter turn is 270°, with the rule (x, y) → (y, −x): swap the numbers, then make the new second coordinate negative. Here Q (3, 2) is shown with its 180° image (−3, −2) and its 270° image (2, −3).',
      graph: {
        range: 6,
        points: [
          { x: 3, y: 2, color: '#38bdf8', label: 'Q' },
          { x: -3, y: -2, color: '#f472b6', label: '180°' },
          { x: 2, y: -3, color: '#a78bfa', label: '270°' },
        ],
      },
    },

    // ── Part 3: Spin a point 90° ─────────────────────────────────────────────
    {
      id: 'rotate-point-90',
      type: 'rotate-shape',
      title: 'Spin the point 90°',
      prompt: 'Tap the rotation that turns the point onto the dashed image. Watch it sweep around the origin.',
      prediction: {
        question: 'Before you spin it: a 90° counterclockwise turn sends (4, 2) to which point?',
        options: ['(2, 4)', '(−2, 4)', '(4, −2)', '(−4, −2)'],
        correctIndex: 1,
        why: 'The 90° rule is (x, y) → (−y, x). With (4, 2) the new x is −2 and the new y is 4, giving (−2, 4).',
      },
      shape: [[4, 2]],
      degrees: 90,
      insight: 'A 90° turn swapped the coordinates and flipped one sign — the point never changed its distance from the origin.',
      why: '90° sends (x, y) → (−y, x), so (4, 2) → (−2, 4).',
      hint: 'A quarter turn counterclockwise is 90°. Use (x, y) → (−y, x).',
    },

    // ── Part 4: Name a 90° image ─────────────────────────────────────────────
    {
      id: 'mc-90-rule',
      type: 'multiple-choice',
      title: 'Apply the 90° rule',
      prompt: 'Rotating (2, 3) by 90° counterclockwise about the origin gives which point?',
      options: ['(3, 2)', '(−3, 2)', '(3, −2)', '(−2, −3)'],
      correctIndex: 1,
      why: '90° sends (x, y) → (−y, x). With (2, 3): the new x is −3 and the new y is 2, so the image is (−3, 2).',
      hint: 'Swap the numbers, then negate the new first coordinate: (x, y) → (−y, x).',
    },

    // ── Part 5: Spin a segment 180° ──────────────────────────────────────────
    {
      id: 'rotate-segment-180',
      type: 'rotate-shape',
      title: 'Spin the segment 180°',
      prompt: 'Tap the rotation that lands the segment on its dashed image — a half turn about the origin.',
      shape: [
        [2, 1],
        [5, 3],
      ],
      degrees: 180,
      insight: 'Both endpoints flipped to the opposite side of the origin, yet the segment kept its exact length.',
      why: '180° sends (x, y) → (−x, −y), so (2, 1) → (−2, −1) and (5, 3) → (−5, −3).',
      hint: 'A half turn is 180°. Negate both coordinates of every endpoint.',
    },

    // ── Part 6: Apply the 180° rule ──────────────────────────────────────────
    {
      id: 'input-180-rule',
      type: 'number-input',
      title: 'Apply the 180° rule',
      prompt: 'Rotate (−4, 1) by 180° about the origin. Enter the image as (x, y).',
      answers: ['(4, -1)', '4, -1', '4,-1'],
      inputLabel: 'image =',
      why: '180° sends (x, y) → (−x, −y). With (−4, 1): −(−4) = 4 and −(1) = −1, so the image is (4, −1).',
      hint: 'A half turn just flips the sign of both numbers.',
    },

    // ── Part 7: Spin a triangle 270° ─────────────────────────────────────────
    {
      id: 'rotate-triangle-270',
      type: 'rotate-shape',
      title: 'Spin the triangle 270°',
      prompt: 'Tap the rotation that turns the whole triangle onto its dashed image.',
      prediction: {
        question: 'A 270° counterclockwise turn sends the corner (1, 2) to which point?',
        options: ['(2, −1)', '(−2, 1)', '(−1, −2)', '(2, 1)'],
        correctIndex: 0,
        why: 'The 270° rule is (x, y) → (y, −x). With (1, 2) the new x is 2 and the new y is −1, giving (2, −1).',
      },
      shape: [
        [1, 2],
        [3, 2],
        [2, 4],
      ],
      degrees: 270,
      insight: 'All three corners followed the same three-quarter turn, so the triangle stays exactly the same size and shape.',
      why: '270° sends (x, y) → (y, −x), so (1, 2) → (2, −1), (3, 2) → (2, −3), and (2, 4) → (4, −2).',
      hint: 'Three-quarter turn counterclockwise is 270°. Use (x, y) → (y, −x) on each corner.',
    },

    // ── Wrap up ──────────────────────────────────────────────────────────────
    {
      id: 'complete',
      type: 'complete',
      title: 'Lesson complete!',
      message:
        'You spun points, a segment, and a triangle 90°, 180°, and 270° counterclockwise about the origin, and applied the coordinate rule for each turn.',
      discovery:
        'Counterclockwise about the origin: 90° sends (x, y) → (−y, x), 180° sends (x, y) → (−x, −y), and 270° sends (x, y) → (y, −x). Every rotation keeps a figure the same size and shape and the same distance from the origin — only its direction around the center changes.',
    },
  ],
}
