import { Box, CircularProgress } from '@mui/material';
import { getDocumentSections } from '@stex-react/api';
import {
  BG_COLOR,
  IS_MMT_VIEWER,
  Window,
  getChildrenOfBodyNode,
  getSectionInfo,
  localStore,
  shouldUseDrawer,
} from '@stex-react/utils';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import SectionReview from './SectionReview';
import CompetencyTable from './CompetencyTable';
import { ContentDashboard } from './ContentDashboard';
import { ContentFromUrl } from './ContentFromUrl';
import { ContentWithHighlight, DisplayReason } from './ContentWithHightlight';
import { DocFragManager } from './DocFragManager';
import { DocProblemBrowser } from './DocProblemBrowser';
import { DocumentWidthSetter } from './DocumentWidthSetter';
import { ExpandableContent } from './ExpandableContent';
import { ExpandableContextMenu } from './ExpandableContextMenu';
import { FileBrowser } from './FileBrowser';
import { DocSectionContext, InfoSidebar } from './InfoSidebar';
import { FixedPositionMenu, LayoutWithFixedMenu } from './LayoutWithFixedMenu';
import { ListStepper, QuizDisplay } from './QuizDisplay';
import { RenderOptions } from './RendererDisplayOptions';
import {
  ConfigureLevelSlider,
  DimIcon,
  LevelIcon,
  SelfAssessment2,
  SelfAssessmentDialog,
} from './SelfAssessmentDialog';
import { TourAPIEntry, TourDisplay } from './TourDisplay';
import { TOCFileNode, getScrollInfo } from './collectIndexInfo';
import {
  CustomItemsContext,
  NoMaxWidthTooltip,
  PositionProvider,
  mmtHTMLToReact,
} from './mmtParser';
import { DimAndURIListDisplay, ProblemDisplay, URIListDisplay } from './ProblemDisplay';
import { GradingCreator } from './GradingCreator';
import { GradingContext } from './SubProblemAnswer';
import { PracticeQuestions } from './PracticeQuestions';
import { defaultProblemResponse } from './InlineProblemDisplay';
import { PerSectionQuiz } from './PerSectionQuiz';
//import { RenderStatusTree } from './RenderStatusTree';

export const ServerLinksContext = createContext({ mmtUrl: '', gptUrl: '' });

export function StexReactRenderer({
  contentUrl,
  topOffset = 0,
  noFrills = false,
  displayReason = DisplayReason.NOTES,
}: {
  contentUrl: string;
  topOffset?: number;
  noFrills?: boolean;
  displayReason?: DisplayReason;
}) {
  const router = useRouter();
  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer() && !IS_MMT_VIEWER);
  const [renderOptions, setRenderOptions] = useState({
    noFrills,
  });
  const [sectionLocs, setSectionLocs] = useState<{
    [contentUrl: string]: number;
  }>({});
  const outerBox = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(600);
  const [docFragManager, setDocFragManager] = useState(new DocFragManager());
  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    setSectionLocs({});
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

  useEffect(() => {
    if (!router?.isReady) return;
    const inDocPath = router?.query?.['inDocPath'] as string;
    if (!inDocPath && router) {
      const fileId = router.query['id'] || router.query['courseId'];
      router.query['inDocPath'] = localStore?.getItem(`inDocPath-${fileId}`) || '0';
      router.replace({ pathname: router.pathname, query: router.query });
      return;
    }
    docFragManager.scrollToSection(getScrollInfo(inDocPath).sectionId);
  }, [router, router?.isReady, router?.query]);

  //Todo alea-4
  // useEffect(() => {
  //   const { archive, filepath } = getSectionInfo(contentUrl);
  //   getDocumentSections(mmtUrl, archive, filepath).then((s) => {
  //     docFragManager.setDocSections(s);
  //     forceRerender();
  //   });
  // }, [mmtUrl, contentUrl]);

  // if (!docFragManager.docSections) return <CircularProgress />;

  return (
    <DocSectionContext.Provider
      value={{
        docFragManager,
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
            setRenderOptions(o);
          },
        }}
      >
        <LayoutWithFixedMenu
          menu={
            <ContentDashboard
              docSections={docFragManager.docSections}
              courseId={router?.query?.courseId as string}
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
          {/*<Box
            position="fixed"
            top="150px"
            left="320px"
            bgcolor="white"
            height="60vh"
            width="40vw"
            zIndex={1000}
            border="1px solid black"
            overflow="auto"
          >
            <RenderStatusTree docFragManager={docFragManager} />
        </Box>*/}
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
              <Box display="flex" justifyContent="space-around" textAlign="left">
                <Box width={`${contentWidth}px`}>
                  <ContentFromUrl
                    displayReason={displayReason}
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
  SectionReview,
  CompetencyTable,
  ConfigureLevelSlider,
  ContentDashboard,
  ContentFromUrl,
  ContentWithHighlight,
  CustomItemsContext,
  DimAndURIListDisplay,
  DimIcon,
  DisplayReason,
  DocProblemBrowser,
  DocumentWidthSetter,
  ExpandableContent,
  ExpandableContextMenu,
  FileBrowser,
  FixedPositionMenu,
  GradingContext,
  GradingCreator,
  LayoutWithFixedMenu,
  LevelIcon,
  ListStepper,
  NoMaxWidthTooltip,
  PerSectionQuiz,
  PositionProvider,
  PracticeQuestions,
  ProblemDisplay,
  QuizDisplay,
  SelfAssessment2,
  SelfAssessmentDialog,
  TourDisplay,
  URIListDisplay,
  defaultProblemResponse,
  mmtHTMLToReact,
};
export type { TOCFileNode, TourAPIEntry };
