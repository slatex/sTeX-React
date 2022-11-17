import { Comment } from '../../shared/comment';
import {
  checkIfPostOrSetError,
  executeQuerySet500OnError,
  getUserIdOrSetError,
} from './comment-utils';

export default async function handler(req, res) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const {
    archive,
    filepath,
    statement,
    parentCommentId,
    userEmail,
    userName,
    isPrivate,
  } = req.body as Comment;

  if (!archive || !filepath || !statement || isPrivate === undefined) {
    res.status(400).send({ message: 'Some fields missing!' });
  }
  const results = await executeQuerySet500OnError(
    `INSERT INTO comments
      (archive, filepath, statement, parentCommentId, isPrivate, userId, userName, userEmail)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      archive,
      filepath,
      statement,
      parentCommentId,
      isPrivate ? 1 : 0,
      userId,
      userName,
      userEmail,
    ],
    res
  );
  if (!results) return;
  const newCommentId = results['insertId'];
  res.status(200).json({ newCommentId });
}
