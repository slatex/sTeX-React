import ListIcon from '@mui/icons-material/List';
import { Box, Drawer, IconButton } from '@mui/material';
import { BG_COLOR, getChildrenOfBodyNode, localStore } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  IndexNode,
  scrollToClosestAncestorAndSetPending,
  TOP_LEVEL,
} from './collectIndexInfo';
import { ContentDashboard } from './ContentDashboard';
import { ContentFromUrl } from './ContentFromUrl';
import { ContentWithHighlight } from './ContentWithHightlight';
import { ExpandableContextMenu } from './ExpandableContextMenu';
import { FileBrowser } from './FileBrowser';
import { FileNode } from './FileNode';
import MathJaxContext from './MathJaxContext';
import { mmtHTMLToReact } from './mmtParser';
import { RenderOptions } from './RendererDisplayOptions';
import { TourAPIEntry, TourDisplay } from './TourDisplay';

const W = typeof window === 'undefined' ? undefined : window;

function getToOpenContentHash(inDocPath: string) {
  if (!inDocPath?.length) return [];
  return inDocPath.split('.');
}

export function StexReactRenderer({
  contentUrl,
  topOffset = 0,
  dashInfo = undefined,
}: {
  contentUrl: string;
  topOffset?: number;
  dashInfo?: IndexNode;
}) {
  const [showDashboard, setShowDashboard] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isEmptyDash, setIsEmptyDash] = useState(true);
  const [offset, setOffset] = useState(topOffset);
  const [renderOptions, setRenderOptions] = useState({
    expandOnScroll:
      (localStore?.getItem('expandOnScroll') || 'true') === 'true',
    allowFolding: (localStore?.getItem('allowFolding') || 'false') === 'true',
  });
  const router = useRouter();
  const useDrawer = windowWidth < 800;

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
      setWindowWidth(W?.innerWidth || 0);
    }
    const intiialWidth = W?.innerWidth || 0;
    setWindowWidth(intiialWidth);
    if (intiialWidth < 800) setShowDashboard(false);
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

  useEffect(() => {
    if (!router?.isReady) return;
    const inDocPath = router?.query?.['inDocPath'] as string;
    scrollToClosestAncestorAndSetPending(getToOpenContentHash(inDocPath));
  }, [router?.isReady, router?.query]);

  return (
    <RenderOptions.Provider
      value={{
        renderOptions,
        setRenderOptions: (o) => {
          localStore?.setItem('expandOnScroll', o.expandOnScroll.toString());
          localStore?.setItem('allowFolding', o.allowFolding.toString());
          setRenderOptions(o);
        },
      }}
    >
      <Drawer
        anchor="left"
        open={useDrawer && showDashboard}
        onClose={() => setShowDashboard(false)}
      >
        <ContentDashboard
          onClose={() => setShowDashboard(false)}
          topOffset={offset}
          dashInfo={dashInfo}
        />
      </Drawer>

      {!useDrawer && showDashboard && (
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
            top: `${offset + 10}px`,
            left: '5px',
            border: '2px solid #777',
          }}
        >
          <ListIcon />
        </IconButton>
      )}

      <Box display="flex" px="10px" bgcolor={BG_COLOR}>
        {!useDrawer && showDashboard && (
          <Box flex="0 0 300px" display={{ xs: 'none', md: 'block' }}></Box>
        )}
        <Box maxWidth="600px" m="0 auto">
          <Box display="flex" flexDirection="row-reverse">
            <ExpandableContextMenu contentUrl={contentUrl} />
          </Box>
          <ContentFromUrl
            url={contentUrl}
            modifyRendered={getChildrenOfBodyNode}
            topLevel={true}
          />
        </Box>
      </Box>
    </RenderOptions.Provider>
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
