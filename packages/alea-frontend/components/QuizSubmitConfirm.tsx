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
import { getLocaleObject } from '../lang/utils';
import { useRouter } from 'next/router';

export function QuizSubmitConfirm({
  left,
  onClose,
  showRecordOption,
}: {
  left: number;
  onClose: (submit: boolean, recordName?: string) => void;
  showRecordOption: boolean;
}) {
  const { quiz: t } = getLocaleObject(useRouter());
  const [name, setName] = useState('');
  const [recordResults, setRecordResults] = useState(showRecordOption);
  useEffect(() => {
    if (!showRecordOption) return;
    getUserInfo().then((u) => setName(u?.fullName ?? ''));
  }, [showRecordOption]);
  return (
    <>
      {/*title && <DialogTitle id="alert-dialog-title">{title}</DialogTitle>*/}
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {left > 0 ? t.didntAnswer.replace('$1', `${left}`) : ''}
          {t.sureFinish}
        </DialogContentText>
        {showRecordOption && (
          <>
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
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button
          disabled={recordResults && !name?.length}
          onClick={() => onClose(true, recordResults ? name : undefined)}
          autoFocus
        >
          Finish
        </Button>
      </DialogActions>
    </>
  );
}
