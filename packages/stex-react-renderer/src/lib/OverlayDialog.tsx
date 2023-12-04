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
  getChildrenOfBodyNode,
  localStore,
  urlWithContextParams,
} from '@stex-react/utils';
import { useRouter } from 'next/router';
import { ReactNode, useContext, useState } from 'react';
import { ContentFromUrl, TopLevelContext } from './ContentFromUrl';
import { ErrorBoundary } from './ErrorBoundary';
import { getLocaleObject } from './lang/utils';
import { ServerLinksContext } from './stex-react-renderer';

const HOVER_SWITCH = 'hoverSwitch';
export function isHoverON() {
  return localStore?.getItem(HOVER_SWITCH) !== 'false';
}

function setHover(hover: boolean) {
  localStore?.setItem(HOVER_SWITCH, String(hover));
}

export function OverlayDialog({
  contentUrl,
  isMath,
  displayNode,
}: {
  contentUrl: string;
  isMath: boolean;
  displayNode: (topLevelDocUrl: string, locale: string) => ReactNode;
}) {
  const router = useRouter();
  const locale = router?.locale ?? 'en';
  const t = getLocaleObject(router);
  const [open, setOpen] = useState(false);
  const { mmtUrl } = useContext(ServerLinksContext);
  const { topLevelDocUrl } = useContext(TopLevelContext);
  const dialogContentUrl = urlWithContextParams(
    contentUrl,
    locale,
    topLevelDocUrl
  );
  const newWindowUrl = `${mmtUrl}/${dialogContentUrl}`.replace(
    ':sTeX/declaration',
    ':sTeX/symbol'
  );

  const toDisplayNode = displayNode(topLevelDocUrl, locale);

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
                  checked={isHoverON()}
                  onChange={() => {
                    setHover(!isHoverON());
                    window.location.reload();
                  }}
                />
              </Tooltip>
              <a
                style={{ marginLeft: 'auto' }}
                href={newWindowUrl}
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
            url={dialogContentUrl}
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
