import { UpdateCommentStateRequest } from '../../shared/comment';
import {
  checkIfPostOrSetError,
  executeQuerySet500OnError,
  getUserIdOrSetError,
  isPublicComment,
} from './comment-utils';

const MODERATORS = [
  'yp70uzyj', // Michael
  'yn06uhoc', // Jonas
  'ub59asib', // Dominic
  'do45qahi', // Dennis
  'ym23eqaw', // Abhishek
];
export default async function handler(req, res) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  if (!MODERATORS.includes(userId)) {
    res.status(403).send({ message: 'Not a moderator' });
    return;
  }
  const { commentId, hiddenStatus, hiddenJustification } =
    req.body as UpdateCommentStateRequest;
  if (!commentId) {
    res.status(401).send({ message: 'Invalid comment id' });
    return;
  }
  if (!(await isPublicComment(commentId))) {
    res.status(404).send({ message: 'Comment not found' });
    return;
  }
  const results = await executeQuerySet500OnError(
    'UPDATE comments SET hiddenStatus=?, hiddenJustification=? WHERE commentId=?',
    [hiddenStatus, hiddenJustification, commentId],
    res
  );
  if (!results) return;
  res.status(204).end();
}
