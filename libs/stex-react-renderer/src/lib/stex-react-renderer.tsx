import ListIcon from '@mui/icons-material/List';
import { Box, Drawer, IconButton } from '@mui/material';
import { BG_COLOR } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import { IndexNode, TOP_LEVEL } from './collectIndexInfo';
import { ContentDashboard } from './ContentDashboard';
import { ContentFromUrl } from './ContentFromUrl';
import { ExpandableContextMenu } from './ExpandableContextMenu';
import { FileBrowser } from './FileBrowser';
import { FileNode } from './FileNode';
import MathJaxContext from './MathJaxContext';
import { mmtHTMLToReact } from './mmtParser';
import { TourAPIEntry, TourDisplay } from './TourDisplay';
import { ContentWithHighlight } from './ContentWithHightlight';

const W = typeof window === 'undefined' ? undefined : window;

export function StexReactRenderer({
  contentUrl,
  topOffset = 0,
  dashInfo = undefined,
}: {
  contentUrl: string;
  topOffset?: number;
  dashInfo?: IndexNode;
}) {
  const [showDashboard, setShowDashboard] = useState(false);
  const [windowSize, setWindowSize] = useState(0);
  const [isEmptyDash, setIsEmptyDash] = useState(true);
  const [offset, setOffset] = useState(topOffset);

  useEffect(() => {
    const onScroll = () =>
      setOffset(Math.max(topOffset - (W?.pageYOffset || 0), 0));
    // clean up code
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [topOffset]);

  useEffect(() => {
    function handleResize() {
      setWindowSize(W?.innerWidth || 0);
    }
    setWindowSize(W?.innerWidth || 0);
    W?.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (dashInfo?.childNodes?.size) {
      setIsEmptyDash(false);
      return;
    }
    const interval = setInterval(() => {
      setIsEmptyDash(TOP_LEVEL.childNodes.size === 0);
    }, 3000);
    return () => clearInterval(interval);
  }, [dashInfo]);

  return (
    <>
      <Drawer
        anchor="left"
        // 800 is the size 'md'
        open={windowSize < 800 && showDashboard}
        onClose={() => setShowDashboard(false)}
      >
        <ContentDashboard
          onClose={() => setShowDashboard(false)}
          topOffset={offset}
          dashInfo={dashInfo}
        />
      </Drawer>

      {showDashboard && (
        <Box display={{ xs: 'none', md: 'block' }}>
          <ContentDashboard
            onClose={() => setShowDashboard(false)}
            topOffset={offset}
            dashInfo={dashInfo}
          />
        </Box>
      )}
      {!showDashboard && !isEmptyDash && (
        <IconButton
          onClick={() => setShowDashboard(true)}
          sx={{
            position: 'fixed',
            top: `${offset + 2}px`,
            left: '5px',
            border: '2px solid #777',
          }}
        >
          <ListIcon />
        </IconButton>
      )}

      <Box display="flex" px="10px" bgcolor={BG_COLOR}>
        {showDashboard && (
          <Box flex="0 0 300px" display={{ xs: 'none', md: 'block' }}></Box>
        )}
        <Box maxWidth="520px" m="0 auto">
          <Box display="flex" flexDirection="row-reverse">
            <ExpandableContextMenu contentUrl={contentUrl} />
          </Box>
          <ContentFromUrl
            url={contentUrl}
            modifyRendered={(bodyNode) => bodyNode?.props?.children}
            topLevel={true}
          />
        </Box>
      </Box>
    </>
  );
}
export {
  ContentFromUrl,
  ContentWithHighlight,
  mmtHTMLToReact,
  MathJaxContext,
  TourDisplay,
  FileBrowser,
};
export type { FileNode, TourAPIEntry, IndexNode };
