import axios from 'axios';
import { AnswerClassResponse, AnswerResponse, CreateAnswerRequest, CreateGradingRequest } from './nap';
import { getAuthHeaders } from './lms';

export async function createAnswer(answer: CreateAnswerRequest) {
  return axios
    .post('api/nap/create-answer', answer, { headers: getAuthHeaders() })
    .then((c) => ({ status: c.status, answerId: c.data }));
}
export async function createGradring(gradeing: CreateGradingRequest) {
  return axios
    .post('api/nap/create-grading', gradeing, { headers: getAuthHeaders() })
    .then((c) => ({ status: c.status, data: c.data as number }));
}
export async function getAnswers() {
  return axios
    .get<AnswerResponse[]>('api/nap/get-student-answers', { headers: getAuthHeaders() })
    .then((c) => c.data);
}
