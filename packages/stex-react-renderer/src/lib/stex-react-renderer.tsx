import { Box } from '@mui/material';
import { getDocumentSections, SectionsAPIData } from '@stex-react/api';
import {
  BG_COLOR,
  getChildrenOfBodyNode,
  getSectionInfo,
  IS_MMT_VIEWER,
  localStore,
  shouldUseDrawer,
  Window,
} from '@stex-react/utils';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  getScrollInfo,
  scrollToClosestAncestorAndSetPending,
  TOCFileNode,
} from './collectIndexInfo';
import CompetencyTable from './CompetencyTable';
import { ContentDashboard } from './ContentDashboard';
import { ContentFromUrl } from './ContentFromUrl';
import { ContentWithHighlight } from './ContentWithHightlight';
import { ExpandableContent } from './ExpandableContent';
import { ExpandableContextMenu } from './ExpandableContextMenu';
import { FileBrowser } from './FileBrowser';
import { DocSectionContext, InfoSidebar } from './InfoSidebar';
import { FixedPositionMenu, LayoutWithFixedMenu } from './LayoutWithFixedMenu';
import { CustomItemsContext, mmtHTMLToReact } from './mmtParser';
import { RenderOptions } from './RendererDisplayOptions';
import {
  ConfigureLevelSlider,
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
    allowFolding: (localStore?.getItem('sectionFolding') || 'false') === 'true',
    noFrills,
  });

  const [sectionLocs, setSectionLocs] = useState<{
    [contentUrl: string]: number;
  }>({});
  const docSectionsElementMap = useRef(new Map<string, HTMLElement>()).current;
  const outerBox = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(600);
  const [docSections, setDocSections] = useState<SectionsAPIData | undefined>(
    undefined
  );
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    setSectionLocs({});
    docSectionsElementMap.clear();
  }, [contentUrl]);

  useEffect(() => {
    function handleResize() {
      const outerWidth = outerBox?.current?.clientWidth;
      if (!outerWidth) return;
      const spaceForCommentsAndPadding = 70;
      setContentWidth(Math.min(outerWidth - spaceForCommentsAndPadding, 900));
    }
    handleResize();
    Window?.addEventListener('resize', handleResize);
    return () => Window?.removeEventListener('resize', handleResize);
  }, []);

  const router = useRouter();
  useEffect(() => {
    if (!router?.isReady) return;
    const inDocPath = router?.query?.['inDocPath'] as string;
    if (!inDocPath && router) {
      const fileId = router.query['id'] || router.query['courseId'];
      router.query['inDocPath'] =
        localStore?.getItem(`inDocPath-${fileId}`) || '0';
      router.replace({ pathname: router.pathname, query: router.query });
      return;
    }
    scrollToClosestAncestorAndSetPending(
      docSectionsElementMap,
      getScrollInfo(inDocPath)
    );
  }, [router, router?.isReady, router?.query]);

  useEffect(() => {
    const { archive, filepath } = getSectionInfo(contentUrl);
    getDocumentSections(mmtUrl, archive, filepath).then(setDocSections);
  }, [mmtUrl, contentUrl]);

  return (
    <DocSectionContext.Provider
      value={{
        docSections,
        docSectionsElementMap,
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
            localStore?.setItem('sectionFolding', o.allowFolding.toString());
            setRenderOptions(o);
          },
        }}
      >
        <LayoutWithFixedMenu
          menu={
            <ContentDashboard
              docSections={docSections}
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
          <Box px="10px" bgcolor={BG_COLOR} ref={outerBox}>
            <Box
              sx={{ overflowWrap: 'anywhere', textAlign: 'left' }}
              width="max-content"
              {...({
                style: { '--document-width': `${contentWidth}px` },
              } as any)}
            >
              {!noFrills && (
                <Box position="absolute" right="40px">
                  <ExpandableContextMenu contentUrl={contentUrl} />
                </Box>
              )}
              <Box
                display="flex"
                justifyContent="space-around"
                textAlign="left"
              >
                <Box width={`${contentWidth}px`}>
                  <ContentFromUrl
                    topLevelDocUrl={contentUrl}
                    url={contentUrl}
                    modifyRendered={getChildrenOfBodyNode}
                  />
                </Box>
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
  CompetencyTable,
  ConfigureLevelSlider,
  ContentDashboard,
  ContentFromUrl,
  ContentWithHighlight,
  CustomItemsContext,
  DimIcon,
  ExpandableContent,
  ExpandableContextMenu,
  FileBrowser,
  FixedPositionMenu,
  LayoutWithFixedMenu,
  LevelIcon,
  mmtHTMLToReact,
  SelfAssessment2,
  SelfAssessmentDialog,
  TourDisplay,
};
export type { TOCFileNode, TourAPIEntry };
