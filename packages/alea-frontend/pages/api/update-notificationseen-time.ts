import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from './comment-utils';

export default async function handler(req, res) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const newTimestamp = req.body.newTimestamp;
  const updateResult = await executeAndEndSet500OnError(
    `INSERT INTO userInfo (userId, notificationSeenTs)
    VALUES (?,?)
    ON DUPLICATE KEY UPDATE notificationSeenTs=VALUES(notificationSeenTs);`,
    [userId, newTimestamp],
    res
  );

  if (!updateResult) return;

  res.status(200).json({
    success: true,
    message: 'Notification seen time updated successfully',
  });
}
