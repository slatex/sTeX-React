import ReplyIcon from '@mui/icons-material/Reply';
import {
  Comment,
  getUserInfo,
  isHiddenNotSpam,
  isSpam,
  MODERATORS
} from '@stex-react/api';
import { DateView } from '@stex-react/react-utils';
import { useEffect, useState } from 'react';
import { CommentMenu } from './CommentMenu';

import { Box, Button, Tooltip } from '@mui/material';
import styles from './comments.module.scss';

export function CommentLabel({
  comment,
  setEditingComment,
  setOpenReply,
  onUpdate,
}: {
  comment: Comment;
  setEditingComment: (editing: boolean) => void;
  setOpenReply: (open: boolean) => void;
  onUpdate: () => void;
}) {
  const [fromCurrentUser, setFromCurrentUser] = useState(false);
  const [canModerate, setCanModerate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isPrivateNote = !!comment?.isPrivate;

  const hiddenStatus = comment?.hiddenStatus;
  const showHiddenStatus =
    !isPrivateNote && (isSpam(hiddenStatus) || isHiddenNotSpam(hiddenStatus));
  const statusStyle = isSpam(hiddenStatus) ? 'spam_status' : 'hidden_status';

  useEffect(() => {
    getUserInfo().then(
      (userInfo) => {
        const userId = userInfo.userId;
        const isLoggedIn = !!userId;
        setIsLoggedIn(isLoggedIn);
        setFromCurrentUser(isLoggedIn && userId === comment?.userId);
        setCanModerate(isLoggedIn && MODERATORS.includes(userId));
      },
      () => setFromCurrentUser(false)
    );
  }, [comment?.userId]);

  if (comment.isDeleted)
    return (
      <i className={styles['deleted_message']}>This comment was deleted.</i>
    );

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      onClick={(e) => e.stopPropagation()}
    >
      <Box display="flex">
        {/*comment.commentId*/}
        {!isPrivateNote && (
          <>
            <span className={styles['user_link']}>
              {comment.isAnonymous ? <i>Anonymous</i> : comment.userName}
            </span>
            &nbsp;
          </>
        )}
        <DateView timestampMs={(comment.postedTimestampSec || 0) * 1000} />
        {comment.isEdited && (
          <span style={{ display: 'inline', fontSize: '12px', color: 'grey' }}>
            &nbsp;&#x2022; edited
          </span>
        )}
        {isLoggedIn && !isPrivateNote && (
          <>
            &nbsp; &nbsp;
            <Button
              onClick={() => setOpenReply(true)}
              size="small"
              sx={{ p: '0', mt: '-6px' }}
            >
              <ReplyIcon />
              &nbsp;Reply
            </Button>
          </>
        )}
        {showHiddenStatus && (
          <Tooltip title={comment.hiddenJustification}>
            <span className={styles[statusStyle]}>{hiddenStatus}</span>
          </Tooltip>
        )}
      </Box>
      <Box>
        {(canModerate || fromCurrentUser) && (
          <CommentMenu
            comment={comment}
            canModerate={canModerate}
            canEditComment={fromCurrentUser}
            setEditingComment={setEditingComment}
            onUpdate={onUpdate}
          />
        )}
      </Box>
    </Box>
  );
}
