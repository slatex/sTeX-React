import ReplyIcon from '@mui/icons-material/Reply';
import { useEffect, useState } from 'react';
import { Comment, getUserId, MODERATORS } from '@stex-react/api';
import { DateView } from '@stex-react/react-utils';
import { CommentMenu } from './CommentMenu';

import { Box, Button } from '@mui/material';
import styles from './comments.module.scss';

export function CommentLabel({
  comment,
  setEditingComment,
  setOpenReply,
  onDelete,
}: {
  comment: Comment;
  setEditingComment: (editing: boolean) => void;
  setOpenReply: (open: boolean) => void;
  onDelete: () => void;
}) {
  const [fromCurrentUser, setFromCurrentUser] = useState(false);
  const [canModerate, setCanModerate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    getUserId().then(
      (userId) => {
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
        <span className={styles['user_link']}>{comment.userName}</span>
        &nbsp;
        <DateView timestampMs={(comment.postedTimestampSec || 0) * 1000} />
        {comment.isEdited && (
          <span style={{ display: 'inline', fontSize: '12px', color: 'grey' }}>
            &nbsp;&#x2022; edited
          </span>
        )}
        {isLoggedIn && (
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
      </Box>
      <Box>
        {(canModerate || fromCurrentUser) && (
          <CommentMenu
            comment={comment}
            canModerate={canModerate}
            canEditComment={fromCurrentUser}
            setEditingComment={setEditingComment}
            onDelete={onDelete}
          />
        )}
      </Box>
    </Box>
  );
}
