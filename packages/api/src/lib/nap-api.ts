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
export async function getAnswers() {
  return axios
    .get<AnswerResponse[]>('/api/nap/get-student-answers', { headers: getAuthHeaders() })
    .then((c) => c.data);
}
export async function createReviewRequest(request: CreateReviewRequest) {
  return axios
    .post('/api/nap/create-review-request', request, { headers: getAuthHeaders() })
    .then((c) => ({ status: c.status }));
}
export async function getReviewRequests(reviewType: ReviewType, couserId?: string) {
  return axios
    .get('/api/nap/get-review-requests', {
      headers: getAuthHeaders(),
      params: { couserId: couserId, reviewType: ReviewType[reviewType] },
    })
    .then((c) => c.data);
}
export async function getAnswer(id: number) {
  return axios
    .get('/api/nap/get-student-answer', { headers: getAuthHeaders(), params: { id: id } })
    .then((c) => c.data.answer);
}
export async function getAnswerWithReviewRequestId(id: number) {
  return axios
    .get('/api/nap/get-answer-with-review-id', {
      headers: getAuthHeaders(),
      params: { id: id },
    })
    .then((c) => c.data);
}
