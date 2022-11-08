import ArticleIcon from '@mui/icons-material/Article';
import MergeIcon from '@mui/icons-material/Merge';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import { Box, Button, ToggleButtonGroup } from '@mui/material';
import {
  ContentWithHighlight,
  LayoutWithFixedMenu,
} from '@stex-react/stex-react-renderer';
import { localStore, shouldUseDrawer } from '@stex-react/utils';
import { courseInfoFromLocalStorage, CourseSectioning } from '../../components/CourseSectioning';
import axios from 'axios';
import { NextPage } from 'next';
import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { useEffect, useReducer, useState } from 'react';
import { SlideDeck } from '../../components/SlideDeck';
import { SlideDeckNavigation } from '../../components/SlideDeckNavigation';
import { TooltipToggleButton } from '../../components/TooltipToggleButton';
import { VideoDisplay } from '../../components/VideoDisplay';
import MainLayout from '../../layouts/MainLayout';
import { CourseInfo, DeckAndVideoInfo, Slide } from '../../shared/types';

function RenderElements({ elements }: { elements: string[] }) {
  return (
    <>
      {elements.map((e, idx) => (
        <ContentWithHighlight key={idx} mmtHtml={e} />
      ))}
    </>
  );
}

enum ViewMode {
  SLIDE_MODE = 'SLIDE_MODE',
  VIDEO_MODE = 'VIDEO_MODE',
  COMBINED_MODE = 'COMBINED_MODE',
}
function ToggleModeButton({
  viewMode,
  updateViewMode,
}: {
  viewMode: ViewMode;
  updateViewMode: (mode: ViewMode) => void;
}) {
  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(event, newVal) => {
        if (!newVal) {
          newVal =
            viewMode === ViewMode.COMBINED_MODE
              ? ViewMode.SLIDE_MODE
              : ViewMode.COMBINED_MODE;
        }
        updateViewMode(newVal);
      }}
      sx={{ m: '5px 0', border: '1px solid black' }}
    >
      <TooltipToggleButton value={ViewMode.SLIDE_MODE} title="Show slides">
        <SlideshowIcon />
      </TooltipToggleButton>
      <TooltipToggleButton value={ViewMode.VIDEO_MODE} title="Show video">
        <VideoCameraFrontIcon />
      </TooltipToggleButton>
      <TooltipToggleButton
        value={ViewMode.COMBINED_MODE}
        title="Show slides and video"
      >
        <MergeIcon />
      </TooltipToggleButton>
    </ToggleButtonGroup>
  );
}

export function setSlideNumAndDeckId(
  router: NextRouter,
  slideNum: number,
  deckId?: string
) {
  const courseId = router.query.courseId as string;
  if (deckId) {
    router.query.deckId = deckId;
    localStore?.setItem(`lastReadDeckId-${courseId}`, deckId);
  }
  router.query.slideNum = `${slideNum}`;
  localStore?.setItem(`lastReadSlideNum-${courseId}`, `${slideNum}`);
  router.push(router);
}

function getDeckEndNodeId(deckStartNodeId: string, courseInfo: CourseInfo) {
  if (!courseInfo) return undefined;
  for (const [secIdx, sec] of courseInfo?.sections.entries() || []) {
    for (const [deckIdx, deck] of sec.decks.entries()) {
      if (deck.deckId !== deckStartNodeId) continue;
      if (deckIdx < sec.decks.length - 1) {
        return sec.decks[deckIdx + 1].deckId;
      } else if (secIdx < courseInfo.sections.length - 1) {
        return courseInfo.sections[secIdx + 1].decks[0].deckId;
      } else {
        console.error(`handling end not implemented [${deckStartNodeId}]!`);
        return undefined;
      }
    }
  }
  console.error(`Error: deck [${deckStartNodeId}] not found!`);
  return undefined;
}

const CourseViewPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const deckId = router.query.deckId as string;
  const slideNum = +((router.query.slideNum as string) || 0);
  const viewModeStr = router.query.viewMode as string;
  const viewMode = ViewMode[viewModeStr as keyof typeof ViewMode];
  const audioOnlyStr = router.query.audioOnly as string;
  const audioOnly = audioOnlyStr === 'true';

  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());
  const [preNotes, setPreNotes] = useState([] as string[]);
  const [postNotes, setPostNotes] = useState([] as string[]);
  const [courseInfo, setCourseInfo] = useState(undefined as CourseInfo);
  const [deckInfo, setDeckInfo] = useState(undefined as DeckAndVideoInfo);
  const [showSectioning, setShowSectioning] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const deckEndNodeId = getDeckEndNodeId(deckId, courseInfo);

  useEffect(() => {
    if (!router.isReady) return;
    if (deckId && slideNum && viewMode && audioOnlyStr) return;
    if (!deckId) {
      router.query.deckId =
        localStore?.getItem(`lastReadDeckId-${courseId}`) || 'initial';
    }
    if (!slideNum) {
      router.query.slideNum =
        localStore?.getItem(`lastReadSlideNum-${courseId}`) || '1';
    }
    if (!viewMode) {
      router.query.viewMode =
        localStore?.getItem('defaultMode') || ViewMode.SLIDE_MODE.toString();
    }
    if (!audioOnlyStr) {
      router.query.audioOnly = localStore?.getItem('audioOnly') || 'false';
    }
    router.push(router);
  }, [
    router,
    router.isReady,
    deckId,
    slideNum,
    viewMode,
    courseId,
    audioOnlyStr,
  ]);

  useEffect(() => {
    if (!router.isReady) return;
    const fromLocalStorage = courseInfoFromLocalStorage(courseId);
    if (fromLocalStorage) {
      setCourseInfo(fromLocalStorage);
    } else {
      axios.get(`/api/get-course-info/${courseId}`).then((r) => {
        setCourseInfo(r.data);
      });
    }
  }, [router.isReady, courseId]);

  useEffect(() => {
    for (const section of courseInfo?.sections || []) {
      for (const deck of section.decks) {
        if (deck.deckId === deckId) {
          setDeckInfo(deck);
          return;
        }
      }
    }
    setDeckInfo(undefined);
  }, [courseInfo, deckId]);

  function findCurrentLocation() {
    for (const [secIdx, section] of courseInfo?.sections?.entries() || [])
      for (const [deckIdx, deck] of section.decks.entries())
        if (deck.deckId === deckId) return { secIdx, deckIdx };
    return { secIdx: undefined, deckIdx: undefined };
  }

  function goToPrevSection() {
    const { secIdx, deckIdx } = findCurrentLocation();
    if (secIdx === undefined || deckIdx === undefined) return;
    if (deckIdx !== 0) {
      const deckId = courseInfo.sections[secIdx].decks[deckIdx - 1].deckId;
      setSlideNumAndDeckId(router, -1, deckId);
      return;
    }
    if (secIdx === 0) return;
    const prevDecks = courseInfo.sections[secIdx - 1].decks;
    const deckId = prevDecks[prevDecks.length - 1].deckId;
    setSlideNumAndDeckId(router, -1, deckId);
  }

  function goToNextSection() {
    const { secIdx, deckIdx } = findCurrentLocation();
    if (secIdx === undefined || deckIdx === undefined) return;
    const currSectionDecks = courseInfo.sections[secIdx].decks;
    if (deckIdx < currSectionDecks.length - 1) {
      const deckId = currSectionDecks[deckIdx + 1].deckId;
      setSlideNumAndDeckId(router, 1, deckId);
      return;
    }
    // last section is the "dummy" section. dont switch to that.
    if (secIdx >= courseInfo.sections.length - 2) return;
    const nextDecks = courseInfo.sections[secIdx + 1].decks;
    const deckId = nextDecks[0].deckId;
    setSlideNumAndDeckId(router, 1, deckId);
  }

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ' Course Slides | VoLL-KI'}
    >
      <LayoutWithFixedMenu
        menu={
          <SlideDeckNavigation
            sections={courseInfo?.sections || []}
            selected={deckId}
            onSelect={(deckId) => {
              setSlideNumAndDeckId(router, 1, deckId);
              setPreNotes([]);
              setPostNotes([]);
            }}
            onClose={() => setShowDashboard(false)}
          />
        }
        topOffset={64}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        drawerAnchor="left"
      >
        <Box display="flex">
          <Box maxWidth="800px" margin="0 auto" width="100%">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <ToggleModeButton
                viewMode={viewMode}
                updateViewMode={(mode) => {
                  const modeStr = mode.toString();
                  localStore?.setItem('defaultMode', modeStr);
                  router.query.viewMode = modeStr;
                  router.push(router);
                }}
              />
              <Link
                href="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FAI%26filepath%3Dcourse%2Fnotes%2Fnotes.xhtml"
                passHref
              >
                <Button size="small" variant="contained" sx={{ mr: '10px' }}>
                  Notes&nbsp;
                  <ArticleIcon />
                </Button>
              </Link>
            </Box>
            {(viewMode === ViewMode.VIDEO_MODE ||
              viewMode === ViewMode.COMBINED_MODE) && (
              <VideoDisplay deckInfo={deckInfo} audioOnly={audioOnly} />
            )}
            {(viewMode === ViewMode.SLIDE_MODE ||
              viewMode === ViewMode.COMBINED_MODE) && (
              <SlideDeck
                courseId={courseId}
                navOnTop={viewMode === ViewMode.COMBINED_MODE}
                deckStartNodeId={deckId}
                deckEndNodeId={deckEndNodeId}
                onSlideChange={(slide: Slide) => {
                  setPreNotes(slide?.preNotes || []);
                  setPostNotes(slide?.postNotes || []);
                }}
                goToNextSection={goToNextSection}
                goToPrevSection={goToPrevSection}
                slideNum={slideNum}
              />
            )}
            <hr
              style={{ width: '90%', padding: '1px 0', cursor: 'pointer' }}
              onClick={() => setShowSectioning(prompt('Code:') === 'go')}
            />

            {viewMode !== ViewMode.VIDEO_MODE && (
              <Box p="5px" sx={{ overflowX: 'auto' }}>
                <RenderElements elements={preNotes} />
                {preNotes.length > 0 && postNotes.length > 0 && (
                  <hr style={{ width: '90%' }} />
                )}
                <RenderElements elements={postNotes} />
              </Box>
            )}
          </Box>
          {showSectioning && (
            <CourseSectioning
              courseInfo={courseInfo}
              forceUpdate={forceUpdate}
            />
          )}
        </Box>
      </LayoutWithFixedMenu>
    </MainLayout>
  );
};

export default CourseViewPage;
