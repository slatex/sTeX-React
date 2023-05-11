import ArticleIcon from '@mui/icons-material/Article';
import MergeIcon from '@mui/icons-material/Merge';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import { Box, Button, ToggleButtonGroup } from '@mui/material';
import {
  SectionInfo,
  SectionsAPIData,
  Slide,
  getDocumentSections,
} from '@stex-react/api';
import { CommentNoteToggleView } from '@stex-react/comments';
import {
  ContentDashboard,
  ContentWithHighlight,
  LayoutWithFixedMenu,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
import {
  COURSES_INFO,
  XhtmlContentUrl,
  getSectionInfo,
  localStore,
  shouldUseDrawer,
} from '@stex-react/utils';
import axios from 'axios';
import { NextPage } from 'next';
import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { SlideDeck } from '../../components/SlideDeck';
import { TooltipToggleButton } from '../../components/TooltipToggleButton';
import { VideoDisplay } from '../../components/VideoDisplay';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';

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
  const router = useRouter();
  const { courseView: t } = getLocaleObject(router);

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
      <TooltipToggleButton value={ViewMode.SLIDE_MODE} title={t.showSlides}>
        <SlideshowIcon />
      </TooltipToggleButton>
      <TooltipToggleButton value={ViewMode.VIDEO_MODE} title={t.showVideo}>
        <VideoCameraFrontIcon />
      </TooltipToggleButton>
      <TooltipToggleButton
        value={ViewMode.COMBINED_MODE}
        title={t.showSlidesAndVideo}
      >
        <MergeIcon />
      </TooltipToggleButton>
    </ToggleButtonGroup>
  );
}

function populateClipIds(
  sections: SectionInfo[],
  clipIds: { [sectionId: string]: string }
) {
  for (const section of sections) {
    clipIds[section.id] = section.clipId;
    populateClipIds(section.children, clipIds);
  }
}

export function setSlideNumAndSectionId(
  router: NextRouter,
  slideNum: number,
  sectionId?: string
) {
  const { pathname, query } = router;
  const courseId = query.courseId as string;
  if (sectionId) {
    query.sectionId = sectionId;
    localStore?.setItem(`lastReadSectionId-${courseId}`, sectionId);
  }
  query.slideNum = `${slideNum}`;
  localStore?.setItem(`lastReadSlideNum-${courseId}`, `${slideNum}`);
  router.push({ pathname, query });
}

function getSections(data: SectionsAPIData): string[] {
  const { children, id } = data;
  const sections: string[] = [];
  if (id) sections.push(id);
  (children || []).forEach((c) => {
    sections.push(...getSections(c));
  });
  return sections;
}

const CourseViewPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const sectionId = router.query.sectionId as string;
  const slideNum = +((router.query.slideNum as string) || 0);
  const viewModeStr = router.query.viewMode as string;
  const viewMode = ViewMode[viewModeStr as keyof typeof ViewMode];
  const audioOnlyStr = router.query.audioOnly as string;
  const audioOnly = audioOnlyStr === 'true';

  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());
  const [preNotes, setPreNotes] = useState([] as string[]);
  const [postNotes, setPostNotes] = useState([] as string[]);
  const [courseSections, setCourseSections] = useState<string[]>([]);
  const [slideCounts, setSlideCounts] = useState<{
    [sectionId: string]: number;
  }>({});

  const [clipIds, setClipIds] = useState<{ [sectionId: string]: string }>({});
  const [slideArchive, setSlideArchive] = useState('');
  const [slideFilepath, setSlideFilepath] = useState('');
  const { mmtUrl } = useContext(ServerLinksContext);

  const { courseView: t } = getLocaleObject(router);

  const [contentUrl, setContentUrl] = useState(undefined as string);

  useEffect(() => {
    if (!router.isReady) return;
    //console.log(COURSES_INFO[courseId].notesLink);
    const { notesArchive, notesFilepath } = COURSES_INFO[courseId];
    setContentUrl(XhtmlContentUrl(notesArchive, notesFilepath));
    axios
      .get(`/api/get-slide-counts/${courseId}`)
      .then((resp) => setSlideCounts(resp.data));
  }, [router.isReady, courseId]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length) return;
    axios.get(`/api/get-section-info/${courseId}`).then((r) => {
      const clipIds = {};
      populateClipIds(r.data, clipIds);
      setClipIds(clipIds);
    });
  }, [courseId, router.isReady]);

  useEffect(() => {
    if (!router.isReady) return;
    if (sectionId && slideNum && viewMode && audioOnlyStr) return;
    const { pathname, query } = router;
    if (!sectionId) {
      const inStore = localStore?.getItem(`lastReadSectionId-${courseId}`);
      if (inStore?.length) {
        query.sectionId = inStore;
      } else {
        const firstSection = Object.keys(slideCounts)?.[0];
        if (firstSection) query.sectionId = firstSection;
      }
    }
    if (!slideNum) {
      query.slideNum =
        localStore?.getItem(`lastReadSlideNum-${courseId}`) || '1';
    }
    if (!viewMode) {
      query.viewMode =
        localStore?.getItem('defaultMode') || ViewMode.SLIDE_MODE.toString();
    }
    if (!audioOnlyStr) {
      query.audioOnly = localStore?.getItem('audioOnly') || 'false';
    }
    router.push({ pathname, query });
  }, [
    router,
    router.isReady,
    sectionId,
    slideNum,
    viewMode,
    courseId,
    audioOnlyStr,
    slideCounts,
  ]);

  useEffect(() => {
    async function getIndex() {
      const { archive, filepath } = getSectionInfo(contentUrl);
      const docSections = await getDocumentSections(mmtUrl, archive, filepath);
      setCourseSections(getSections(docSections));
    }
    getIndex();
  }, [mmtUrl, contentUrl]);

  function goToPrevSection() {
    const secIdx = courseSections.indexOf(sectionId);
    if (secIdx === -1 || secIdx === 0) return;
    const secId = courseSections[secIdx - 1];
    setSlideNumAndSectionId(router, slideCounts[secId] ?? -1, secId);
  }

  function goToNextSection() {
    const secIdx = courseSections.indexOf(sectionId);
    if (secIdx === -1 || secIdx + 1 >= courseSections.length) return;
    const secId = courseSections[secIdx + 1];
    setSlideNumAndSectionId(router, 1, secId);
  }

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ' Course Slides | VoLL-KI'}
    >
      <LayoutWithFixedMenu
        menu={
          contentUrl?.length ? (
            <>
              <ContentDashboard
                onClose={() => setShowDashboard(false)}
                contentUrl={contentUrl}
                selectedSection={sectionId}
                onSectionClick={(sectionId: string) =>
                  setSlideNumAndSectionId(router, 1, sectionId)
                }
              />
            </>
          ) : null
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
              <Link href={COURSES_INFO[courseId]?.notesLink ?? ''} passHref>
                <Button size="small" variant="contained" sx={{ mr: '10px' }}>
                  {t.notes}&nbsp;
                  <ArticleIcon />
                </Button>
              </Link>
            </Box>
            {(viewMode === ViewMode.VIDEO_MODE ||
              viewMode === ViewMode.COMBINED_MODE) && (
              <VideoDisplay clipId={clipIds[sectionId]} audioOnly={audioOnly} />
            )}
            {(viewMode === ViewMode.SLIDE_MODE ||
              viewMode === ViewMode.COMBINED_MODE) && (
              <SlideDeck
                navOnTop={viewMode === ViewMode.COMBINED_MODE}
                courseId={courseId}
                sectionId={sectionId}
                onSlideChange={(slide: Slide) => {
                  setPreNotes(slide?.preNotes || []);
                  setPostNotes(slide?.postNotes || []);
                  setSlideArchive(slide?.archive);
                  setSlideFilepath(slide?.filepath);
                }}
                goToNextSection={goToNextSection}
                goToPrevSection={goToPrevSection}
                slideNum={slideNum}
              />
            )}
            <hr style={{ width: '98%', padding: '1px 0' }} />

            {viewMode !== ViewMode.VIDEO_MODE && (
              <CommentNoteToggleView
                file={{ archive: slideArchive, filepath: slideFilepath }}
                defaultPrivate={true}
                extraPanel={{
                  label: t.instructorNotes,
                  panelContent: (
                    <Box p="5px" sx={{ overflowX: 'auto' }}>
                      <RenderElements elements={preNotes} />
                      {preNotes.length > 0 && postNotes.length > 0 && (
                        <hr style={{ width: '98%' }} />
                      )}
                      <RenderElements elements={postNotes} />
                    </Box>
                  ),
                }}
              />
            )}
          </Box>
        </Box>
      </LayoutWithFixedMenu>
    </MainLayout>
  );
};

export default CourseViewPage;
