import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { Box, Button, Dialog, DialogActions, IconButton } from '@mui/material';
import { CommentSection, getHierarchialComments } from '@stex-react/comments';
import { getSectionInfo } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export function CommentButton({ url = '' }: { url?: string }) {
  const { archive, filepath } = getSectionInfo(url);
  const [hasComments, setHasComments] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!archive || !filepath) {
      setHasComments(false);
      return;
    }
    getHierarchialComments(archive, filepath, false).then((comments) =>
      setHasComments(!!comments?.length)
    );
  }, [archive, filepath]);
  if (!archive || !filepath || !hasComments) return null;

  return (
    <ErrorBoundary hidden={false}>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          zIndex: '1',
          color: 'grey',
          border: '1px solid transparent',
          '&:hover': {
            backgroundColor: '#FFF',
            color: 'grey',
            border: '1px solid #CCC',
            boxShadow: '#0005 0px 8px 15px',
          },
        }}
      >
        <ChatBubbleIcon />
      </IconButton>
      {open && (
        <Dialog onClose={() => setOpen(false)} open={open} maxWidth="lg">
          <Box m="15px">
            <CommentSection archive={archive} filepath={filepath} />
          </Box>
          <DialogActions sx={{ p: '0' }}>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </ErrorBoundary>
  );
}
