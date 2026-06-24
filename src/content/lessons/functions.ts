import type { Lesson } from '../../types/lesson'

export const functionsLesson: Lesson = {
  id: 'functions',
  title: 'Functions: Notation, Domain & Range',
  description:
    'Read function notation, evaluate f(x), and tell linear, quadratic, and exponential apart.',
  subject: 'Functions',
  order: 3,
  region: 'Function Kingdom',
  icon: '👑',
  estimatedMinutes: 11,
  steps: [
    {
      id: 'conf-1',
      type: 'confidence',
      title: 'Quick check',
      question: 'Have you seen function notation like f(x) before?',
    },
    {
      id: 'machine-explore',
      type: 'function-machine',
      title: 'Discover: the mystery machine',
      prompt:
        'This machine turns inputs into outputs by a hidden rule. Adjust Multiply and Add until both examples come out right.',
      mult: 2,
      add: 1,
      examples: [
        { input: 3, output: 7 },
        { input: 5, output: 11 },
      ],
      why: 'The rule is ×2 then +1: 3·2 + 1 = 7 and 5·2 + 1 = 11.',
      hint: 'Try multiplying by 2 first, then see what you must add.',
    },
    {
      id: 'concept-function',
      type: 'concept',
      title: 'What is a function?',
      body:
        'That machine is a function: it takes an input and gives exactly one output. We write f(x), read "f of x". The input is x; the output is f(x). For example, if f(x) = 2x + 1, then plugging in x = 3 gives f(3) = 7.',
    },
    {
      id: 'mc-notation',
      type: 'multiple-choice',
      title: 'Reading notation',
      prompt: 'Which expression means "the output of f when the input is 3"?',
      options: ['f(3)', '3f', 'x3', 'f + 3'],
      correctIndex: 0,
      why: 'f(3) means substitute 3 for x in the function.',
      hint: 'The input goes inside the parentheses.',
    },
    {
      id: 'eval-1',
      type: 'number-input',
      title: 'Evaluate f(x)',
      prompt: 'Given f(x) = 2x + 1, find f(4).',
      answers: ['9', 'f(4)=9'],
      inputLabel: 'f(4) =',
      why: 'f(4) = 2(4) + 1 = 8 + 1 = 9.',
      hint: 'Replace every x with 4, then simplify.',
    },
    {
      id: 'eval-2',
      type: 'number-input',
      title: 'A squared input',
      prompt: 'Given f(x) = x² − 1, find f(3).',
      answers: ['8', 'f(3)=8'],
      inputLabel: 'f(3) =',
      why: 'f(3) = 3² − 1 = 9 − 1 = 8.',
      hint: 'Square the 3 first, then subtract 1.',
    },
    {
      id: 'concept-domain',
      type: 'concept',
      title: 'Domain and range',
      body:
        'The domain is all the inputs x you are allowed to use. The range is all the outputs the function can produce. For the straight line below, f(x) = 2x + 1, you can put in any number, so the domain is all real numbers.',
      graph: {
        lines: [{ m: 2, b: 1, color: '#38bdf8', label: 'f(x) = 2x + 1' }],
      },
    },
    {
      id: 'mc-domain',
      type: 'multiple-choice',
      title: 'Find the domain',
      prompt: 'What is the domain of f(x) = 2x + 1?',
      options: ['All real numbers', 'Only x > 0', 'Only x = 2', 'No values'],
      correctIndex: 0,
      why: 'You can substitute any real number for x in a linear function.',
      hint: 'Is there any number you cannot plug in?',
    },
    {
      id: 'concept-types',
      type: 'concept',
      title: 'Three families of functions',
      body:
        'Linear functions (y = mx + b) graph as straight lines. Quadratic functions (y = ax² + …) graph as parabolas. Exponential functions (y = a·bˣ) curve upward faster and faster. Compare the line, parabola, and curve below.',
      graph: {
        lines: [{ m: 1, b: 0, color: '#38bdf8', label: 'linear' }],
        parabolas: [{ h: 0, k: -3, a: 0.5, color: '#f97316' }],
        exponentials: [{ a: 1, b: 2, color: '#a78bfa' }],
      },
    },
    {
      id: 'mc-type',
      type: 'multiple-choice',
      title: 'Name that function',
      prompt: 'Which equation is a quadratic function?',
      options: ['y = x² + 1', 'y = 2x + 1', 'y = 3ˣ', 'y = 5'],
      correctIndex: 0,
      why: 'A quadratic has an x² term, like y = x² + 1.',
      hint: 'Look for a squared variable.',
    },
    {
      id: 'complete',
      type: 'complete',
      title: 'Lesson complete!',
      message: 'You read function notation, evaluated functions, and sorted them by family.',
      discovery:
        'A function is a machine: one input gives exactly one output, and f(x) is just notation for that output.',
    },
  ],
  lessonCheck: [
    {
      id: 'lc-1',
      title: 'Question 1 of 3',
      prompt: 'Given f(x) = 3x − 2, find f(5).',
      answers: ['13'],
      hint: 'Substitute 5 for x.',
      why: 'f(5) = 3(5) − 2 = 15 − 2 = 13.',
      variants: [
        {
          prompt: 'Given f(x) = 2x + 1, find f(6).',
          answers: ['13'],
          hint: 'Replace x with 6, then multiply and add.',
          why: 'f(6) = 2(6) + 1 = 12 + 1 = 13.',
        },
        {
          prompt: 'Given f(x) = 4x − 5, find f(3).',
          answers: ['7'],
          hint: 'Replace x with 3, then multiply and subtract.',
          why: 'f(3) = 4(3) − 5 = 12 − 5 = 7.',
        },
      ],
    },
    {
      id: 'lc-2',
      title: 'Question 2 of 3',
      prompt: 'Given f(x) = x² + 2, find f(4).',
      answers: ['18'],
      hint: 'Square 4 first, then add 2.',
      why: 'f(4) = 16 + 2 = 18.',
      variants: [
        {
          prompt: 'Given f(x) = x² − 1, find f(3).',
          answers: ['8'],
          hint: 'Square 3 first, then subtract 1.',
          why: 'f(3) = 9 − 1 = 8.',
        },
        {
          prompt: 'Given f(x) = x² + 2x, find f(2).',
          answers: ['8'],
          hint: 'Square 2, then add 2 times 2.',
          why: 'f(2) = 4 + 4 = 8.',
        },
      ],
    },
    {
      id: 'lc-3',
      title: 'Question 3 of 3',
      prompt: 'A parabola is the graph of which type of function? (linear, quadratic, or exponential)',
      answers: ['quadratic'],
      hint: 'Parabolas come from squared terms.',
      why: 'Quadratic functions graph as parabolas.',
      variants: [
        {
          prompt:
            'A straight line is the graph of which type of function? (linear, quadratic, or exponential)',
          answers: ['linear'],
          hint: 'A constant slope, like y = mx + b, draws a straight line.',
          why: 'Linear functions graph as straight lines.',
        },
        {
          prompt:
            'A curve that keeps rising faster and faster, like y = 2ˣ, is which type? (linear, quadratic, or exponential)',
          answers: ['exponential'],
          hint: 'The variable sits in the exponent.',
          why: 'Exponential functions graph as curves that grow faster and faster.',
        },
      ],
    },
  ],
  practiceSteps: [
    {
      id: 'p-eval',
      type: 'number-input',
      title: 'Practice: Evaluate',
      prompt: 'Given f(x) = 4x − 3, find f(2).',
      answers: ['5'],
      inputLabel: 'f(2) =',
      why: 'f(2) = 4(2) − 3 = 8 − 3 = 5.',
      hint: 'Multiply 4 by 2 first.',
    },
    {
      id: 'p-type',
      type: 'multiple-choice',
      title: 'Practice: Function family',
      prompt: 'Which equation is exponential?',
      options: ['y = 2ˣ', 'y = 2x', 'y = x²', 'y = x + 2'],
      correctIndex: 0,
      why: 'An exponential has the variable in the exponent, like 2ˣ.',
      hint: 'Where is the x — in the exponent?',
    },
  ],
}
