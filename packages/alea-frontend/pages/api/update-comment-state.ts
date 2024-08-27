import { Comment, UpdateCommentStateRequest } from '@stex-react/api';
import { Action, ResourceName } from '@stex-react/utils';
import {
  getUserIdIfAnyAuthorizedOrSetError,
  ResourceActionParams,
} from './access-control/resource-utils';
import {
  checkIfPostOrSetError,
  executeTxnAndEndSet500OnError,
  getExistingCommentDontEnd,
} from './comment-utils';

export async function getUserIdForModerationOrSetError(req, res, c: Comment) {
  const resourceActions: ResourceActionParams[] = [
    { name: ResourceName.ALL_COMMENTS, action: Action.MODERATE },
  ];
  if (c.courseId && c.courseTerm) {
    resourceActions.push({
      name: ResourceName.COURSE_COMMENTS,
      action: Action.MODERATE,
      variables: { courseId: c.courseId, instanceId: c.courseTerm },
    });
  }
  return await getUserIdIfAnyAuthorizedOrSetError(req, res, resourceActions);
}

export default async function handler(req, res) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { commentId, hiddenStatus, hiddenJustification } = req.body as UpdateCommentStateRequest;
  if (!commentId) {
    res.status(401).json({ message: 'Invalid comment id' });
    return;
  }
  const { existing, error } = await getExistingCommentDontEnd(commentId);

  if (!existing || existing.isPrivate) {
    res.status(error || 404).json({ message: 'Comment not found' });
    return;
  }
  const userId = await getUserIdForModerationOrSetError(req, res, existing);
  if (!userId) return;

  const results = await executeTxnAndEndSet500OnError(
    res,
    'UPDATE comments SET hiddenStatus=?, hiddenJustification=? WHERE commentId=?',
    [hiddenStatus, hiddenJustification, commentId],
    `INSERT INTO updateHistory
    (commentId, ownerId, updaterId, previousStatement, previousHiddenStatus, previousHiddenJustification, previousQuestionStatus)
    VALUES(?, ?, ?, ?, ?, ?, ?)`,
    [
      commentId,
      existing.userId,
      userId,
      existing.statement,
      existing.hiddenStatus,
      existing.hiddenJustification,
      existing.questionStatus,
    ]
  );
  if (!results) return;
  res.status(204).end();
}
