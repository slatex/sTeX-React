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
  getScrollInfo,
  scrollToClosestAncestorAndSetPending,
  TOCFileNode,
} from './collectIndexInfo';
import { ContentDashboard } from './ContentDashboard';
import { ContentFromUrl } from './ContentFromUrl';
import { ContentWithHighlight } from './ContentWithHightlight';
import { ExpandableContextMenu } from './ExpandableContextMenu';
import { FileBrowser } from './FileBrowser';
import { FileNode } from './FileNode';
import { DocSectionContext, InfoSidebar } from './InfoSidebar';
import { FixedPositionMenu, LayoutWithFixedMenu } from './LayoutWithFixedMenu';
import { mmtHTMLToReact, setSectionIds } from './mmtParser';
import { RenderOptions } from './RendererDisplayOptions';
import {
  DimIcon,
  LevelIcon,
  SelfAssessment2,
  SelfAssessmentDialog,
} from './SelfAssessmentDialog';
import { TourAPIEntry, TourDisplay } from './TourDisplay';

export const ServerLinksContext = createContext({ mmtUrl: '', lmsUrl: '' });

export function StexReactRenderer({
  contentUrl,
  topOffset = 0,
  noFrills = false,
}: {
  contentUrl: string;
  topOffset?: number;
  noFrills?: boolean;
}) {
  const [showDashboard, setShowDashboard] = useState(
    !shouldUseDrawer() && !IS_MMT_VIEWER
  );
  const [renderOptions, setRenderOptions] = useState({
    expandOnScroll:
      (localStore?.getItem('autoExpandOnScroll') || 'true') === 'true',
    allowFolding: (localStore?.getItem('sectionFolding') || 'false') === 'true',
    noFrills,
  });

  const [sectionLocs, setSectionLocs] = useState<{
    [contentUrl: string]: number;
  }>({});
  useEffect(() => setSectionLocs({}), [contentUrl]);

  const router = useRouter();
  useEffect(() => {
    if (!router?.isReady) return;
    const inDocPath = router?.query?.['inDocPath'] as string;
    if (!inDocPath && router) {
      const fileId = router.query['id'];
      router.query['inDocPath'] =
        localStore?.getItem(`inDocPath-${fileId}`) || '0';
      router.replace(router);
      return;
    }
    scrollToClosestAncestorAndSetPending(getScrollInfo(inDocPath));
  }, [router, router?.isReady, router?.query]);

  return (
    <DocSectionContext.Provider
      value={{
        sectionLocs,
        addSectionLoc: (sec) => {
          const { contentUrl: url, positionFromTop: pos } = sec;
          if (url in sectionLocs && Math.abs(pos - sectionLocs[url]) < 1) {
            return;
          }
          setSectionLocs((prev) => {
            return { ...prev, [url]: pos };
          });
        },
      }}
    >
      <RenderOptions.Provider
        value={{
          renderOptions,
          setRenderOptions: (o) => {
            localStore?.setItem(
              'autoExpandOnScroll',
              o.expandOnScroll.toString()
            );
            localStore?.setItem('sectionFolding', o.allowFolding.toString());
            setRenderOptions(o);
          },
        }}
      >
        <LayoutWithFixedMenu
          menu={
            <ContentDashboard
              onClose={() => setShowDashboard(false)}
              contentUrl={contentUrl}
              selectedSection={''}
            />
          }
          topOffset={topOffset}
          showDashboard={showDashboard}
          setShowDashboard={setShowDashboard}
          noFrills={noFrills}
        >
          <Box px="10px" bgcolor={BG_COLOR}>
            <Box
              maxWidth={IS_MMT_VIEWER ? undefined : '650px'}
              m="0 auto"
              sx={{ overflowWrap: 'anywhere' }}
              /** Temporary hack: make this reactive */
              {...({ style: { '--document-width': '600px' } } as any)}
            >
              {!noFrills && (
                <Box position="absolute" right="40px">
                  <ExpandableContextMenu contentUrl={contentUrl} />
                </Box>
              )}
              <Box display="flex">
                <ContentFromUrl
                  url={contentUrl}
                  modifyRendered={getChildrenOfBodyNode}
                  topLevel={true}
                />
                {!IS_MMT_VIEWER && (
                  <InfoSidebar
                    contentUrl={contentUrl}
                    topOffset={topOffset}
                    sectionLocs={sectionLocs}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </LayoutWithFixedMenu>
      </RenderOptions.Provider>
    </DocSectionContext.Provider>
  );
}
export {
  ContentDashboard,
  ContentFromUrl,
  ContentWithHighlight,
  DimIcon,
  ExpandableContextMenu,
  FixedPositionMenu,
  LayoutWithFixedMenu,
  LevelIcon,
  mmtHTMLToReact,
  SelfAssessmentDialog,
  SelfAssessment2,
  TourDisplay,
  FileBrowser,
  setSectionIds,
};
export type { FileNode, TourAPIEntry, TOCFileNode };
