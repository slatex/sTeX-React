import axios, { AxiosError } from 'axios';
import {
  Comment,
  EditCommentRequest,
  HiddenStatus,
  UpdateCommentStateRequest,
} from '../shared/comment';
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
      if (error.response.status === 401) {
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

export async function getComments(
  archive: string,
  filepath: string
): Promise<Comment[]> {
  const a = encodeURIComponent(archive);
  const f = encodeURIComponent(filepath);
  const comments: Comment[] = await commentRequest(
    `/api/get-comments/${a}/${f}`,
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
