import React, { useState } from 'react';
import {
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/router';
import { getLocaleObject } from '../../lang/utils';

export function ConfirmPurgeDialogContent({ onClose }) {
  const router = useRouter();
  const { myProfile: t } = getLocaleObject(router);
  const [text, setText] = useState('');

  return (
    <>
      <DialogTitle sx={{ bgcolor: 'error.light', color: 'white' }}>{t.confirmPurge}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ my: 2 }}>
          {t.purgeWarning}
          <Typography component="div" sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            Enter this text to confirm: <b>{t.confirmText}</b>
          </Typography>
        </DialogContentText>
        <TextField
          fullWidth
          label={t.confirmation}
          value={text}
          onChange={(e) => setText(e.target.value)}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>{t.cancel}</Button>
        <Button
          onClick={() => onClose(true)}
          disabled={text.toLocaleLowerCase() !== t.confirmText.toLocaleLowerCase()}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
        >
          {t.purge}
        </Button>
      </DialogActions>
    </>
  );
}