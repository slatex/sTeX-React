import { EditCommentRequest } from '@stex-react/api';
import {
  checkIfPostOrSetError,
  executeQuerySet500OnError,
  getCommentOwner,
  getUserIdOrSetError,
} from './comment-utils';

export default async function handler(req, res) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const { commentId, statement } = req.body as EditCommentRequest;
  if (!commentId) {
    res.status(401).send({ message: 'Invalid comment id' });
    return;
  }

  const { ownerId, error } = await getCommentOwner(commentId);
  if (!ownerId || userId !== ownerId) {
    res.status(error || 403).end();
    return;
  }

  const commentUpdate = await executeQuerySet500OnError(
    'UPDATE comments SET statement=?, isEdited=1 WHERE commentId=?',
    [statement, commentId],
    res
  );
  if (!commentUpdate) return;
  res.status(204).end();
}
