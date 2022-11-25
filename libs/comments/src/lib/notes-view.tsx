import {
  Box, IconButton
} from '@mui/material';
import { Comment } from '@stex-react/api';
import { useEffect, useState } from 'react';
import {
  getPrivateNotes
} from './comment-store-manager';
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
  const [notes, setNotes] = useState([] as Comment[]);

  const refreshNotes = () => {
    console.log('refreshing');
    getPrivateNotes(archive, filepath, true).then((comments) => {
      setNotes(comments);
    });
  };
  useEffect(() => {
    getPrivateNotes(archive, filepath, false).then((comments) => {
      setNotes(comments);
    });
  }, [archive, filepath]);

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
          comment={note}
          archive={archive}
          filepath={filepath}
          onUpdate={() => refreshNotes()}
        />
      ))}
    </div>
  );
}
