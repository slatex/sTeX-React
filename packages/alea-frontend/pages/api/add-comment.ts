import {
  Comment,
  CommentType,
  DEFAULT_POINTS,
  GrantReason,
  NotificationType,
  isModerator,
} from '@stex-react/api';
import { PathToArticle } from '@stex-react/utils';
import axios from 'axios';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getExistingCommentDontEnd,
  getUserIdOrSetError,
  sendNotification,
} from './comment-utils';

async function sendCommentAlert(
  userId: string,
  isPrivate: boolean,
  isQuestion: boolean,
  courseId: string,
  archive: string,
  filepath: string
) {
  if (isPrivate) return;
  const articlePath =
    'https://courses.voll-ki.fau.de' + PathToArticle({ archive, filepath });
  const forumPath = `https://courses.voll-ki.fau.de/forum/${courseId}`;
  const link = archive && filepath ? articlePath : forumPath;
  const message = isModerator(userId)
    ? `A moderator posted at ${link}`
    : `A ${isQuestion ? 'question' : 'comment'} was posted at ${link}`;
  await sendAlert(message);
}

export async function sendAlert(message: string) {
  const roomId = process.env.VOLL_KI_ALERTS_CHANNEL_ID;
  const token = process.env.VOLL_KI_ALERTS_BOT_TOKEN;
  if (!roomId || !token) return;

  return await axios.post(
    `https://matrix-client.matrix.org/_matrix/client/r0/rooms/${roomId}/send/m.room.message`,
    {
      msgtype: 'm.text',
      body: message,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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

  if (!statement || isPrivate === undefined || isAnonymous === undefined) {
    res.status(400).json({ message: 'Some fields missing!' });
    return;
  }
  if (isPrivate && isAnonymous) {
    res.status(400).json({ message: 'Anonymous comments can not be private!' });
    return;
  }

  let threadId: number | undefined = undefined;
  let parentUserId;
  if (parentCommentId) {
    const { existing: parentComment, error } = await getExistingCommentDontEnd(
      parentCommentId
    );
    if (!parentComment) {
      res.status(error || 404).json({ message: 'Parent comment not found' });
      return;
    }
    threadId = parentComment.threadId;
    if (process.env.NEXT_PUBLIC_SITE_VERSION !== 'production') {
      parentUserId = parentComment.userId;
      if (parentUserId) {
        await sendNotification(
          parentUserId,
          'English Header',
          'English Content',
          'German version Header',
          'German version Content',
          NotificationType.COMMENT,
          '/help'
        );
      }
    }
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

  if (commentType === CommentType.QUESTION) {
    const reason = GrantReason.ASKED_QUESTION;
    await executeAndEndSet500OnError(
      'INSERT INTO points (points, reason, userId, commentId, granterId) VALUES (?, ?, ?, ?, ?)',
      [DEFAULT_POINTS.get(reason), reason, userId, newCommentId, 'auto'],
      res
    );
  }

  if (!parentCommentId) {
    await executeAndEndSet500OnError(
      `UPDATE comments SET threadId=? WHERE commentId=?`,
      [newCommentId, newCommentId],
      res
    );
  }
  res.status(200).json({ newCommentId });
  await sendCommentAlert(
    userId,
    isPrivate,
    commentType === CommentType.QUESTION,
    courseId,
    archive,
    filepath
  );
}
