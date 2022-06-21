import { OpenInNew } from "@mui/icons-material";
import { Button, Dialog, DialogActions, IconButton } from "@mui/material";
import { ReactNode, useState } from "react";
import { ContentFromUrl } from "./ContentFromHtml";

export interface OverlayDialogProps {
  contentUrl: string;
  displayNode: ReactNode;
}

// HACK: Get appropriate content from MMT to remove this.
function getContent(htmlNode: JSX.Element) {
  const body = htmlNode?.props?.children[1];
  // Skip the arrow.
  return body?.props?.children.slice(1);
}

export function OverlayDialog({ contentUrl, displayNode }: OverlayDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ display: "inline" }} onClick={() => setOpen(true)}>
        {displayNode}
      </div>
      <Dialog onClose={() => setOpen(false)} open={open} maxWidth="lg">
        <a style={{ marginLeft: "auto" }} href={contentUrl} target="_blank" rel="noreferrer">
          <IconButton>
            <OpenInNew />
          </IconButton>
        </a>
        <ContentFromUrl url={contentUrl} process={(n) => getContent(n)} />

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
