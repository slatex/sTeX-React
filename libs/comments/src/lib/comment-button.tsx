import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import { getSectionInfo } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import { CommentNoteToggleView } from './comment-note-toggle-view';
import {
  getPrivateNotes,
  getPublicCommentTrees,
} from './comment-store-manager';
import AddCommentIcon from '@mui/icons-material/AddComment';

const buttonProps = {
  zIndex: '1',
  color: 'grey',
  backgroundColor: '#FFF',
  mb: '3px',
  '&:hover': {
    backgroundColor: '#FFF',
    boxShadow: '#0005 0px 3px 7px',
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

  if (!archive || !filepath) return null;

  return (
    <Box>
      {hasPrivateNotes && (
        <Tooltip title="My notes">
          <IconButton
            onClick={() => {
              setDefaultPrivate(true);
              setOpen(true);
            }}
            sx={buttonProps}
          >
            <FormatListBulletedIcon
              sx={{ color: '#4d97dd' }}
              fontSize="small"
            />
          </IconButton>
        </Tooltip>
      )}
      {(!hasPrivateNotes || hasPublicComments) && (
        <Tooltip title={hasPublicComments ? 'Comments' : 'Add a comment'}>
          <IconButton
            onClick={() => {
              setDefaultPrivate(false);
              setOpen(true);
            }}
            sx={buttonProps}
          >
            {hasPublicComments ? (
              <ChatBubbleIcon sx={{ color: '#4d97dd' }} fontSize="small" />
            ) : (
              <AddCommentIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
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
  );
}
