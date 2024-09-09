export interface AnswerClass {
  answerClassId: string;
  points: number;
  isTrait: boolean;
  closed: boolean;
  title: string;
  description: string; //from API
  count: number;
}
export interface CreateGrading {
  customFeedback: string;
  answerId: number;
  answerClasses: AnswerClass[];
}
export interface CreateAnswer {
  answer: string;
  questionId: string;
  question_title: string;
}
export interface UpdateAnswer {
  answer: string;
  id: number;
}
export interface CreateReviewRequest {
  answerId: number;
  reviewType: ReviewType;
}
export enum ReviewType {
  PEER = 'Peer',
  INSTRUCTOR = 'INSTRUCTOR',
}
export interface Answer {
  id: number;
  questionId: string;
  userId: string;
  answer: string;
  question_title: string;
  createdAt: Date;
  updatedAt: Date;
}
