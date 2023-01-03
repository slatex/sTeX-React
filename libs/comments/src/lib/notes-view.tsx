import { Box, IconButton } from '@mui/material';
import { Comment, getUserInfo } from '@stex-react/api';
import { useEffect, useState } from 'react';
import { getPrivateNotes, refreshAllComments } from './comment-store-manager';
import { CommentReply } from './CommentReply';
import { CommentView } from './CommentView';

import { Refresh } from '@mui/icons-material';
import styles from './comments.module.scss';
import { FileLocation } from '@stex-react/utils';

export function NotesView({
  file,
  selectedText = undefined,
  selectedElement = undefined,
  allNotesMode = false,
}: {
  file: FileLocation;
  selectedText?: string;
  selectedElement?: any;
  allNotesMode?: boolean;
}) {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState([] as Comment[]);

  const refreshNotes = () => {
    refreshAllComments().then((_) => {
      getPrivateNotes(file).then((c) => setNotes(c));
    });
  };
  useEffect(() => {
    getUserInfo().then((info) => setUserId(info?.userId));
  }, []);
  useEffect(() => {
    if (!userId) return;
    getPrivateNotes(file).then((c) => setNotes(c));
  }, [file?.archive, file?.filepath, userId]);

  if (!userId)
    return (
      <Box m="10px">
        <i>
          Please{' '}
          <a
            href={'/login?target=' + encodeURIComponent(window.location.href)}
            style={{ textDecoration: 'underline' }}
          >
            <b>login</b>
          </a>{' '}
          to save notes.
        </i>
      </Box>
    );

  return (
    <div>
      <div className={styles['header']}>
        <span style={{ marginBottom: '2px' }}>{notes.length} notes</span>
        <Box>
          <IconButton onClick={() => refreshNotes()}>
            <Refresh />
          </IconButton>
        </Box>
      </div>

      <hr style={{ margin: '0 0 15px' }} />
      {!allNotesMode && (
        <CommentReply
          placeholder="Create a private note here…"
          parentId={0}
          file={file}
          isPrivateNote={true}
          selectedText={selectedText}
          selectedElement={selectedElement}
          onUpdate={() => refreshNotes()}
          onCancel={undefined}
        />
      )}

      {notes.map((note) => (
        <CommentView
          key={note.commentId}
          comment={note}
          onUpdate={() => refreshNotes()}
        />
      ))}
    </div>
  );
}
