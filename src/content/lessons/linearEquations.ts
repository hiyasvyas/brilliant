import type { Lesson } from '../../types/lesson'

export const linearEquationsLesson: Lesson = {
  id: 'linear-equations',
  title: 'Linear Equations & Graphs',
  description:
    'Solve one-variable equations, then graph lines with slope and intercept.',
  subject: 'Linear Equations & Inequalities',
  order: 2,
  region: 'Linear Mountain',
  icon: '⛰️',
  estimatedMinutes: 12,
  steps: [
    {
      id: 'conf-1',
      type: 'confidence',
      title: 'Quick check',
      question: 'Have you solved equations like 2x + 3 = 11 before?',
    },
    {
      id: 'explore-numberline',
      type: 'number-line',
      title: 'Explore: moving on a number line',
      prompt:
        'Before equations, get a feel for adding and subtracting. Start at 3 and move so you land on −2. (That is the same as adding −5.)',
      start: 3,
      target: -2,
      min: -6,
      max: 6,
      insight: 'Notice: moving left is just adding a negative — every step left is −1.',
      why: 'Moving from 3 down to −2 is a change of −5: 3 + (−5) = −2.',
      hint: 'Each step left subtracts 1. How many steps from 3 to −2?',
    },
    {
      id: 'predict-balance',
      type: 'multiple-choice',
      title: 'Predict first',
      prompt:
        "You're about to balance 2x + 4 = 10 on a scale. If you remove 4 from only the left side, what do you think happens?",
      options: [
        'The scale tips — it is no longer balanced',
        'Nothing — it stays balanced',
        'x instantly becomes 10',
      ],
      correctIndex: 0,
      insight: 'Whatever you do to one side, you must do to the other. That single rule solves every linear equation.',
      why: 'Removing from just one side breaks the balance. To keep it level you must do the same thing to both sides — that is the whole trick to solving equations. Try it on the next screen.',
      hint: 'A scale only stays level if both pans change by the same amount.',
    },
    {
      id: 'balance-explore',
      type: 'balance-scale',
      title: 'Discover: keep the scale balanced',
      prompt:
        'This scale shows 2x + 4 = 10. Remove the same amount from both sides, then split evenly, and watch what x must be.',
      coeff: 2,
      constant: 4,
      total: 10,
      insight: 'Same move on both sides, every time: subtract to clear the extras, then divide to split x. The balance never breaks.',
      why: 'Subtract 4 from both sides: 2x = 6. Divide both sides by 2: x = 3.',
      hint: 'First subtract the 4 unit-blocks from both sides, then divide both sides by 2.',
    },
    {
      id: 'concept-solve',
      type: 'concept',
      title: 'Why that works',
      body:
        'Removing the same amount from both sides keeps an equation balanced — just like a scale. To solve a linear equation, undo what was done to x: subtract or add to move constants, then divide to isolate x. For 2x + 3 = 11: subtract 3 to get 2x = 8, then divide by 2 to get x = 4.',
    },
    {
      id: 'solve-1',
      type: 'balance-scale',
      title: 'Solve for x',
      prompt:
        'Solve 2x + 3 = 11 on the scale. Subtract from both sides to clear the units, then divide both sides to find x.',
      coeff: 2,
      constant: 3,
      total: 11,
      insight: 'Undo in reverse order: the +3 comes off first, then undo the ×2 by dividing. The scale stays level the whole time.',
      why: 'Subtract 3 from both sides: 2x = 8. Divide both sides by 2: x = 4.',
      hint: 'First subtract the 3 unit-blocks from both sides, then divide both sides by 2.',
    },
    {
      id: 'solve-2',
      type: 'balance-scale',
      title: 'One more',
      prompt:
        'Now balance 3x + 2 = 11. Same moves: clear the units from both sides, then split evenly into 3.',
      coeff: 3,
      constant: 2,
      total: 11,
      insight: 'Same two moves, new numbers — clear the constant, then divide. The recipe never changes.',
      why: 'Subtract 2 from both sides: 3x = 9. Divide both sides by 3: x = 3.',
      hint: 'Subtract the 2 unit-blocks from both sides first, then divide both sides by 3.',
    },
    {
      id: 'predict-slope',
      type: 'multiple-choice',
      title: 'Predict first',
      prompt:
        "Next you'll drag one end of a line to make it steeper. As it gets steeper, what do you think happens to the rise ÷ run number below it?",
      options: ['It gets bigger', 'It gets smaller', 'It stays the same'],
      correctIndex: 0,
      insight: 'Steeper line, bigger rise ÷ run. Keep an eye on that number as you drag next.',
      why: 'A steeper line climbs more for the same run, so rise ÷ run grows. You are about to watch it happen.',
      hint: 'Steeper means more vertical climb for each step to the right.',
    },
    {
      id: 'slope-discovery-1',
      type: 'slope-discovery',
      title: 'Discover: what makes a line steep?',
      prompt:
        'One end of this line is pinned at the origin. Drag the other end around. Watch the number that appears below — what do you think it measures? Then dial it until it reads exactly 2.',
      fixed: [0, 0],
      movable: [3, 0],
      targetSlope: 2,
      insight: 'Double the rise and the number doubles too. That number is how much y changes for each step in x.',
      why: 'The number is rise ÷ run — it grows as the line gets steeper. Climbing to (1, 2) or (2, 4) gives 2 ÷ 1 = 2.',
      hint: 'Rise ÷ run must equal 2. Try rising 2 for every 1 step right, like the point (1, 2).',
    },
    {
      id: 'concept-graph',
      type: 'concept',
      title: 'Now it has a name: slope',
      body:
        'That number you just dialed in has a name: the slope, written m. It measures steepness as rise ÷ run — bigger number, steeper line. Every line can be written y = mx + b, where b is the y-intercept: where the line crosses the y-axis. The line below is y = 2x + 1 — slope 2 (rises 2 for every 1 right), crossing the y-axis at 1.',
      graph: {
        lines: [{ m: 2, b: 1, color: '#38bdf8', label: 'y = 2x + 1' }],
        points: [{ x: 0, y: 1, color: '#fbbf24', label: 'b = 1' }],
      },
    },
    {
      id: 'mc-slope',
      type: 'multiple-choice',
      title: 'Spot the slope',
      prompt: 'You named it above. In the equation y = 3x − 2, what is the slope?',
      options: ['3', '−2', 'x', '1'],
      correctIndex: 0,
      insight: 'The number stuck to x is always the slope — you can read it straight off the equation, no graph needed.',
      why: 'In y = mx + b, the slope m is the number multiplying x, which is 3.',
      hint: 'The slope is the number multiplying x — the same rise ÷ run you discovered.',
    },
    {
      id: 'line-build-1',
      type: 'line-builder',
      title: 'Build the line',
      prompt:
        'Now use the Slope and Intercept buttons to build y = 2x + 1 so it matches the dashed target.',
      target: { m: 2, b: 1 },
      start: { m: 0, b: 0 },
      insight: 'Slope tilts the line; intercept slides it up and down. Just two numbers describe any line.',
      why: 'A slope of 2 makes the line rise 2 per step right; an intercept of 1 lifts it to cross the y-axis at 1.',
      hint: 'Raise the slope to 2 so the line tilts up, then raise the intercept to 1.',
    },
    {
      id: 'word-1',
      type: 'move-point',
      title: 'Real-world line',
      prompt:
        'A candle is 6 cm tall and burns down 1 cm each hour, so its height is y = −x + 6. Drag the point onto the dashed line to show the candle’s height after 4 hours (x = 4).',
      start: [0, 6],
      target: [4, 2],
      line: { m: -1, b: 6 },
      lineLabel: 'y = −x + 6',
      insight: 'At x = 4 the line gives y = 2 — the candle is 2 cm tall. Reading a real-world line is just substituting the input.',
      why: 'y = −(4) + 6 = 2, so after 4 hours the candle is 2 cm tall — the point (4, 2).',
      hint: 'Move right to x = 4, then up or down until the point sits exactly on the dashed line.',
    },
    {
      id: 'complete',
      type: 'complete',
      title: 'Lesson complete!',
      message:
        'You solved linear equations and built a line from its slope and intercept.',
      discovery:
        'Doing the same thing to both sides keeps an equation balanced — and a line is fully described by its slope and intercept.',
    },
  ],
  lessonCheck: [
    {
      id: 'lc-1',
      title: 'Question 1 of 3',
      prompt: 'Solve: 4x + 1 = 13. What is x?',
      answers: ['3', 'x=3'],
      hint: 'Subtract 1, then divide by 4.',
      why: '4x = 12, so x = 3.',
      variants: [
        {
          prompt: 'Solve: 3x + 2 = 17. What is x?',
          answers: ['5', 'x=5'],
          hint: 'Subtract 2 from both sides, then divide by 3.',
          why: '3x = 15, so x = 5.',
        },
        {
          prompt: 'Solve: 5x − 4 = 11. What is x?',
          answers: ['3', 'x=3'],
          hint: 'Add 4 to both sides first, then divide by 5.',
          why: '5x = 15, so x = 3.',
        },
      ],
    },
    {
      id: 'lc-2',
      title: 'Question 2 of 3',
      prompt: 'In y = −2x + 5, what is the y-intercept?',
      answers: ['5'],
      hint: 'The y-intercept is b in y = mx + b.',
      why: 'b = 5, so the line crosses the y-axis at 5.',
      variants: [
        {
          prompt: 'In y = 3x − 7, what is the y-intercept?',
          answers: ['-7', '−7'],
          hint: 'The y-intercept is the constant b, including its sign.',
          why: 'b = −7, so the line crosses the y-axis at −7.',
        },
        {
          prompt: 'In y = −x + 2, what is the slope?',
          answers: ['-1', '−1'],
          hint: 'The slope is m, the number multiplying x. −x means −1x.',
          why: 'The coefficient of x is −1, so the slope is −1.',
        },
      ],
    },
    {
      id: 'lc-3',
      title: 'Question 3 of 3',
      prompt:
        'A gym charges $20 to join plus $10 per month (y = 10x + 20). What is the total after 4 months?',
      answers: ['60', '$60'],
      hint: 'Substitute x = 4 into y = 10x + 20.',
      why: 'y = 10(4) + 20 = 40 + 20 = 60 dollars.',
      variants: [
        {
          prompt:
            'A plan costs $15 to start plus $5 per month (y = 5x + 15). What is the total after 6 months?',
          answers: ['45', '$45'],
          hint: 'Substitute x = 6 into y = 5x + 15.',
          why: 'y = 5(6) + 15 = 30 + 15 = 45 dollars.',
        },
        {
          prompt:
            'A taxi charges $3 to start plus $2 per mile (y = 2x + 3). What is the cost after 7 miles?',
          answers: ['17', '$17'],
          hint: 'Substitute x = 7 into y = 2x + 3.',
          why: 'y = 2(7) + 3 = 14 + 3 = 17 dollars.',
        },
      ],
    },
  ],
  practiceSteps: [
    {
      id: 'p-solve',
      type: 'balance-scale',
      title: 'Practice: Balance to solve',
      prompt:
        'Solve 3x + 3 = 12 on the scale. Clear the units from both sides, then divide both sides by 3.',
      coeff: 3,
      constant: 3,
      total: 12,
      why: 'Subtract 3 from both sides: 3x = 9. Divide both sides by 3: x = 3.',
      hint: 'Subtract the 3 unit-blocks from both sides, then divide both sides by 3.',
    },
    {
      id: 'p-line',
      type: 'line-builder',
      title: 'Practice: Build the line',
      prompt: 'Build the line y = −1x + 2 to match the target.',
      target: { m: -1, b: 2 },
      start: { m: 0, b: 0 },
      why: 'A slope of −1 tilts the line down; an intercept of 2 lifts it to cross at 2.',
      hint: 'Lower the slope below zero, then raise the intercept to 2.',
    },
    {
      id: 'p-mc',
      type: 'multiple-choice',
      title: 'Practice: Slope',
      prompt: 'What is the slope of y = −4x + 1?',
      options: ['−4', '1', '4', 'x'],
      correctIndex: 0,
      why: 'The coefficient of x is −4.',
      hint: 'Look at the number multiplying x.',
    },
  ],
}
