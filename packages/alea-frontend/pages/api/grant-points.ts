import { GrantPointsRequest, isModerator } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfTypeOrSetError,
  executeAndEndSet500OnError,
  getExistingCommentDontEnd,
  getExistingPointsDontEnd,
  getUserIdOrSetError,
} from './comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfTypeOrSetError(req, res)) return;
  const granterId = await getUserIdOrSetError(req, res);
  if (!isModerator(granterId)) {
    res
      .status(403)
      .send({ message: 'You are not allowed to do this operation.' });
    return;
  }

  const { commentId, points, reason } = req.body as GrantPointsRequest;
  if (!commentId || !reason || points === undefined) {
    res.status(400).send({ message: 'Invalid comment id or reason or points' });
    return;
  }

  const { existing: comment, error: commentFetchError } =
    await getExistingCommentDontEnd(commentId);
  const commenterId = comment?.userId;
  if (!commenterId || comment.isAnonymous || comment.isPrivate) {
    res
      .status(commentFetchError || 401)
      .json({ message: 'Missing or private or anonymous comment' });
    return;
  }

  const { existing: existingGrant } = await getExistingPointsDontEnd(commentId);

  let results = undefined;
  if (existingGrant) {
    results = await executeAndEndSet500OnError(
      'UPDATE points SET points=?, reason=?, userId=?, granterId=? WHERE commentId=?',
      [points, reason, comment.userId, granterId, commentId],
      res
    );
  } else {
    results = await executeAndEndSet500OnError(
      'INSERT INTO points (points, reason, userId, commentId, granterId) VALUES (?, ?, ?, ?, ?)',
      [points, reason, comment.userId, commentId, granterId],
      res
    );
  }
  if (!results) return;
  res.status(204).end();
}
