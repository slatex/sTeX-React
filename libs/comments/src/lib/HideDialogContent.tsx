import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { HiddenStatus } from '@stex-react/api';
import { useState } from 'react';
import { HiddenState } from './CommentMenu';

const STATUS_TO_NAME = new Map<HiddenStatus, string>([
  [HiddenStatus.ABUSE, 'Abusive'],
  [HiddenStatus.INCORRECT, 'Mistake/Error/Misunderstanding'],
  [HiddenStatus.IRRELEVANT, 'Irrelevant discussion'],
  [HiddenStatus.OTHER, 'Other'],
]);

export function HideDialogContent({
  forSpam,
  forUnhide,
  onClose,
}: {
  forSpam: boolean;
  forUnhide: boolean;
  onClose?: (state?: HiddenState) => void;
}) {
  const [status, setStatus] = useState('');
  const [hiddenJustification, setJustification] = useState('');

  const okString = forSpam
    ? 'Mark Spam'
    : forUnhide
    ? 'Unhide Comment'
    : 'Hide Comment';

  function getState() {
    if (forSpam) {
      return { hiddenStatus: HiddenStatus.SPAM, hiddenJustification };
    }
    if (forUnhide) {
      return { hiddenStatus: HiddenStatus.UNHIDDEN, hiddenJustification };
    }
    const s = HiddenStatus[status as keyof typeof HiddenStatus];
    if (!s) return undefined;
    return { hiddenStatus: s, hiddenJustification };
  }

  return (
    <>
      <DialogTitle>{okString}</DialogTitle>
      <DialogContent sx={{ minWidth: '200px', pt: '6px !important' }}>
        <DialogContentText id="alert-dialog-description">
          {!forSpam && !forUnhide && (
            <FormControl fullWidth>
              <InputLabel id="cause-select-label">Cause</InputLabel>
              <Select
                labelId="cause-select-label"
                id="simple-select"
                value={status}
                label="Cause"
                onChange={(e) => setStatus(e.target.value)}
              >
                {Array.from(STATUS_TO_NAME.keys()).map((status) => (
                  <MenuItem key={status} value={HiddenStatus[status]}>
                    {STATUS_TO_NAME.get(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            fullWidth
            sx={{ mt: '10px' }}
            value={hiddenJustification}
            onChange={(e) => setJustification(e.target.value)}
            id="outlined-basic"
            label="Justification (optional)"
            variant="outlined"
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose && onClose()}>Cancel</Button>
        <Button
          disabled={!getState()}
          onClick={() => onClose && onClose(getState())}
          autoFocus
        >
          {okString}
        </Button>
      </DialogActions>
    </>
  );
}
