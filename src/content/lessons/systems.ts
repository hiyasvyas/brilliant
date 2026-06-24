import type { Lesson } from '../../types/lesson'

export const systemsLesson: Lesson = {
  id: 'systems',
  title: 'Systems of Equations',
  description:
    'Find where two lines meet using graphs, substitution, and elimination.',
  subject: 'Systems of Equations & Inequalities',
  order: 4,
  region: 'System Caves',
  icon: '🕳️',
  estimatedMinutes: 11,
  steps: [
    {
      id: 'conf-1',
      type: 'confidence',
      title: 'Quick check',
      question: 'Have you solved two equations at the same time before?',
    },
    {
      id: 'concept-system',
      type: 'concept',
      title: 'What is a system?',
      body:
        'A system is two or more equations you solve together. The solution is the point that works in every equation. Graphically, it is where the lines cross. Below, y = x + 1 and y = −x + 3 cross at one point.',
      graph: {
        lines: [
          { m: 1, b: 1, color: '#38bdf8', label: 'y = x + 1' },
          { m: -1, b: 3, color: '#f97316', label: 'y = −x + 3' },
        ],
        points: [{ x: 1, y: 2, color: '#fbbf24', label: '(1, 2)' }],
      },
    },
    {
      id: 'graph-solve',
      type: 'number-input',
      title: 'Read the intersection',
      prompt:
        'The two lines y = x + 1 and y = −x + 3 cross at one point. What are its coordinates? Enter as (x, y).',
      answers: ['(1, 2)', '1,2'],
      graph: {
        lines: [
          { m: 1, b: 1, color: '#38bdf8', label: 'y = x + 1' },
          { m: -1, b: 3, color: '#f97316', label: 'y = −x + 3' },
        ],
      },
      why: 'The lines meet at (1, 2): 2 = 1 + 1 and 2 = −1 + 3 both work.',
      hint: 'Find the dot where the two lines overlap.',
    },
    {
      id: 'concept-sub',
      type: 'concept',
      title: 'Substitution',
      body:
        'In substitution, solve one equation for a variable and plug it into the other. For y = 2x and x + y = 6, replace y with 2x: x + 2x = 6, so 3x = 6 and x = 2. Then y = 2(2) = 4.',
    },
    {
      id: 'sub-1',
      type: 'number-input',
      title: 'Solve by substitution',
      prompt:
        'Solve the system y = 2x and x + y = 6. Enter the solution as (x, y).',
      answers: ['(2, 4)', '2,4'],
      why: 'x + 2x = 6 gives x = 2, then y = 2(2) = 4, so (2, 4).',
      hint: 'Replace y with 2x in the second equation.',
    },
    {
      id: 'concept-elim',
      type: 'concept',
      title: 'Elimination',
      body:
        'In elimination, add or subtract the equations to cancel a variable. For x + y = 5 and x − y = 1, add them: 2x = 6, so x = 3. Then y = 2. Lines that never cross are parallel — they have the same slope but different intercepts, and the system has no solution.',
      graph: {
        lines: [
          { m: 1, b: 0, color: '#38bdf8', label: 'y = x' },
          { m: 1, b: 3, color: '#f97316', label: 'y = x + 3' },
        ],
      },
    },
    {
      id: 'elim-1',
      type: 'number-input',
      title: 'Solve by elimination',
      prompt: 'Solve x + y = 5 and x − y = 1. Enter the solution as (x, y).',
      answers: ['(3, 2)', '3,2'],
      why: 'Adding the equations: 2x = 6 so x = 3, then 3 + y = 5 gives y = 2.',
      hint: 'Add the two equations so the y terms cancel.',
    },
    {
      id: 'mc-parallel',
      type: 'multiple-choice',
      title: 'No solution',
      prompt: 'A system has no solution when the two lines are…',
      options: [
        'parallel (same slope, different intercept)',
        'the same line',
        'crossing at the origin',
        'perpendicular',
      ],
      correctIndex: 0,
      why: 'Parallel lines never meet, so there is no point that satisfies both.',
      hint: 'Think about lines that never touch.',
    },
    {
      id: 'complete',
      type: 'complete',
      title: 'Lesson complete!',
      message: 'You solved systems by graphing, substitution, and elimination.',
      discovery:
        'The solution to a system is the point where the lines cross — and parallel lines never cross, so there is no solution.',
    },
  ],
  lessonCheck: [
    {
      id: 'lc-1',
      title: 'Question 1 of 3',
      prompt: 'Solve y = 3x and x + y = 8. Enter as (x, y).',
      answers: ['(2, 6)', '2,6'],
      hint: 'Substitute 3x for y: x + 3x = 8.',
      why: '4x = 8 gives x = 2, then y = 3(2) = 6.',
      variants: [
        {
          prompt: 'Solve y = 2x and x + y = 9. Enter as (x, y).',
          answers: ['(3, 6)', '3,6'],
          hint: 'Substitute 2x for y: x + 2x = 9.',
          why: '3x = 9 gives x = 3, then y = 2(3) = 6.',
        },
        {
          prompt: 'Solve y = 4x and x + y = 10. Enter as (x, y).',
          answers: ['(2, 8)', '2,8'],
          hint: 'Substitute 4x for y: x + 4x = 10.',
          why: '5x = 10 gives x = 2, then y = 4(2) = 8.',
        },
      ],
    },
    {
      id: 'lc-2',
      title: 'Question 2 of 3',
      prompt: 'Solve x + y = 10 and x − y = 2. Enter as (x, y).',
      answers: ['(6, 4)', '6,4'],
      hint: 'Add the equations to cancel y.',
      why: '2x = 12 gives x = 6, then 6 + y = 10 gives y = 4.',
      variants: [
        {
          prompt: 'Solve x + y = 12 and x − y = 4. Enter as (x, y).',
          answers: ['(8, 4)', '8,4'],
          hint: 'Add the two equations so y cancels.',
          why: '2x = 16 gives x = 8, then 8 + y = 12 gives y = 4.',
        },
        {
          prompt: 'Solve x + y = 7 and x − y = 1. Enter as (x, y).',
          answers: ['(4, 3)', '4,3'],
          hint: 'Add the equations to eliminate y, then solve for x.',
          why: '2x = 8 gives x = 4, then 4 + y = 7 gives y = 3.',
        },
      ],
    },
    {
      id: 'lc-3',
      title: 'Question 3 of 3',
      prompt:
        'Lines y = 2x + 1 and y = 2x − 4 have the same slope. How many solutions does this system have? (a number)',
      answers: ['0', 'none', 'zero'],
      hint: 'Same slope, different intercept means parallel.',
      why: 'Parallel lines never meet, so there are 0 solutions.',
      variants: [
        {
          prompt:
            'Lines y = −x + 3 and y = −x − 2 have the same slope. How many solutions does this system have? (a number)',
          answers: ['0', 'none', 'zero'],
          hint: 'Equal slopes but different intercepts means the lines are parallel.',
          why: 'These parallel lines never cross, so there are 0 solutions.',
        },
        {
          prompt:
            'Lines y = 2x + 1 and y = 2x + 1 are exactly the same line. How many solutions does this system have? (a number or "infinite")',
          answers: ['infinite', 'infinitely many', 'many'],
          hint: 'If both equations describe the same line, every point works.',
          why: 'Identical lines overlap everywhere, so there are infinitely many solutions.',
        },
      ],
    },
  ],
  practiceSteps: [
    {
      id: 'p-sub',
      type: 'number-input',
      title: 'Practice: Substitution',
      prompt: 'Solve y = x + 2 and x + y = 8. Enter as (x, y).',
      answers: ['(3, 5)', '3,5'],
      why: 'x + (x + 2) = 8 gives 2x = 6, x = 3, then y = 5.',
      hint: 'Replace y with x + 2.',
    },
    {
      id: 'p-elim',
      type: 'number-input',
      title: 'Practice: Elimination',
      prompt: 'Solve x + y = 7 and x − y = 3. Enter as (x, y).',
      answers: ['(5, 2)', '5,2'],
      why: 'Adding: 2x = 10 so x = 5, then y = 2.',
      hint: 'Add the equations together.',
    },
  ],
}
