import { Comment } from '@stex-react/api';
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
    selectedText,
    userEmail,
    userName,
    isPrivate,
    isAnonymous,
  } = req.body as Comment;

  if (
    !archive ||
    !filepath ||
    !statement ||
    isPrivate === undefined ||
    isAnonymous === undefined
  ) {
    res.status(400).send({ message: 'Some fields missing!' });
    return;
  }
  if (isPrivate && isAnonymous) {
    res.status(400).send({ message: 'Anonymous comments can not be private!' });
    return;
  }
  const results = await executeQuerySet500OnError(
    `INSERT INTO comments
      (archive, filepath, statement, parentCommentId, selectedText, isPrivate, isAnonymous, userId, userName, userEmail)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      archive,
      filepath,
      statement,
      parentCommentId,
      selectedText,
      isPrivate ? 1 : 0,
      isAnonymous ? 1 : 0,
      isAnonymous ? null : userId,
      isAnonymous ? null : userName,
      isAnonymous ? null : userEmail,
    ],
    res
  );
  if (!results) return;
  const newCommentId = results['insertId'];
  res.status(200).json({ newCommentId });
}
