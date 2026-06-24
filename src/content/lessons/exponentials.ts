import type { Lesson } from '../../types/lesson'

export const exponentialsLesson: Lesson = {
  id: 'exponentials',
  title: 'Exponential Models',
  description:
    'Model growth and decay with y = a·bˣ and apply it to real-life situations.',
  subject: 'Exponential Models',
  order: 7,
  region: 'Exponential Heights',
  icon: '🚀',
  estimatedMinutes: 10,
  steps: [
    {
      id: 'conf-1',
      type: 'confidence',
      title: 'Quick check',
      question: 'Have you seen something double again and again, like 2, 4, 8, 16?',
    },
    {
      id: 'concept-growth',
      type: 'concept',
      title: 'Exponential growth',
      body:
        'An exponential function is y = a·bˣ. Here a is the starting amount and b is the growth factor. When b > 1, the output grows faster and faster. The curve below is y = 2ˣ — it doubles every step.',
      graph: {
        exponentials: [{ a: 1, b: 2, color: '#a78bfa' }],
        points: [{ x: 0, y: 1, color: '#fbbf24', label: 'start (0, 1)' }],
      },
    },
    {
      id: 'mc-growth',
      type: 'multiple-choice',
      title: 'Spot the growth',
      prompt: 'Which function shows exponential growth?',
      options: ['y = 2·3ˣ', 'y = 2·0.5ˣ', 'y = 2x + 3', 'y = 5'],
      correctIndex: 0,
      why: 'Growth needs a base b > 1; here b = 3, so y = 2·3ˣ grows.',
      hint: 'Growth needs the base to be bigger than 1.',
    },
    {
      id: 'eval-1',
      type: 'number-input',
      title: 'Evaluate growth',
      prompt: 'For y = 2ˣ, what is the value when x = 3?',
      answers: ['8'],
      inputLabel: 'y =',
      why: '2³ = 2·2·2 = 8.',
      hint: 'Multiply 2 by itself three times.',
    },
    {
      id: 'eval-2',
      type: 'number-input',
      title: 'A starting amount',
      prompt:
        'A colony starts at 5 and doubles each hour: y = 5·2ˣ. How many are there at x = 2 hours?',
      answers: ['20'],
      inputLabel: 'y =',
      why: 'y = 5·2² = 5·4 = 20.',
      hint: 'First find 2², then multiply by 5.',
    },
    {
      id: 'concept-decay',
      type: 'concept',
      title: 'Exponential decay',
      body:
        'When the base b is between 0 and 1, the output shrinks toward zero — this is decay. For example y = 8·(1/2)ˣ halves each step: 8, 4, 2, 1, … Half-life problems use exactly this idea.',
      graph: {
        exponentials: [{ a: 4, b: 0.5, color: '#f97316' }],
      },
    },
    {
      id: 'mc-decay',
      type: 'multiple-choice',
      title: 'Name the pattern',
      prompt: 'The half-life of a medicine in your body is an example of…',
      options: ['exponential decay', 'exponential growth', 'a straight line', 'a parabola'],
      correctIndex: 0,
      why: 'Halving repeatedly is exponential decay (base between 0 and 1).',
      hint: 'The amount keeps shrinking by half.',
    },
    {
      id: 'complete',
      type: 'complete',
      title: 'Lesson complete!',
      message: 'You modeled growth and decay with exponential functions.',
      discovery:
        'In y = a·bˣ the base b decides everything: b > 1 grows faster and faster, while 0 < b < 1 decays toward zero.',
    },
  ],
  lessonCheck: [
    {
      id: 'lc-1',
      title: 'Question 1 of 3',
      prompt: 'For y = 3ˣ, what is the value when x = 2?',
      answers: ['9'],
      hint: '3² = 3·3.',
      why: '3² = 9.',
      variants: [
        {
          prompt: 'For y = 2ˣ, what is the value when x = 4?',
          answers: ['16'],
          hint: '2⁴ = 2·2·2·2.',
          why: '2⁴ = 16.',
        },
        {
          prompt: 'For y = 5ˣ, what is the value when x = 2?',
          answers: ['25'],
          hint: '5² = 5·5.',
          why: '5² = 25.',
        },
      ],
    },
    {
      id: 'lc-2',
      title: 'Question 2 of 3',
      prompt: 'A balance is y = 100·2ˣ (doubling). What is it at x = 3?',
      answers: ['800', '$800'],
      hint: 'Find 2³ first, then multiply by 100.',
      why: 'y = 100·2³ = 100·8 = 800.',
      variants: [
        {
          prompt: 'A balance is y = 50·2ˣ (doubling). What is it at x = 3?',
          answers: ['400', '$400'],
          hint: 'Find 2³ = 8 first, then multiply by 50.',
          why: 'y = 50·2³ = 50·8 = 400.',
        },
        {
          prompt: 'A balance is y = 10·3ˣ (tripling). What is it at x = 2?',
          answers: ['90', '$90'],
          hint: 'Find 3² = 9 first, then multiply by 10.',
          why: 'y = 10·3² = 10·9 = 90.',
        },
      ],
    },
    {
      id: 'lc-3',
      title: 'Question 3 of 3',
      prompt:
        'In y = a·bˣ, what kind of change happens when b is between 0 and 1? (growth or decay)',
      answers: ['decay'],
      hint: 'A base under 1 makes the output shrink.',
      why: 'A base between 0 and 1 produces exponential decay.',
      variants: [
        {
          prompt: 'In y = a·bˣ, what kind of change happens when b is greater than 1? (growth or decay)',
          answers: ['growth'],
          hint: 'A base bigger than 1 makes the output get larger.',
          why: 'A base greater than 1 produces exponential growth.',
        },
        {
          prompt:
            'A population follows y = 200·(0.5)ˣ. Because the base is 0.5, is this growth or decay?',
          answers: ['decay'],
          hint: '0.5 is between 0 and 1, so each step halves the amount.',
          why: 'The base 0.5 is under 1, so the population shrinks — exponential decay.',
        },
      ],
    },
  ],
  practiceSteps: [
    {
      id: 'p-eval',
      type: 'number-input',
      title: 'Practice: Evaluate',
      prompt: 'For y = 4ˣ, what is the value when x = 2?',
      answers: ['16'],
      inputLabel: 'y =',
      why: '4² = 16.',
      hint: 'Multiply 4 by itself.',
    },
    {
      id: 'p-mc',
      type: 'multiple-choice',
      title: 'Practice: Growth or decay',
      prompt: 'Which function shows decay?',
      options: ['y = 6·0.5ˣ', 'y = 6·2ˣ', 'y = 6x', 'y = 6'],
      correctIndex: 0,
      why: 'A base of 0.5 (between 0 and 1) means the output shrinks.',
      hint: 'Decay needs a base under 1.',
    },
  ],
}
