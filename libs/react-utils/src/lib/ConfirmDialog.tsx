import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useRouter } from "next/router";
import { getLocaleObject } from "./lang/utils";

export function ConfirmDialogContent({ title, textContent, okText, cancelText, onClose }: {
  textContent: string,
  title?: string,
  okText?: string,
  cancelText?: string,
  onClose: (confirmed: boolean) => void
}) {
  const t = getLocaleObject(useRouter());

  return (<>
    {title && <DialogTitle id="alert-dialog-title">{title}
    </DialogTitle>}
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        {textContent}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => onClose(false)}>{cancelText ?? t.cancel}</Button>
      <Button
        onClick={() => onClose(true)}
        autoFocus
      >
        {okText ?? t.ok}
      </Button>
    </DialogActions></>);
}
