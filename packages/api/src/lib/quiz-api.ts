import axios, { AxiosError } from 'axios';
import { getAuthHeaders } from './lms';
import {
  GetQuizResponse,
  InsertAnswerRequest,
  Quiz,
  QuizStatsResponse,
  UserResponse,
} from './quiz';

export async function insertAnswer(
  quizId: string,
  problemId: string,
  response: UserResponse
): Promise<boolean> {
  const req: InsertAnswerRequest = {
    quizId,
    problemId,
    filledInAnswer: response.filledInAnswer,
    singleOptionIdx: response.singleOptionIdx,
    multipleOptionIdxs: response.multipleOptionIdxs,
    browserTimestamp_ms: Date.now(),
  };
  try {
    await axios.post('/api/insert-quiz-response', req, {
      headers: getAuthHeaders(),
    });
    return true;
  } catch (err) {
    const error = err as Error | AxiosError;
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 410) {
        // Quiz has ended
        return false;
      }
    }
    throw err;
  }
}

export async function getQuiz(quizId: string) {
  const resp = await axios.get(`/api/get-quiz/${quizId}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as GetQuizResponse;
}

export async function getQuizStats(quizId: string) {
  const resp = await axios.get(`/api/get-quiz-stats/${quizId}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as QuizStatsResponse;
}

export async function createQuiz(quiz: Quiz) {
  return await axios.post('/api/create-quiz', quiz, {
    headers: getAuthHeaders(),
  });
}

export async function updateQuiz(quiz: Quiz) {
  return await axios.post('/api/update-quiz', quiz, {
    headers: getAuthHeaders(),
  });
}

export async function getCourseQuizList(
  courseId: string
): Promise<{ quizId: string; quizStartTs: number }[]> {
  return (await axios.get(`/api/get-course-quiz-list/${courseId}`)).data;
}
