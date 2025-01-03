export type HomeworkPhase =
  | 'UNSET'
  | 'NOT_GIVEN'
  | 'GIVEN'
  | 'SUBMISSION_CLOSED'
  | 'FEEDBACK_RELEASED';

export interface HomeworkInfo {
  id: number;
  title: string;
  givenTs: string;
  dueTs: string;
  feedbackReleaseTs: string;
  courseId: string;
  courseInstance: string;
  problems: Record<string, string>;
}

export type HomeworkStub = Omit<HomeworkInfo, 'problems'>;

export interface LearnerHomeworkInfo {
  id: number;
  title: string;
  givenTs: string;
  dueTs: string;
  courseId: string;
  courseInstance: string;
  maxPoints: number;
  myScore: number;
  avgScore: number;
}
