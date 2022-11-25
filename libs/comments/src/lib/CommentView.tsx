import { MdViewer } from '@stex-react/markdown';
import { useState } from 'react';
import { Comment } from '@stex-react/api';
import { CommentLabel } from './CommentLabel';
import { CommentReply } from './CommentReply';
import { EditView } from './EditView';

import styles from './comments.module.scss';
import { SelectedInfo } from './selected-info';

export function CommentView({
  comment,
  onUpdate,
}: {
  comment: Comment;
  onUpdate: () => void;
}) {
  const [commentReplyOpen, setCommentReplyOpen] = useState(false);
  const [editingComment, setEditingComment] = useState(false);

  return (
    <>
      <CommentLabel
        comment={comment}
        setEditingComment={setEditingComment}
        setOpenReply={setCommentReplyOpen}
        onUpdate={onUpdate}
      />
      <div style={{ display: 'flex' }}>
        <div className={styles['stretchy_div']}>
          {!comment.isDeleted && (
            <div>
              <SelectedInfo text={comment.selectedText} />
              {!editingComment && (
                <div style={{ margin: '-1em 0 0' }}>
                  <MdViewer content={comment.statement || ''} />
                </div>
              )}
              <EditView
                hidden={!editingComment}
                parentId={comment.commentId}
                isPrivateNote={!!comment.isPrivate}
                postAnonymously={comment.isAnonymous}
                archive={comment.archive || ''}
                filepath={comment.filepath || ''}
                existingComment={comment}
                onCancel={() => setEditingComment(false)}
                onUpdate={() => {
                  setEditingComment(false);
                  onUpdate && onUpdate();
                }}
              />
              <CommentReply
                hidden={!commentReplyOpen}
                parentId={comment.commentId}
                isPrivateNote={!!comment.isPrivate}
                archive={comment.archive || ''}
                filepath={comment.filepath || ''}
                onCancel={() => setCommentReplyOpen(false)}
                onUpdate={() => {
                  setCommentReplyOpen(false);
                  onUpdate && onUpdate();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
