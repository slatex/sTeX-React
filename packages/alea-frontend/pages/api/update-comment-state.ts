import { UpdateCommentStateRequest } from '@stex-react/api';
import {
  checkIfPostOrSetError,
  executeTxnAndEndSet500OnError,
  getExistingCommentDontEnd,
} from './comment-utils';
import { getUserIdIfAuthorizedOrSetError2 } from './access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';

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
  let userId: string | undefined;
  if (existing.courseId && existing.courseTerm) {
    userId = await getUserIdIfAuthorizedOrSetError2(req, res, [
      {
        name: ResourceName.COURSE_COMMENTS,
        action: Action.MODERATE,
        variables: { courseId: existing.courseId, instanceId: existing.courseTerm },
      },
      {
        name: ResourceName.ALL_COMMENTS,
        action: Action.MODERATE,
        variables: {},
      },
    ]);
  } else {
    userId = await getUserIdIfAuthorizedOrSetError2(req, res, [
      {
        name: ResourceName.ALL_COMMENTS,
        action: Action.MODERATE,
        variables: {},
      },
    ]);
  }

  if (!userId) return res.status(403).json({ message: 'unauthorized' });

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
