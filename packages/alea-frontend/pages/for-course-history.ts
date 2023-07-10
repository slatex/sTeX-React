interface Course {
  name: string;
  description: string;
}

export const COURSE_DESCRIPTIONS: { [courseId: string]: Course } = {
  AI: {
    name: 'Artiticial Intelligence',
    description:
      'A course that introduces the foundation of symbolic and statistical Artifical Intelligence',
  },
  EDU: {
    name: 'Educational Concepts',
    description:
      'Concepts pertainin to understanding the learner like learner model, guided tour, competency etc.',
  },
  EIDA: {
    name: 'Data Structures and Algorithms',
    description:
      'A course that introduces mathematical modeling of computational problems, as well as common algorithms, algorithmic paradigms, and data structures used to solve these problems.',
  },
  GDP: {
    name: '',
    description: '',
  },
  GENERAL: {
    name: 'General knowledge',
    description: 'Misc items such as time, distance, currency, units',
  },
  GLOIN: {
    name: '',
    description: '',
  },
  LinAlg: {
    name: 'Linear Algebra',
    description: '',
  },
  Calc: {
    name: 'Calculus',
    description: '',
  },
  School: {
    name: 'School',
    description: '',
  },
  TheoCS: {
    name: 'Theoretical Computer Science',
    description:
      'A course on the basic theoretical computer science. It covers formal languages, finite automata, grammars, the theory of computation, Turing machines, and the basics of complexity theory.',
  },
  'Math:stochastics': {
    name: 'Stochastics',
    description: '',
  },
};

export const TO_EXCLUDE = ['AI', 'EDU', 'GENERAL', 'School'];
