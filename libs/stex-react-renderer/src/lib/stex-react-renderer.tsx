import { Box } from '@mui/material';
import {
  BG_COLOR,
  getChildrenOfBodyNode,
  IS_MMT_VIEWER,
  localStore,
  shouldUseDrawer,
} from '@stex-react/utils';
import { useRouter } from 'next/router';
import { createContext, useEffect, useState } from 'react';
import {
  IndexNode,
  scrollToClosestAncestorAndSetPending,
} from './collectIndexInfo';
import { ContentDashboard } from './ContentDashboard';
import { ContentFromUrl } from './ContentFromUrl';
import { ContentWithHighlight } from './ContentWithHightlight';
import { ExpandableContextMenu } from './ExpandableContextMenu';
import { FileBrowser } from './FileBrowser';
import { FileNode } from './FileNode';
import { FixedPositionMenu, LayoutWithFixedMenu } from './LayoutWithFixedMenu';
import { mmtHTMLToReact, setSectionIds } from './mmtParser';
import { RenderOptions } from './RendererDisplayOptions';
import { TourAPIEntry, TourDisplay } from './TourDisplay';

function getToOpenContentHash(inDocPath: string) {
  if (!inDocPath?.length) return [];
  return inDocPath.split('.');
}

export const ServerLinksContext = createContext({ mmtUrl: '', lmsUrl: '' });

export function StexReactRenderer({
  contentUrl,
  topOffset = 0,
  dashInfo = undefined,
}: {
  contentUrl: string;
  topOffset?: number;
  dashInfo?: IndexNode;
}) {
  const [showDashboard, setShowDashboard] = useState(
    !shouldUseDrawer() && !IS_MMT_VIEWER
  );
  const [renderOptions, setRenderOptions] = useState({
    expandOnScroll:
      (localStore?.getItem('expandOnScroll') || 'true') === 'true',
    allowFolding: (localStore?.getItem('allowFolding') || 'false') === 'true',
  });
  const router = useRouter();

  useEffect(() => {
    if (!router?.isReady) return;
    const inDocPath = router?.query?.['inDocPath'] as string;
    if (!inDocPath && router) {
      const fileId = router.query['id'];
      router.query['inDocPath'] =
        localStore?.getItem(`inDocPath-${fileId}`) || '0';
      router.push(router);
      return;
    }
    scrollToClosestAncestorAndSetPending(getToOpenContentHash(inDocPath));
  }, [router, router?.isReady, router?.query]);

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
      <LayoutWithFixedMenu
        menu={
          <ContentDashboard
            onClose={() => setShowDashboard(false)}
            dashInfo={dashInfo}
          />
        }
        topOffset={topOffset}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
      >
        <Box px="10px" bgcolor={BG_COLOR}>
          <Box
            maxWidth={IS_MMT_VIEWER ? undefined : '600px'}
            m="0 auto"
            sx={{ overflowWrap: 'anywhere' }}
          >
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
      </LayoutWithFixedMenu>
    </RenderOptions.Provider>
  );
}
export {
  ContentFromUrl,
  ContentWithHighlight,
  ExpandableContextMenu,
  FixedPositionMenu,
  LayoutWithFixedMenu,
  mmtHTMLToReact,
  TourDisplay,
  FileBrowser,
  setSectionIds,
};
export type { FileNode, TourAPIEntry, IndexNode };
