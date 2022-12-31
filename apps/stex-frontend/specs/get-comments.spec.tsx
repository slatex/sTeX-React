import axios from 'axios';
import { createMocks } from 'node-mocks-http';
import { mockCommentData } from './add-comment.spec';
import { addCommentFromUser } from './delete-comments.spec';
import getComments from '../pages/api/get-comments';
import { executeQuery } from '../pages/api/comment-utils';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

async function setupTestData(archive: string, filepath: string) {
  await executeQuery(
    'DELETE FROM COMMENTS WHERE archive = ? AND filepath = ?',
    [archive, filepath]
  );
  await addCommentFromUser(
    'user1',
    mockCommentData({ statement: 's1', archive, filepath, isPrivate: false })
  );
  await addCommentFromUser(
    'user1',
    mockCommentData({ statement: 's2', archive, filepath, isPrivate: true })
  );
  await addCommentFromUser(
    'user2',
    mockCommentData({ statement: 's3', archive, filepath, isPrivate: false })
  );
  await addCommentFromUser(
    'user2',
    mockCommentData({ statement: 's4', archive, filepath, isPrivate: true })
  );
}

describe('/api/get-comments', () => {
  test('only public comments for non-logged in users', async () => {
    const archive = 't1_archive';
    const filepath = 't1_filepath';
    await setupTestData(archive, filepath);
    const { req, res } = createMocks({
      method: 'POST',
      body: { files: [{ archive, filepath }] },
    });
    await getComments(req, res);
    expect(res._getStatusCode()).toBe(200);
    const comments = JSON.parse(res._getData());
    expect(comments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ statement: 's1' }),
        expect.objectContaining({ statement: 's3' }),
      ])
    );
    expect(comments).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ statement: 's2' }),
        expect.objectContaining({ statement: 's4' }),
      ])
    );
  });

  test('private comments based on user', async () => {
    const archive = 't2_archive';
    const filepath = 't2_filepath';
    await setupTestData(archive, filepath);
    const { req, res } = createMocks({
      method: 'GET',
      headers: { Authorization: 'JWT token1' },
      body: { files: [{ archive, filepath }] },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: { user_id: 'user1' } });
    await getComments(req, res);
    expect(res._getStatusCode()).toBe(200);
    const comments = JSON.parse(res._getData());
    expect(comments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ statement: 's1' }),
        expect.objectContaining({ statement: 's2' }),
        expect.objectContaining({ statement: 's3' }),
      ])
    );
    expect(comments).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ statement: 's4' })])
    );
  });

  test('comments only from specified archive and filepath', async () => {
    const archive1 = 't3_archive1';
    const filepath1 = 't3_filepath1';
    const archive2 = 't3_archive2';
    const filepath2 = 't3_filepath2';
    await setupTestData(archive1, filepath1);
    await setupTestData(archive2, filepath2);
    const { req, res } = createMocks({
      method: 'GET',
      headers: { Authorization: 'JWT token1' },
      body: { files: [{ archive: archive1, filepath: filepath1 }] },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: { user_id: 'user1' } });
    await getComments(req, res);
    expect(res._getStatusCode()).toBe(200);
    const comments = JSON.parse(res._getData());
    expect(comments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ archive: archive1, filepath: filepath1 }),
      ])
    );
    expect(comments).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ archive: archive2, filepath: filepath2 }),
      ])
    );
  });
});
