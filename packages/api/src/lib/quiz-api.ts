import axios, { AxiosError } from 'axios';
import { getAuthHeaders } from './lms';
import {
  GetQuizResponse,
  InsertAnswerRequest,
  Quiz,
  QuizStatsResponse,
  QuizStubInfo,
  ProblemResponse,
  GetPreviousQuizInfoResponse,
} from './quiz';

export async function insertAnswer(
  quizId: string,
  problemId: string,
  r: ProblemResponse
): Promise<boolean> {
  const req: InsertAnswerRequest = {
    quizId,
    problemId,
    responses: r.responses,
    browserTimestamp_ms: Date.now(),
  };
  try {
    await axios.post('/api/quiz/insert-quiz-response', req, {
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
  const resp = await axios.get(`/api/quiz/get-quiz/${quizId}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as GetQuizResponse;
}

export async function getQuizStats(quizId: string, courseId : string, courseTerm : string) {
  const resp = await axios.get(`/api/quiz/get-quiz-stats/${quizId}?courseId=${courseId}&courseTerm=${courseTerm}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as QuizStatsResponse;
}

export async function createQuiz(quiz: Quiz) {
  return await axios.post('/api/quiz/create-quiz', quiz, {
    headers: getAuthHeaders(),
  });
}

export async function updateQuiz(quiz: Quiz) {
  return await axios.post('/api/quiz/update-quiz', quiz, {
    headers: getAuthHeaders(),
  });
}

export async function getCourseQuizList(
  courseId: string
): Promise<QuizStubInfo[]> {
  return (await axios.get(`/api/quiz/get-course-quiz-list/${courseId}`)).data;
}

export async function getPreviousQuizInfo(courseId: string) {
  const headers = getAuthHeaders();
  if (!headers) return { quizInfo: {} } as GetPreviousQuizInfoResponse;
  const resp = await axios.get(`/api/quiz/get-previous-quiz-info/${courseId}`, {
    headers,
  });
  return resp.data as GetPreviousQuizInfoResponse;
}
