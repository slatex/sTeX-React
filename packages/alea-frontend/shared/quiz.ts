export interface TimerEvent {
  type: TimerEventType;
  timestamp_ms: number;
  questionIdx?: number;
}

export enum TimerEventType {
  SWITCH = 'SWITCH',
  PAUSE = 'PAUSE',
  UNPAUSE = 'UNPAUSE',
  SUBMIT = 'SUBMIT',
}
export interface UserResponse {
  filledInAnswer?: string;
  singleOptionIdx?: number;
  multiOptionIdx?: { [index: number]: boolean };
}

export interface QuestionStatus {
  isAnswered: boolean;
  isCorrect: boolean;
}

export interface QuestionInfo {
  duration_ms: number;
  url: string;
  status: QuestionStatus;
  response: UserResponse;
}

export interface QuizResult {
  resultId: string;
  quizName: string;
  quizTakerName: string;
  events: TimerEvent[];
  duration_ms: number;
  questionInfo: QuestionInfo[];
}
