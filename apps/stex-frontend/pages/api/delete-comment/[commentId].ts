import {
  checkIfPostOrSetError,
  executeTxnAndEndSet500OnError,
  getExistingCommentDontEnd,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(req, res) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const commentId = +req.query.commentId;
  if (!commentId) {
    res.status(401).send({ message: 'Invalid comment id' });
    return;
  }

  const { existing, error } = await getExistingCommentDontEnd(commentId);
  const ownerId = existing?.userId;
  if (!ownerId || userId !== ownerId) {
    res.status(error || 403).send({ message: 'User not authorized' });
    return;
  }

  const commentUpdate = await executeTxnAndEndSet500OnError(
    `UPDATE comments
    SET statement=NULL, userId=NULL, userName=NULL, userEmail=NULL, selectedText=NULL, isDeleted=1
    WHERE commentId=?`,
    [commentId],
    `DELETE FROM updateHistory WHERE commentId=?`,
    [commentId],
    res
  );
  if (!commentUpdate) return;
  res.status(204).end();
}
