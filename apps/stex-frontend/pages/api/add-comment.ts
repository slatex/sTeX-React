import { Comment, isModerator } from '@stex-react/api';
import { PathToArticle } from '@stex-react/utils';
import axios from 'axios';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getExistingCommentDontEnd,
  getUserIdOrSetError,
} from './comment-utils';

async function sendCommentAlert(
  userId: string,
  isPrivate: boolean,
  archive: string,
  filepath: string
) {
  if (isPrivate) return;
  const articlePath =
    'https://courses.voll-ki.fau.de' + PathToArticle({ archive, filepath });
  if (isModerator(userId)) {
    await sendAlert(`A moderator posted a comment at ${articlePath}`);
  } else {
    await sendAlert(`A comment was posted at ${articlePath}`);
  }
}

export async function sendAlert(message: string) {
  if (!process.env.VOLL_KI_ALERTS_CHANNEL_ID) return;
  if (!process.env.VOLL_KI_ALERTS_BOT_TOKEN) return;

  return await axios.post(
    'https://mattermost.kwarc.info/api/v4/posts',
    {
      channel_id: process.env.VOLL_KI_ALERTS_CHANNEL_ID,
      message,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VOLL_KI_ALERTS_BOT_TOKEN}`,
      },
    }
  );
}

export default async function handler(req, res) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const {
    archive,
    filepath,
    statement,
    parentCommentId,
    courseId,
    courseTerm,
    selectedText,
    userEmail,
    userName,
    isPrivate,
    commentType,
    questionStatus,
    isAnonymous,
  } = req.body as Comment;

  if (
    !statement ||
    isPrivate === undefined ||
    isAnonymous === undefined
  ) {
    res.status(400).json({ message: 'Some fields missing!' });
    return;
  }
  if (isPrivate && isAnonymous) {
    res.status(400).json({ message: 'Anonymous comments can not be private!' });
    return;
  }

  let threadId: number | undefined = undefined;
  if (parentCommentId) {
    const { existing: parentComment, error } = await getExistingCommentDontEnd(
      parentCommentId
    );
    if (!parentComment) {
      res.status(error || 404).json({ message: 'Comment not found' });
      return;
    }
    threadId = parentComment.threadId;
  }
  const results = await executeAndEndSet500OnError(
    `INSERT INTO comments
      (archive, filepath, statement, parentCommentId, threadId, courseId, courseTerm, selectedText, isPrivate, commentType, questionStatus, isAnonymous, userId, userName, userEmail, isDeleted, isEdited)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      archive,
      filepath,
      statement,
      parentCommentId,
      threadId,
      courseId,
      courseTerm,
      selectedText,
      isPrivate ? 1 : 0,
      commentType,
      questionStatus,
      isAnonymous ? 1 : 0,
      isAnonymous ? null : userId,
      isAnonymous ? null : userName,
      isAnonymous ? null : userEmail,
      0,
      0,
    ],
    res
  );
  if (!results) return;
  const newCommentId = results['insertId'];

  if (!parentCommentId) {
    await executeAndEndSet500OnError(
      `UPDATE comments SET threadId=? WHERE commentId=?`,
      [newCommentId, newCommentId],
      res
    );
  }
  res.status(200).json({ newCommentId });
  await sendCommentAlert(userId, isPrivate, archive, filepath);
}
