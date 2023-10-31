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
}

export enum ProblemType {
  MULTI_CHOICE_SINGLE_ANSWER = 'MULTI_CHOICE_SINGLE_ANSWER',
  MULTI_CHOICE_MULTI_ANSWER = 'MULTI_CHOICE_MULTI_ANSWER',
  FILL_IN = 'FILL_IN',
}

export interface Problem {
  type: ProblemType;
  statement: { outerHTML: string };
  inlineOptionSets?: Option[][]; // For inline SCBs
  options?: Option[];
  fillInSolution?: string;
  points: number;
}

export interface UserResponse {
  filledInAnswer?: string;
  singleOptionIdxs?: number[];
  multipleOptionIdxs?: { [index: number]: boolean };
}

export interface QuizStatsResponse {
  attemptedHistogram: { [attempted: number]: number };
  scoreHistogram: { [score: number]: number };
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
  response: UserResponse;
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
  responses: { [problemId: string]: UserResponse };
}

export interface InsertAnswerRequest {
  quizId: string;
  problemId: string;

  filledInAnswer?: string;
  singleOptionIdxs?: number[];
  multipleOptionIdxs?: { [index: number]: boolean };

  browserTimestamp_ms: number;
}

export interface QuizStubInfo {
  quizId: string;
  quizStartTs: number;
  quizEndTs: number;
  title: string;
}
