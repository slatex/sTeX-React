import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { getUserInfo } from '@stex-react/api';
import { useEffect, useState } from 'react';

export function QuizSubmitConfirm({
  left,
  onClose,
}: {
  left: number;
  onClose: (submit: boolean, recordName?: string) => void;
}) {
  const [name, setName] = useState('');
  const [recordResults, setRecordResults] = useState(true);
  useEffect(() => {
    getUserInfo().then((u) => setName(u?.fullName ?? ''));
  }, []);
  return (
    <>
      {/*title && <DialogTitle id="alert-dialog-title">{title}</DialogTitle>*/}
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {left > 0 ? `You did not answer ${left} questions. ` : ''}Are you sure
          you want to submit?
        </DialogContentText>
        <TextField
          label="Your name"
          value={name}
          disabled={!recordResults}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          sx={{ mt: '10px' }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={recordResults}
              onChange={(e) => setRecordResults(e.target.checked)}
            />
          }
          label="Record Results"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button
          disabled={recordResults && !name?.length}
          onClick={() => onClose(true, recordResults ? name : undefined)}
          autoFocus
        >
          Submit
        </Button>
      </DialogActions>
    </>
  );
}
