export enum Phase {
  UNSET = 'UNSET',
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  ENDED = 'ENDED',
  FEEDBACK_RELEASED = 'FEEDBACK_RELEASED',
}

export interface Quiz {
  id: string;
  version: number;

  courseId: string;
  courseTerm: string;
  quizStartTs: number;
  quizEndTs: number;
  feedbackReleaseTs: number;
  manuallySetPhase: Phase;

  title: string;
  problems: { [problemId: string]: string };

  updatedAt: number;
  updatedBy: string;
}

export enum Tristate {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  UNKNOWN = 'UNKNOWN',
}

export interface Option {
  shouldSelect: Tristate;
  value: { outerHTML: string; textContent?: string };
  feedbackHtml: string;
  optionId: string;
}

export enum InputType {
  MCQ = 'MCQ', // multiple choice, multiple correct answers
  SCQ = 'SCQ', // multiple choice, single correct answer
  FILL_IN = 'FILL_IN',
}

export interface FillInBox {
  solution: string;
  inline: boolean;
}

export interface Input {
  type: InputType;
  options?: Option[]; // For MCQ and SCQ types.
  fillInSolution?: string; // For FILL_IN type.
  inline: boolean;
}

export interface Problem {
  header: string;
  objectives: string;
  preconditions: string;
  statement: { outerHTML: string };
  inputs: Input[];

  points: number;
}

export interface InputResponse {
  type: InputType;
  filledInAnswer?: string;
  singleOptionIdx?: string;
  multipleOptionIdxs?: { [index: string]: boolean };
}

export interface ProblemResponse {
  responses: InputResponse[];
}

export interface PerProblemStats {
  header: string;
  maxPoints: number;
  correct: number;
  partial: number;
  incorrect: number;
}

export interface QuizStatsResponse {
  attemptedHistogram: { [attempted: number]: number };
  scoreHistogram: { [score: number]: number };
  requestsPerSec: { [ts: number]: number };
  perProblemStats: { [problemId: number]: PerProblemStats };
}

// For recording quizzes at /quiz/old
export interface TimerEvent {
  type: TimerEventType;
  timestamp_ms: number;
  problemIdx?: number;
}

export enum TimerEventType {
  SWITCH = 'SWITCH',
  PAUSE = 'PAUSE',
  UNPAUSE = 'UNPAUSE',
  SUBMIT = 'SUBMIT',
}

export interface ProblemInfo {
  duration_ms: number;
  url: string;
  points: number | undefined;
  response: ProblemResponse;
}

export interface QuizResult {
  resultId: string;
  quizName: string;
  quizTakerName: string;
  events: TimerEvent[];
  duration_ms: number;
  problemInfo: ProblemInfo[];
}

export interface GetQuizResponse {
  currentServerTs: number;
  quizStartTs?: number;
  quizEndTs?: number;
  feedbackReleaseTs?: number;

  phase: Phase;

  problems: { [problemId: string]: string };
  responses: { [problemId: string]: ProblemResponse };
}

export interface InsertAnswerRequest {
  quizId: string;
  problemId: string;
  responses: InputResponse[];

  browserTimestamp_ms: number;
}

export interface DiligenceAndPerformanceData {
  visitTime_sec: number;
  quizScores: { [quizId: string]: number };
}
export interface UserAnonData {
  userData: { [userId: string]: DiligenceAndPerformanceData };
}

export interface QuizStubInfo {
  quizId: string;
  quizStartTs: number;
  quizEndTs: number;
  title: string;
}
