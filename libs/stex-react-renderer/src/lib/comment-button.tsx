import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { Box, Button, Dialog, DialogActions, IconButton } from '@mui/material';
import {
  CommentNoteToggleView, getPrivateNotes,
  getPublicCommentTrees
} from '@stex-react/comments';
import { getSectionInfo } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

const buttonProps = {
  zIndex: '1',
  color: 'grey',
  border: '1px solid transparent',
  '&:hover': {
    backgroundColor: '#FFF',
    color: 'grey',
    border: '1px solid #CCC',
    boxShadow: '#0005 0px 8px 15px',
  },
};
export function CommentButton({ url = '' }: { url?: string }) {
  const { archive, filepath } = getSectionInfo(url);
  const [hasPublicComments, setHasPublicComments] = useState(false);
  const [hasPrivateNotes, setHasPrivateNotes] = useState(false);
  const [open, setOpen] = useState(false);
  const [defaultPrivate, setDefaultPrivate] = useState(true);

  useEffect(() => {
    if (!archive || !filepath) {
      setHasPublicComments(false);
      return;
    }
    getPublicCommentTrees(archive, filepath, false).then((comments) => {
      setHasPublicComments(!!comments?.length);

      // This is a hack. We get private notes after fetching public comments to make sure that
      // we use the cached copy. Ideally, the comment store manager should be made smarter.
      getPrivateNotes(archive, filepath, false).then((comments) =>
        setHasPrivateNotes(!!comments?.length)
      );
    });
  }, [archive, filepath]);
  if (!archive || !filepath || !(hasPublicComments || hasPrivateNotes))
    return null;

  return (
    <ErrorBoundary hidden={false}>
      <Box>
        {hasPrivateNotes && (
          <IconButton
            onClick={() => {
              setDefaultPrivate(true);
              setOpen(true);
            }}
            sx={buttonProps}
          >
            <FormatListBulletedIcon />
          </IconButton>
        )}
        {hasPublicComments && (
          <IconButton
            onClick={() => {
              setDefaultPrivate(false);
              setOpen(true);
            }}
            sx={buttonProps}
          >
            <ChatBubbleIcon />
          </IconButton>
        )}
        {open && (
          <Dialog onClose={() => setOpen(false)} open={open} maxWidth="lg">
            <CommentNoteToggleView
              defaultPrivate={defaultPrivate}
              archive={archive}
              filepath={filepath}
            />
            <DialogActions sx={{ p: '0' }}>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </ErrorBoundary>
  );
}
