export interface CreateAnswerClassRequest {
  answerClassId: string;
  points: number;
  isTrait: boolean;
  closed: boolean;
  title: string;
  description: string; //from API
  count: number;
}
export interface CreateGradingRequest {
  customFeedback: string;
  answerId: number;
  answerClasses: CreateAnswerClassRequest[];
}
export interface UpdateGradingRequest {
  customFeedback: string;
  answerClasses: CreateAnswerClassRequest[];
  id: number;
}
export interface CreateAnswerRequest {
  answer: string;
  subProblemId: string;
  questionId: string;
  questionTitle: string;
}
export interface UpdateAnswerRequest {
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
export interface AnswerResponse {
  id: number;
  questionId: string;
  userId: string;
  answer: string;
  questionTitle: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface GradeResponse {
  id: number;
  checkerId: string;
  answerId: number;
  customFeedback: string;
  totalPoints: number;
  answerClasses: AnswerClassResponse[];
  createdAt: Date;
  updatedAt: Date;
}
export interface AnswerClassResponse {
  id: number;
  answerClassId: string;
  gradingId: number;
  points: number;
  isTrait: boolean;
  closed: boolean;
  title: string;
  description: string; //from API
  count: number;
}
