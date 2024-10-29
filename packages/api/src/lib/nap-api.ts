import axios from 'axios';
import {
  AnswerClassResponse,
  AnswerResponse,
  CreateAnswerRequest,
  CreateGradingRequest,
  CreateReviewRequest,
  ReviewType,
} from './nap';
import { getAuthHeaders } from './lms';
import { CURRENT_TERM } from '@stex-react/utils';

export async function createAnswer(answer: CreateAnswerRequest) {
  return axios
    .post('/api/nap/create-answer', answer, { headers: getAuthHeaders() })
    .then((c) => ({ status: c.status, answerId: c.data }));
}
export async function createGradring(gradeing: CreateGradingRequest) {
  return axios
    .post('/api/nap/create-grading', gradeing, { headers: getAuthHeaders() })
    .then((c) => ({ status: c.status, data: c.data as number }));
}
export async function getAnswers(couserId: string, questionId: string, subProblemId: string) {
  return axios
    .get<AnswerResponse[]>('/api/nap/get-student-answers', {
      headers: getAuthHeaders(),
      params: {
        couserId: couserId,
        questionId: questionId,
        subProblemId: subProblemId,
      },
    })
    .then((c) => c.data);
}
export async function createReviewRequest(request: CreateReviewRequest) {
  return axios
    .post('/api/nap/create-review-request', request, { headers: getAuthHeaders() })
    .then((c) => ({ status: c.status }));
}
export async function getReviewRequests(courseId: string) {
  return axios
    .get('/api/nap/get-review-requests', {
      headers: getAuthHeaders(),
      params: { courseId, courseInstance: CURRENT_TERM },
    })
    .then((c) => c.data);
}
export async function getAnswer(id: number) {
  return axios
    .get('/api/nap/get-student-answer', { headers: getAuthHeaders(), params: { id: id } })
    .then((c) => c.data);
}
export async function getAnswerWithReviewRequestId(id: number) {
  return axios
    .get('/api/nap/get-answer-with-review-id', {
      headers: getAuthHeaders(),
      params: { id: id },
    })
    .then((c) => c.data);
}
export async function deleteAnswer(id: number) {
  return axios.post('/api/nap/delete-answer', { id }, { headers: getAuthHeaders() });
}
export async function deleteReviewRequest(id: number) {
  return axios.post('/api/nap/delete-review-request', { id }, { headers: getAuthHeaders() });
}
export async function getHomeworkAnswers(
  questionId: string,
  courseId: string,
  courseInstance: string = CURRENT_TERM
) {
  return axios
    .get('/api/nap/get-homework-answers', {
      params: { questionId, courseId, courseInstance },
      headers: getAuthHeaders(),
    })
    .then((c) => c.data);
}
export async function getReviewHomeworkAnswer(id: number) {
  return axios
    .get('/api/nap/get-review-homework-answer', { params: { id }, headers: getAuthHeaders() })
    .then((c) => c.data);
}
export async function getHomeWorkAnswer(questionId: string, subProblemId: string) {
  return axios
    .get('/api/nap/get-homework-answer', {
      params: { questionId, subProblemId },
      headers: getAuthHeaders(),
    })
    .then((c) => c.data as AnswerResponse);
}
