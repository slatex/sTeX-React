import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export function ConfirmDialogContent({ title, textContent, okText, cancelText, onClose }: {
  textContent: string,
  title?: string,
  okText?: string,
  cancelText?: string,
  onClose: (confirmed: boolean) => void
}) {
  return (<>
    {title && <DialogTitle id="alert-dialog-title">{title}
    </DialogTitle>}
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        {textContent}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => onClose(false)}>{cancelText ?? 'Cancel'}</Button>
      <Button
        onClick={() => onClose(true)}
        autoFocus
      >
        {okText ?? 'OK'}
      </Button>
    </DialogActions></>);
}
