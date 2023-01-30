import { Comment } from '@stex-react/api';
import { PathToArticle } from '@stex-react/utils';
import axios from 'axios';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from './comment-utils';

async function sendAlert(
  isPrivate: boolean,
  archive: string,
  filepath: string
) {
  if (
    isPrivate ||
    !process.env.VOLL_KI_ALERTS_CHANNEL_ID ||
    !process.env.VOLL_KI_ALERTS_BOT_TOKEN
  ) {
    return;
  }
  const articlePath =
    'https://courses.voll-ki.fau.de' + PathToArticle({ archive, filepath });
  await axios.post(
    'https://mattermost.kwarc.info/api/v4/posts',
    {
      channel_id: process.env.VOLL_KI_ALERTS_CHANNEL_ID,
      message: `A new comment was posted at ${articlePath}`,
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
  await sendAlert(isPrivate, archive, filepath);
}
