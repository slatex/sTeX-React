import {
  checkIfPostOrSetError,
  executeTxnAndEndSet500OnError,
  getUserIdOrSetError
} from './comment-utils';

export default async function handler(req, res) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const commentUpdate = await executeTxnAndEndSet500OnError(
    res,
    `UPDATE comments
    SET statement=NULL, userId=NULL, userName=NULL, userEmail=NULL, selectedText=NULL, isDeleted=1
    WHERE userId=?`,
    [userId],
    `DELETE FROM updateHistory WHERE ownerId=?`,
    [userId],
    `DELETE FROM points WHERE userId=?`,
    [userId],
  );
  if (!commentUpdate) return;
  res.status(204).end();
}
