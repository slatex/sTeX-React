import { MdViewer } from '@stex-react/markdown';
import { useState } from 'react';
import { Comment } from '@stex-react/api';
import { CommentLabel } from './CommentLabel';
import { CommentReply } from './CommentReply';
import { EditView } from './EditView';

import styles from './comments.module.scss';

interface CommentViewProps {
  comment: Comment;
  archive: string;
  filepath: string;
}

export function CommentView({ comment, archive, filepath }: CommentViewProps) {
  const [commentReplyOpen, setCommentReplyOpen] = useState(false);
  const [editingComment, setEditingComment] = useState(false);

  return (
    <>
      <CommentLabel
        comment={comment}
        setEditingComment={setEditingComment}
        setOpenReply={setCommentReplyOpen}
      />
      <div style={{ display: 'flex' }}>
        <div className={styles['stretchy_div']}>
          {!comment.isDeleted && (
            <div>
              {!editingComment && (
                <div style={{ margin: '-1em 0 0' }}>
                  <MdViewer content={comment.statement || ''} />
                </div>
              )}
              <EditView
                hidden={!editingComment}
                parentId={comment.commentId}
                archive={archive}
                filepath={filepath}
                existingComment={comment}
                onCancel={() => setEditingComment(false)}
              />
              <CommentReply
                hidden={!commentReplyOpen}
                parentId={comment.commentId}
                archive={archive}
                filepath={filepath}
                onCancel={() => setCommentReplyOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
