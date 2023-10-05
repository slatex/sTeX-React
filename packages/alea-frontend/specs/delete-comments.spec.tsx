import axios from 'axios';
import { createMocks } from 'node-mocks-http';
import addComment from '../pages/api/add-comment';
import deleteComment from '../pages/api/delete-comment/[commentId]';
import { executeQuery } from '../pages/api/comment-utils';
import { mockCommentData } from './add-comment.spec';
import { processResults } from '../pages/api/get-comments';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

export async function addCommentFromUser(userId: string, mockData?: any) {
  // Add a comment.
  const { req: addReq, res: addRes } = createMocks({
    method: 'POST',
    headers: { Authorization: 'JWT token' },
    body: mockData || mockCommentData({ isPrivate: false, isAnonymous: false }),
  });
  mockedAxios.get.mockResolvedValueOnce({ data: { user_id: userId } });
  await addComment(addReq, addRes);
  const commentId = JSON.parse(addRes._getData())?.newCommentId;
  expect(commentId).toEqual(expect.any(Number));
  return commentId;
}

describe('/api/delete-comment', () => {
  test('No auth causes 403', async () => {
    // Add a comment.
    const commentId = await addCommentFromUser('user1');

    // Delete the comment.
    const { req: delReq, res: delRes } = createMocks({
      method: 'POST',
      query: { commentId },
    });
    await deleteComment(delReq, delRes);
    expect(delRes._getStatusCode()).toBe(403);
  });

  test('Different user cannot delete comment', async () => {
    // Add a comment.
    const commentId = await addCommentFromUser('user1');

    // Delete the comment.
    const { req: delReq, res: delRes } = createMocks({
      method: 'POST',
      headers: { Authorization: 'JWT token2' },
      query: { commentId },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: { user_id: 'user2' } });
    await deleteComment(delReq, delRes);
    expect(delRes._getStatusCode()).toBe(403);
    expect(JSON.parse(delRes._getData())).toEqual({
      message: 'User not authorized',
    });
  });

  test('Deleting invalid comment returns 404', async () => {
    const { req: delReq, res: delRes } = createMocks({
      method: 'POST',
      headers: { Authorization: 'JWT token1' },
      query: { commentId: 90234545 },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: { user_id: 'user1' } });
    await deleteComment(delReq, delRes);
    expect(delRes._getStatusCode()).toBe(404);
    expect(JSON.parse(delRes._getData())).toEqual({
      message: 'User not authorized',
    });
  });

  test('Anonymous comments cannot be deleted', async () => {
    // Add a comment.
    const commentId = await addCommentFromUser(
      'user1',
      mockCommentData({ isPrivate: false, isAnonymous: true })
    );

    // Delete the comment.
    const { req: delReq, res: delRes } = createMocks({
      method: 'POST',
      headers: { Authorization: 'JWT token' },
      query: { commentId },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: { user_id: 'user1' } });
    await deleteComment(delReq, delRes);
    expect(delRes._getStatusCode()).toBe(403);
    expect(JSON.parse(delRes._getData())).toEqual({
      message: 'User not authorized',
    });
  });

  test('Valid delete requested completed', async () => {
    // Add a comment.
    const commentId = await addCommentFromUser(
      'user1',
      mockCommentData({
        archive: 'archive',
        filepath: 'filepath',
        selectedText: 'selectedText',
        parentCommentId: null,
      })
    );

    // Delete the comment.
    const { req: delReq, res: delRes } = createMocks({
      method: 'POST',
      headers: { Authorization: 'JWT token' },
      query: { commentId },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: { user_id: 'user1' } });
    await deleteComment(delReq, delRes);
    expect(delRes._getStatusCode()).toBe(204);

    // Expect comment to be gone.
    const comments = await executeQuery(
      'SELECT * FROM comments WHERE commentId=?',
      [commentId]
    );
    expect(await processResults(undefined, comments as any)).toBe(true);
    expect(comments).toEqual([
      expect.objectContaining({
        commentId,
        commentType: null,
        courseId: null,
        courseTerm: null,

        archive: 'archive',
        filepath: 'filepath',
        parentCommentId: null,

        selectedText: null,
        statement: null,
        userId: null,
        userName: null,
        userEmail: null,
        isDeleted: true,
      }),
    ]);
    // TODOX: check history is also deleted.
  });
});
