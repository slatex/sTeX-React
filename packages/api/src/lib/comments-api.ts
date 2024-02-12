import { FileLocation } from '@stex-react/utils';
import axios, { AxiosError } from 'axios';
import {
  Comment,
  CommentType,
  EditCommentRequest,
  HiddenStatus,
  QuestionStatus,
  UpdateCommentStateRequest,
  UpdateQuestionStateRequest,
  UserInformation,
} from './comment';
import { getAuthHeaders, logoutAndGetToLoginPage } from './lms';

async function commentRequest(apiUrl: string, requestType: string, data?: any) {
  const headers = getAuthHeaders();
  try {
    const resp =
      requestType === 'POST'
        ? await axios.post(apiUrl, data, { headers })
        : await axios.get(apiUrl, { headers });
    return resp.data;
  } catch (err) {
    const error = err as Error | AxiosError;
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        logoutAndGetToLoginPage();
      }
    }
    throw err;
  }
}

export async function addComment(comment: Comment): Promise<number> {
  const respData = await commentRequest('/api/add-comment', 'POST', comment);
  return respData['newCommentId'];
}

export async function editComment(commentId: number, statement: string) {
  const body: EditCommentRequest = { commentId, statement };
  await commentRequest('/api/edit-comment', 'POST', body);
}

export async function deleteComment(commentId: number) {
  await commentRequest(`/api/delete-comment/${commentId}`, 'POST');
}

export async function getComments(files: FileLocation[]): Promise<Comment[]> {
  const comments: Comment[] = await commentRequest(
    `/api/get-comments`,
    'POST',
    { files }
  );
  return comments;
}

export async function getThreadsForCourseInstance(
  courseId: string,
  courseTerm: string
): Promise<Comment[]> {
  const comments: Comment[] = await commentRequest(
    `/api/get-comments-for-course-instance`,
    'POST',
    { courseId, courseTerm }
  );
  return comments;
}

export async function getCommentsForThread(
  threadId: number
): Promise<Comment[]> {
  const comments: Comment[] = await commentRequest(
    `/api/get-comments-for-thread/${threadId}`,
    'GET'
  );
  return comments;
}

export async function updateCommentState(
  commentId: number,
  hiddenStatus: HiddenStatus,
  hiddenJustification: string
) {
  const body: UpdateCommentStateRequest = {
    commentId,
    hiddenStatus,
    hiddenJustification,
  };
  await commentRequest('/api/update-comment-state', 'POST', body);
}

export async function updateQuestionState(
  commentId: number,
  commentType: CommentType,
  questionStatus?: QuestionStatus
) {
  const body: UpdateQuestionStateRequest = {
    commentId,
    questionStatus,
    commentType,
  };
  await commentRequest('/api/update-question-state', 'POST', body);
}

export async function getCourseInstanceThreads(
  courseId: string,
  courseTerm: string
): Promise<Comment[]> {
  const comments: Comment[] = await commentRequest(
    `/api/get-course-instance-threads`,
    'POST',
    { courseId, courseTerm }
  );
  return comments;
}

export async function getLatestUpdatedSections() {
  return await commentRequest('/api/get-latest-updated-sections', 'GET');
}

export async function getMyNotesSections() {
  return await commentRequest('/api/get-my-notes-sections', 'GET');
}

export async function purgeComments() {
  return await commentRequest('/api/purge-comments', 'POST');
}

export async function getAllMyComments() {
  return await commentRequest('/api/get-all-my-comments', 'GET');
}

export let cachedUserInformation: UserInformation | undefined = undefined;

export async function getUserInformation() {
  if (!cachedUserInformation) {
    const url = '/api/get-user-information';
    const resp = await axios.get(url, { headers: getAuthHeaders() });
    cachedUserInformation = resp.data;
  }
  return cachedUserInformation;
}

export async function updateTrafficLightStatus(trafficStatus: boolean) {
  cachedUserInformation = undefined;
  return await axios.post(
    '/api/update-trafficlight-status',
    { trafficStatus },
    {
      headers: getAuthHeaders(),
    }
  );
}
export async function updateCompetencyIndicatorStatus(
  competencyIndicatorStatus: boolean
) {
  cachedUserInformation = undefined;
  return await axios.post(
    '/api/update-competency-indicator-status',
    { competencyIndicatorStatus },
    {
      headers: getAuthHeaders(),
    }
  );
}
