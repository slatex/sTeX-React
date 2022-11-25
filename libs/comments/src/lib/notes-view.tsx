import { Box, IconButton } from '@mui/material';
import { Comment, getUserId } from '@stex-react/api';
import { useEffect, useState } from 'react';
import { getPrivateNotes } from './comment-store-manager';
import { CommentReply } from './CommentReply';
import { CommentView } from './CommentView';

import { Refresh } from '@mui/icons-material';
import styles from './comments.module.scss';

export function NotesView({
  archive,
  filepath,
  selectedText = undefined,
  selectedElement = undefined,
  allNotesMode = false,
}: {
  archive: string;
  filepath: string;
  selectedText?: string;
  selectedElement?: any;
  allNotesMode?: boolean;
}) {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState([] as Comment[]);

  const refreshNotes = () => {
    console.log('refreshing');
    getPrivateNotes(archive, filepath, true).then((comments) => {
      setNotes(comments);
    });
  };
  useEffect(() => {
    getUserId().then(setUserId);
  }, []);
  useEffect(() => {
    if (!userId) return;
    getPrivateNotes(archive, filepath, false).then((comments) => {
      setNotes(comments);
    });
  }, [archive, filepath, userId]);

  if (!userId)
    return (
      <Box m="10px">
        <i>
          Please{' '}
          <a href="/login" style={{ textDecoration: 'underline' }}>
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
          archive={archive}
          filepath={filepath}
          isPrivateNote={true}
          selectedText={selectedText}
          selectedElement={selectedElement}
          onUpdate={() => refreshNotes()}
          onCancel={undefined}
        />
      )}
      <br />

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
