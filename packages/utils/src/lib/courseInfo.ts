export interface CourseInfo {
  courseId: string;
  courseName: string;
  notesArchive: string;
  notesFilepath: string;
  landingFilepath: string;
  notesLink: string;
  imageLink: string;
  courseHome: string;
  cardsLink: string;
  slidesLink: string;
  forumLink: string;
  quizzesLink: string;
  isCurrent: boolean;
  hasQuiz: boolean;
}

export function getSlidesLink(courseId: string) {
  return `/course-view/${courseId}`;
}

export function getForumLink(courseId: string) {
  return `/forum/${courseId}`;
}

export function getCardsLink(courseId: string) {
  return `/flash-cards/${courseId}`;
}

export function getCourseHome(courseId: string) {
  return `/course-home/${courseId}`;
}

export function getNotesLink(courseId: string) {
  return `/course-notes/${courseId}`;
}
export function getQuizzesLink(courseId: string) {
  return `/quiz-dash/${courseId}`;
}

export const CURRENT_TERM = 'WS23/24';

export function createCourseInfo(
  courseId: string,
  courseName: string,
  notesArchive: string,
  notesFilepath: string,
  landingFilepath: string,
  isCurrent = false,
  hasQuiz = false
): CourseInfo {
  notesFilepath = notesFilepath.replace('.tex', '.xhtml');

  // landing filepath is language specific.
  landingFilepath = landingFilepath.replace('.tex', '');
  return {
    courseId,
    courseName,
    imageLink: `/${courseId}.jpg`,
    notesArchive,
    notesFilepath,
    courseHome: getCourseHome(courseId),
    notesLink: getNotesLink(courseId),
    cardsLink: getCardsLink(courseId),
    slidesLink: getSlidesLink(courseId),
    forumLink: getForumLink(courseId),
    quizzesLink: getQuizzesLink(courseId),
    landingFilepath,
    isCurrent,
    hasQuiz,
  };
}

export const COURSES_INFO: { [courseId: string]: CourseInfo } = {
  'ai-1': createCourseInfo(
    'ai-1',
    'Artifical Intelligence - I',
    'MiKoMH/AI',
    'course/notes/notes1.tex',
    'course/notes/coursepage1.tex',
    true,
    true
  ),
  'ai-2': createCourseInfo(
    'ai-2',
    'Artifical Intelligence - II',
    'MiKoMH/AI',
    'course/notes/notes2.xhtml',
    'course/notes/coursepage2'
  ),
  'iwgs-1': createCourseInfo(
    'iwgs-1',
    'IWGS - I',
    'MiKoMH/IWGS',
    'course/notes/notes-part1.xhtml',
    'course/notes/coursepage1',
    true
  ),
  'iwgs-2': createCourseInfo(
    'iwgs-2',
    'IWGS - II',
    'MiKoMH/IWGS',
    'course/notes/notes-part2.xhtml',
    'course/notes/coursepage2'
  ),
  krmt: createCourseInfo(
    'krmt',
    'Knowledge Representation for Mathematical Theories',
    'MiKoMH/KRMT',
    'course/notes/notes.xhtml',
    'course/notes/coursepage'
  ),
  lbs: createCourseInfo(
    'lbs',
    'Logic-based Natural Language Semantics',
    'MiKoMH/LBS',
    'course/notes/notes.xhtml',
    'course/notes/coursepage',
    true
  ),
  gdp: createCourseInfo(
    'gdp',
    'Grundlagen der Programmierung',
    'courses/FAU/gdp',
    'course/notes/notes.de.xhtml',
    'course/notes/coursepage',
    true,
    true
  ),
};

export const MaAI_COURSES: {
  [courseId: string]: {
    courseName: string;
  };
} = {
  adl: { courseName: 'Advanced Deep Learning' },
  adp: { courseName: 'Advanced Design and Programming' },
  amric: { courseName: 'Advanced Mechanized Reasoning in Coq' },
  apt: { courseName: 'Advanced Programming Techniques' },
  aop: { courseName: 'Algebra of Programming' },
  aalaat: { courseName: 'Algebraic and Logical Aspects of Automata Theory' },
  ab: { courseName: 'Algorithmic Bioinformatics' },
  ac: { courseName: 'Approximate Computing' },
  'ai-1': { courseName: 'Artificial Intelligence I' },
  'ai-2': { courseName: 'Artificial Intelligence II' },
  aml: { courseName: 'Artificial Motor Learning' },
  bsa: { courseName: 'Biomedical Signal Analysis' },
  cnfad: { courseName: 'Cognitive Neuroscience for AI Developers' },
  cmri: { courseName: 'Computational Magnetic Resonance Imaging' },
  cntnn: {
    courseName: 'Computational Neurotechnology / Numerische Neurotechnologie',
  },
  cpc: { courseName: 'Computational Photography and Capture' },
  cvp: { courseName: 'Computational Visual Perception' },
  ca: { courseName: 'Computer Architecture' },
  caeue: { courseName: 'Computer Architecture' },
  cv: { courseName: 'Computer Vision' },
  camad: { courseName: 'Connected Mobility and Autonomous Driving' },
  dl: { courseName: 'Deep Learning' },
  dlofo: { courseName: 'Description Logic and Formal Ontologies' },
  es: { courseName: 'Eingebettete Systeme' },
  esmeu: { courseName: 'Eingebettete Systeme mit erweiterten Übungen' },
  fv: { courseName: 'Formal Verification' },
  hci: { courseName: 'Human Computer Interaction' },
  hrcad: { courseName: 'Human-Robot Co-Adaptation' },
  isf: { courseName: 'Inertial Sensor Fusion' },
  iv: { courseName: 'Informationsvisualisierung' },
  idaf: { courseName: 'Intent Detection and Feedback' },
  imip: { courseName: 'Interventional Medical Image Processing' },
  itdtp: { courseName: 'Introduction to Dependently Typed Programming' },
  iteml: { courseName: 'Introduction to Explainable Machine Learning' },
  up: { courseName: 'Kommunikation und parallele Prozesse' },
  lbrmtk: {
    courseName:
      'Logic-Based Representation of Mathematical/Technical Knowledge',
  },
  lbs: { courseName: 'Logik-Basierte Sprachverarbeitung' },
  mlftsd: { courseName: 'Machine Learning for Time Series Deluxe' },
  mlfts: { courseName: 'Machine Learning for Time Series' },
  mipfda: {
    courseName: 'Medical Image Processing for Diagnostic Applications',
  },
  made: { courseName: 'Methods of Advanced Data Engineering' },
  mcc: { courseName: 'Middleware - Cloud Computing' },
  mcce: { courseName: 'Middleware - Cloud Computing (EÜ)' },
  m: { courseName: 'Modallogik' },
  mp: { courseName: 'Monad-based Programming' },
  ms: { courseName: 'Multimedia Security' },
  mpa: { courseName: 'Music Processing Analysis' },
  nlics: { courseName: 'Nonclassical Logics in Computer Science' },
  ps: { courseName: 'Parallele Systeme' },
  pseu: { courseName: 'Parallele Systeme mit erweiterten Übungen' },
  pa: { courseName: 'Pattern Analysis' },
  pr: { courseName: 'Pattern Recognition' },
  pspl: { courseName: 'Practical Semantics of Programming Languages' },
  rl: { courseName: 'Reinforcement Learning' },
  slp: { courseName: 'Speech and Language Processing' },
  slu: { courseName: 'Speech and Language Understanding' },
  si: { courseName: 'Swarm Intelligence' },
  vds: { courseName: 'Verifikation digitaler Systeme' },
  vs: { courseName: 'Verteilte Systeme' },
  vseu: { courseName: 'Verteilte Systeme erweiterte Übungen' },
  vcm: { courseName: 'Visual Computing in Medicine' },
  wuruv: { courseName: 'Wissensrepräsentation und -verarbeitung' },
  ai1sp: { courseName: 'AI 1 Systems Project' },
  ai2sp: { courseName: 'AI 2 Systems Project' },
  'ai-cvp': { courseName: 'AI Project: Computational Visual Perception' },
  'bia-project': { courseName: 'Biomedical Image Analysis Project' },
  'ci-project': { courseName: 'Computational Imaging Project' },
  'cfdla-project': {
    courseName: 'Computer Architechtures for Deep Learning Applications',
  },
  'fabrication-project': { courseName: 'Fabrication Project' },
  'hrr-project': {
    courseName: 'Hands on Rehabilitation and Assistive Robotics',
  },
  'iwuc-project': {
    courseName: 'Innovationslabor für Wearable und Ubiquitous Computing',
  },
  'iss-lab': { courseName: 'Intelligent Sensorimotor Systems Lab' },
  ivp: { courseName: 'Interactive Visualization Project' },
  'llor-deluxe': { courseName: 'Legged Locomotion of Robots Deluxe' },
  'mpdm-project': { courseName: 'Master Projekt Datenmanagement' },
  'nt-project': { courseName: 'Neurotechnology Project' },
  'bmns-project': { courseName: 'Project Biomedical Network Science' },
  'cv-project': { courseName: 'Project Computer Vision' },
  'dr-project': { courseName: 'Project Digital Reality' },
  'iiml-project': {
    courseName: 'Project Intraoperative Imaging and Machine Learning',
  },
  'map-project': { courseName: 'Project Music and Audio Processing' },
  'aai-fa-project': {
    courseName:
      'Project on Applied AI in Factory Automation and Production Systems',
  },
  'rl-project': { courseName: 'Project Representation Learning' },
  'pase-project': { courseName: 'Projekt Applied Software Engineering' },
  'ki-project': { courseName: 'Projekt Künstliche Intelligenz' },
  'ml-da-project': {
    courseName: 'Projekt Machine Learning and Data Analytics',
  },
  'pr-project': { courseName: 'Projekt Pattern Recognition' },
  'rarr-lab': {
    courseName: 'Rehabilitation and Assistive Robotics Research Lab',
  },
  'scg-projects': { courseName: 'Selected Projects in Computer Graphics' },
  'sr-project': { courseName: 'Surgical Robotics' },
  'amos-project': {
    courseName: 'The AMOS Project: Agile Methods and Open Source',
  },
  ast: { courseName: 'Advanced Simulation Technology' },
  ane: { courseName: 'Applied Neural Engineering' },
  bds: { courseName: 'Big Data Seminar' },
  bs: { courseName: 'Blender Seminar' },
  bkimaetd: {
    courseName:
      'Blickfang: KI-getriebene Modellierung und Analyse von Eye-Tracking-Daten',
  },
  csr: { courseName: 'Cognitive Surgical Robotics' },
  dpl: { courseName: 'Digital Psychology Lab' },
  dpdl: { courseName: 'Digital Pathology and Deep Learning' },
  emlae: {
    courseName: 'Erweitertes maschinelles Lernen für Anomalieerkennung',
  },
  eia: { courseName: 'Ethics in AI' },
  epa: { courseName: 'Ethics and Philosophy of AI' },
  fdawtfm: { courseName: 'Fantastic datasets and where to find them' },
  gai: {
    courseName: 'Green AI: AI for sustainability and sustainability of AI',
  },
  hitl: {
    courseName: 'Humans in the Loop: The Design of Interactive AI Systems',
  },
  llr: { courseName: 'Legged Locomotion of Robots' },
  mlmri: { courseName: 'Machine Learning in MRI' },
  nyt: {
    courseName:
      'Nailing your Thesis (Anleitung zum wissenschaftlichen Arbeiten)',
  },
  naia: { courseName: 'Neurosciene-inspired Artificial Intelligence' },
  poa: { courseName: 'Philosophy of  AI' },
  puki: { courseName: 'Philosophie und Künstliche Intelligenz (KI)' },
  sadel: { courseName: 'Seminar Advanced Deep Learning' },
  saow: { courseName: 'Seminar Automata over Infinite Words' },
  scl: { courseName: 'Seminar Co-algebraic Logic' },
  scv: { courseName: 'Seminar Computer Vision' },
  sdl: { courseName: 'Seminar Deep Learning' },
  sed: { courseName: 'Seminar Ethik der Digitalisierung' },
  sgdp: { courseName: 'Seminar Graphical Data Processing' },
  sir: { courseName: 'Seminar Inverse Rendering' },
  smlida4i: {
    courseName: 'Seminar Machine Learning and Data Analytics for Industry 4.0',
  },
  smcap: { courseName: 'Seminar Multi-Core Architectures and Programming' },
  snm: { courseName: 'Seminar Network Medicine' },
  snqa: { courseName: 'Seminar Nominal Quantities and Automation' },
  snca: { courseName: 'Seminar Novel Computer Architechtures' },
  srhw: { courseName: 'Seminar Surgical Robotics Hardware' },
  srs: { courseName: 'Seminar Surgical Robotics Software' },
  sti: { courseName: 'Seminar Theoretische Informatik' },
  svc: { courseName: 'Seminar Visual Computing' },
  swuv: { courseName: 'Seminar Wissenrepräsentation und verarbeitung' },
  sr: { courseName: 'Surgical Robotics' },
  toc: { courseName: 'Topics of Category Theory' },
  to: { courseName: 'Tracking Olympiad' },
};

export interface CoverageSnap {
  timestamp_ms: number;
  sectionName: string;
  clipId?: string; // https://fau.tv/clip/id/{clipId}
}

export interface CoverageTimeline {
  [courseId: string]: CoverageSnap[];
}
