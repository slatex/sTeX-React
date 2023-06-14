import { UpdateCommentStateRequest, isModerator } from '@stex-react/api';
import {
  checkIfPostOrSetError,
  executeTxnAndEndSet500OnError,
  getExistingCommentDontEnd,
  getUserIdOrSetError
} from './comment-utils';

export default async function handler(req, res) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  if (!isModerator(userId)) {
    res.status(403).json({ message: 'Not a moderator' });
    return;
  }
  const { commentId, hiddenStatus, hiddenJustification } =
    req.body as UpdateCommentStateRequest;
  if (!commentId) {
    res.status(401).json({ message: 'Invalid comment id' });
    return;
  }
  const { existing, error } = await getExistingCommentDontEnd(commentId);
  if (!existing || existing.isPrivate) {
    res.status(error || 404).json({ message: 'Comment not found' });
    return;
  }
  const results = await executeTxnAndEndSet500OnError(
    res,
    'UPDATE comments SET hiddenStatus=?, hiddenJustification=? WHERE commentId=?',
    [hiddenStatus, hiddenJustification, commentId],
    `INSERT INTO updateHistory
    (commentId, ownerId, updaterId, previousStatement, previousHiddenStatus, previousHiddenJustification, previousQuestionStatus)
    VALUES(?, ?, ?, ?, ?, ?)`,
    [
      commentId,
      existing.userId,
      userId,
      existing.statement,
      existing.hiddenStatus,
      existing.hiddenJustification,
      existing.questionStatus
    ]
  );
  if (!results) return;
  res.status(204).end();
}
