import { OpenInNew } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  IconButton,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  contextParamsFromTopLevelDocUrl,
  getChildrenOfBodyNode,
} from '@stex-react/utils';
import { useRouter } from 'next/router';
import { ReactNode, useContext, useState } from 'react';
import { ContentFromUrl, TopLevelContext } from './ContentFromUrl';
import { ErrorBoundary } from './ErrorBoundary';
import { getLocaleObject } from './lang/utils';
import { ServerLinksContext } from './stex-react-renderer';
import { localStore } from '@stex-react/utils';

export interface OverlayDialogProps {
  contentUrl: string;
  isMath: boolean;
  displayNode: (topLevelDocUrl: string) => ReactNode;
}

export function OverlayDialog({
  contentUrl,
  displayNode,
  isMath,
}: OverlayDialogProps) {
  const t = getLocaleObject(useRouter());
  const [open, setOpen] = useState(false);
  const { mmtUrl } = useContext(ServerLinksContext);
  const { topLevelDocUrl } = useContext(TopLevelContext);
  const contextParams = contextParamsFromTopLevelDocUrl(topLevelDocUrl);

  const toDisplayNode = displayNode(topLevelDocUrl);

  let hoverSwitch=localStore?.getItem('hoverSwitch') === 'true' || false


  return (
    <ErrorBoundary hidden={false}>
      {isMath ? (
        /* @ts-expect-error: 'mrow is MathML which does not exist on JSX.IntrinsicElements(ts2339) */
        <mrow style={{ display: 'inline' }} onClick={() => setOpen(true)}>
          {toDisplayNode}
          {/* @ts-expect-error: 'mrow is MathML which does not exist on JSX.IntrinsicElements(ts2339) */}
        </mrow>
      ) : (
        <span style={{ display: 'inline' }} onClick={() => setOpen(true)}>
          {toDisplayNode}
        </span>
      )}
      <Dialog onClose={() => setOpen(false)} open={open} maxWidth="lg">
        <Box display="flex" flexDirection="column" m="5px" maxWidth="800px">
          <Box display="flex">
            <Box marginLeft="auto" display="flex" alignItems="center">
              <Tooltip title={t.hover} placement="top">
                <Switch
                  checked={hoverSwitch}
                  onChange={() => {
                    hoverSwitch=!hoverSwitch;
                    localStore?.setItem('hoverSwitch', String(hoverSwitch));
                    window.location.reload();
                  }}
                />
              </Tooltip>
              <a
                style={{ marginLeft: 'auto' }}
                href={`${mmtUrl}/${contentUrl}${contextParams}`.replace(
                  ':sTeX/declaration',
                  ':sTeX/symbol'
                )}
                target="_blank"
                rel="noreferrer"
              >
                <IconButton>
                  <OpenInNew />
                </IconButton>
              </a>
            </Box>
          </Box>

          <ContentFromUrl
            topLevelDocUrl={topLevelDocUrl}
            url={`${contentUrl}${contextParams}`}
            modifyRendered={getChildrenOfBodyNode}
          />

          <DialogActions sx={{ p: '0' }}>
            <Button onClick={() => setOpen(false)}>{t.close}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </ErrorBoundary>
  );
}
