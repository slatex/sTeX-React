import { EditCommentRequest } from '@stex-react/api';
import {
  checkIfPostOrSetError,
  executeTransactionSet500OnError,
  getExistingComment,
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

  const { existing, error } = await getExistingComment(commentId);
  const ownerId = existing?.userId;
  if (!ownerId || userId !== ownerId) {
    res.status(error || 403).end();
    return;
  }

  const commentUpdate = await executeTransactionSet500OnError(
    'UPDATE comments SET statement=?, isEdited=1 WHERE commentId=?',
    [statement, commentId],
    `INSERT INTO updateHistory
    (commentId, updaterId, previousStatement, previousHiddenStatus, previousHiddenJustification)
    VALUES(?, ?, ?, ?, ?)`,
    [
      commentId,
      userId,
      existing.statement,
      existing.hiddenStatus,
      existing.hiddenJustification,
    ],
    res
  );
  if (!commentUpdate) return;
  res.status(204).end();
}
