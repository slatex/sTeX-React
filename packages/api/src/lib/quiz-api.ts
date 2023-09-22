import axios from 'axios';
import { InsertAnswerRequest, QuizInfoResponse, QuizStatsResponse, UserResponse } from './quiz';
import { getAuthHeaders } from './lms';

export async function insertAnswer(
  quizId: string,
  problemId: string,
  response: UserResponse
) {
  const req: InsertAnswerRequest = {
    quizId,
    problemId,
    filledInAnswer: response.filledInAnswer,
    singleOptionIdx: response.singleOptionIdx,
    multipleOptionIdxs: response.multipleOptionIdxs,
    browserTimestamp_ms: Date.now(),
  };
  return await axios.post('/api/insert-quiz-response', req, {
    headers: getAuthHeaders(),
  });
}

export async function getQuiz(quizId: string) {
  const resp = await axios.get(`/api/get-quiz/${quizId}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as QuizInfoResponse;
}

export async function getQuizStats(quizId: string) {
  const resp = await axios.get(`/api/get-quiz-stats/${quizId}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as QuizStatsResponse;
}
