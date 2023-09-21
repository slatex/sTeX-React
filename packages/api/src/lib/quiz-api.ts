import axios from 'axios';
import { InsertAnswerRequest, UserResponse } from './quiz';
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
