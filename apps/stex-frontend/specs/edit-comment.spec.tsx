import axios from 'axios';
import { createMocks } from 'node-mocks-http';
import editComment from '../pages/api/edit-comment';
import { executeQuery } from '../pages/api/comment-utils';
import { mockCommentData } from './add-comment.spec';
import { addCommentFromUser } from './delete-comments.spec';
import { processResults } from '../pages/api/get-comments';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('/api/edit-comment', () => {
  test('Editing invalid comment returns 404', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: { Authorization: 'JWT token1' },
      body: { commentId: 90234545, statement: 'updated' },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: { user_id: 'user1' } });
    await editComment(req, res);
    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'User not authorized',
    });
  });

  test('Different user cannot edit comment', async () => {
    // Add a comment.
    const commentId = await addCommentFromUser('user1');

    // Delete the comment.
    const { req, res } = createMocks({
      method: 'POST',
      headers: { Authorization: 'JWT token2' },
      body: { commentId, statement: 's2' },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: { user_id: 'user2' } });
    await editComment(req, res);
    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'User not authorized',
    });
  });

  test('Valid edit requested completed', async () => {
    // Add a comment.
    const commentId = await addCommentFromUser(
      'user1',
      mockCommentData({ statement: 's1', isPrivate: false, isAnonymous: false })
    );

    // Edit the comment.
    const { req, res } = createMocks({
      method: 'POST',
      headers: { Authorization: 'JWT token' },
      body: { commentId, statement: 's2' },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: { user_id: 'user1' } });
    await editComment(req, res);
    expect(res._getStatusCode()).toBe(204);

    // Expect comment to have new statement.
    const comments = await executeQuery(
      'SELECT * FROM comments WHERE commentId=?',
      [commentId]
    );
    processResults(comments as any);
    expect(comments).toEqual([
      expect.objectContaining({
        statement: 's2',
        isEdited: true,
        isDeleted: false,
      }),
    ]);

    const history = await executeQuery(
      'SELECT * FROM updateHistory WHERE commentId=?',
      [commentId]
    );

    expect(history).toEqual([
      expect.objectContaining({
        commentId,
        ownerId: 'user1',
        updaterId: 'user1',
        previousStatement: 's1',
        previousHiddenStatus: null,
        previousHiddenJustification: null,
        updatedTimestamp: expect.anything(),
      }),
    ]);
  });
});
