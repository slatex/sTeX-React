import { Comment, MODERATORS } from '@stex-react/api';
import { PathToArticle } from '@stex-react/utils';
import axios from 'axios';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
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
  if (MODERATORS.includes(userId)) {
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
    res.status(400).json({ message: 'Some fields missing!' });
    return;
  }
  if (isPrivate && isAnonymous) {
    res.status(400).json({ message: 'Anonymous comments can not be private!' });
    return;
  }
  const results = await executeAndEndSet500OnError(
    `INSERT INTO comments
      (archive, filepath, statement, parentCommentId, selectedText, isPrivate, isAnonymous, userId, userName, userEmail, isDeleted, isEdited)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      0,
      0,
    ],
    res
  );
  if (!results) return;
  const newCommentId = results['insertId'];
  res.status(200).json({ newCommentId });
  await sendCommentAlert(userId, isPrivate, archive, filepath);
}
