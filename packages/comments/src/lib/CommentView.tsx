import { Comment } from '@stex-react/api';
import { useState } from 'react';
import { CommentLabel } from './CommentLabel';
import { CommentReply } from './CommentReply';
import { EditView } from './EditView';

import { MystViewer } from '@stex-react/myst';
import { discardDraft } from './comment-helpers';
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
                  <MystViewer content={comment.statement || ''} />
                </div>
              )}
              <EditView
                hidden={!editingComment}
                parentId={comment.commentId}
                isPrivateNote={!!comment.isPrivate}
                postAnonymously={comment.isAnonymous}
                uri={"todo alea4"}
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
                uri={"todo alea4"}
                onCancel={() => {
                  setCommentReplyOpen(false);
                  let { archive, filepath } = comment;
                  archive = archive || '';
                  filepath = filepath || '';
                  discardDraft("todo alea4", comment.commentId);
                }}
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
