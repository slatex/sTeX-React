import ArticleIcon from '@mui/icons-material/Article';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import {
  SectionInfo,
  SectionsAPIData,
  Slide,
  SlideClipInfo,
  getAncestors,
  getCourseInfo,
  getDocumentSections,
  lastFileNode,
} from '@stex-react/api';
import { CommentNoteToggleView } from '@stex-react/comments';
import {
  ContentDashboard,
  ContentWithHighlight,
  LayoutWithFixedMenu,
  SectionReview,
  ServerLinksContext,
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';
import {
  CourseInfo,
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
import { VideoDisplay } from '../../components/VideoDisplay';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';
import { VideoCameraBack } from '@mui/icons-material';

function RenderElements({ elements }: { elements: string[] }) {
  return (
    <>
      {elements.map((e, idx) => (
        <ContentWithHighlight key={idx} mmtHtml={e} />
      ))}
    </>
  );
}

export enum ViewMode {
  SLIDE_MODE = 'SLIDE_MODE',
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

  const isCombinedMode = viewMode === ViewMode.COMBINED_MODE;
  const buttonLabel = isCombinedMode ? t.hideVideo : t.showVideo;

  return (
    <Button
      variant="outlined"
      onClick={() => {
        const newMode = isCombinedMode ? ViewMode.SLIDE_MODE : ViewMode.COMBINED_MODE;
        updateViewMode(newMode);
      }}
      sx={{
        m: '5px 0',
        '&:hover': {
          backgroundColor: 'primary.main',
          color: 'white',
        },
      }}
    >
      {buttonLabel}
      <VideoCameraBack sx={{ ml: '5px' }} />
    </Button>
  );
}

function populateClipIds(sections: SectionInfo[], clipIds: { [sectionId: string]: string }) {
  for (const section of sections) {
    clipIds[section.id] = section.clipId;
    populateClipIds(section.children, clipIds);
  }
}
function populateSlidesClipInfos(
  sections: SectionInfo[],
  slidesClipInfo: { [sectionId: string]: SlideClipInfo[] }
) {
  for (const section of sections) {
    slidesClipInfo[section.id] = section.clipInfo;
    populateSlidesClipInfos(section.children, slidesClipInfo);
  }
}

export function setSlideNumAndSectionId(router: NextRouter, slideNum: number, sectionId?: string) {
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
  const [docSections, setDocSections] = useState<SectionsAPIData | undefined>(undefined);
  const [courseSections, setCourseSections] = useState<string[]>([]);
  const [slideCounts, setSlideCounts] = useState<{
    [sectionId: string]: number;
  }>({});

  const [clipIds, setClipIds] = useState<{ [sectionId: string]: string }>({});
  const [slidesClipInfo, setSlidesClipInfo] = useState<{ [sectionId: string]: SlideClipInfo[] }>(
    {}
  );
  const [currentClipId, setCurrentClipId] = useState('');
  const [currentSlideClipInfo, setCurrentSlideClipInfo] = useState<SlideClipInfo>(null);
  const [slideArchive, setSlideArchive] = useState('');
  const [slideFilepath, setSlideFilepath] = useState('');
  const { mmtUrl } = useContext(ServerLinksContext);
  const { courseView: t, home: tHome } = getLocaleObject(router);
  const [contentUrl, setContentUrl] = useState(undefined as string);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const [timestampSec, setTimestampSec] = useState(0);
  useEffect(() => {
    getCourseInfo().then(setCourses);
  }, []);

  useEffect(() => {
    if (!router.isReady || !courses?.[courseId]) return;
    const { notesArchive, notesFilepath } = courses[courseId];
    setContentUrl(XhtmlContentUrl(notesArchive, notesFilepath));
    axios.get(`/api/get-slide-counts/${courseId}`).then((resp) => setSlideCounts(resp.data));
  }, [router.isReady, courses, courseId]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length) return;
    axios.get(`/api/get-section-info/${courseId}`).then((r) => {
      const clipIds = {};
      populateClipIds(r.data, clipIds);
      setClipIds(clipIds);
      const slidesClipInfo = {};
      populateSlidesClipInfos(r.data, slidesClipInfo);
      setSlidesClipInfo(slidesClipInfo);
    });
  }, [courseId, router.isReady]);

  useEffect(() => {
    if (!router.isReady) return;
    if (sectionId && slideNum && viewMode && audioOnlyStr) return;
    const { pathname, query } = router;
    let someParamMissing = false;
    if (!sectionId) {
      someParamMissing = true;
      const inStore = localStore?.getItem(`lastReadSectionId-${courseId}`);
      if (inStore?.length) {
        query.sectionId = inStore;
      } else {
        const firstSection = Object.keys(slideCounts)?.[0];
        if (firstSection) query.sectionId = firstSection;
      }
    }
    if (!slideNum) {
      someParamMissing = true;
      query.slideNum = localStore?.getItem(`lastReadSlideNum-${courseId}`) || '1';
    }
    if (!viewMode) {
      someParamMissing = true;
      query.viewMode = localStore?.getItem('defaultMode') || ViewMode.COMBINED_MODE.toString();
    }
    if (!audioOnlyStr) {
      someParamMissing = true;
      query.audioOnly = localStore?.getItem('audioOnly') || 'false';
    }
    if (someParamMissing) router.replace({ pathname, query });
  }, [router, router.isReady, sectionId, slideNum, viewMode, courseId, audioOnlyStr, slideCounts]);

  useEffect(() => {
    async function getIndex() {
      const { archive, filepath } = getSectionInfo(contentUrl);
      const docSections = await getDocumentSections(mmtUrl, archive, filepath);
      setDocSections(docSections);
      setCourseSections(getSections(docSections));
    }
    getIndex();
  }, [mmtUrl, contentUrl]);
  useEffect(() => {
    if (!sectionId) return;
    const newClipId = slidesClipInfo?.[sectionId]?.[0]?.clipId || clipIds?.[sectionId] || null;
    setCurrentClipId(newClipId);
  }, [slidesClipInfo, clipIds, sectionId]);

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

  if (!router.isReady || !courses) return <CircularProgress />;
  if (!courses[courseId]) {
    router.replace('/');
    return <>Course Not Found!</>;
  }
  const ancestors = getAncestors(undefined, undefined, sectionId, docSections);
  const sectionParentInfo = lastFileNode(ancestors);
  const sectionNode = ancestors?.length > 0 ? ancestors.at(-1) : undefined;
  const { archive, filepath } = sectionParentInfo ?? {};

  return (
    <MainLayout title={(courseId || '').toUpperCase() + ` ${tHome.courseThumb.slides} | ALeA`}>
      <LayoutWithFixedMenu
        menu={
          contentUrl?.length ? (
            <>
              <ContentDashboard
                courseId={courseId}
                docSections={docSections}
                contentUrl={contentUrl}
                selectedSection={sectionId}
                onClose={() => setShowDashboard(false)}
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
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <ToggleModeButton
                viewMode={viewMode}
                updateViewMode={(mode) => {
                  const modeStr = mode.toString();
                  localStore?.setItem('defaultMode', modeStr);
                  router.query.viewMode = modeStr;
                  router.replace(router);
                }}
              />
              <Link href={courses[courseId]?.notesLink ?? ''} passHref>
                <Button size="small" variant="contained" sx={{ mr: '10px' }}>
                  {t.notes}&nbsp;
                  <ArticleIcon />
                </Button>
              </Link>
            </Box>
            <Box sx={{ marginBottom: '10px', marginTop: '10px' }}>
              <Typography variant="h6" sx={{ color: '#333' }}>
                {mmtHTMLToReact(sectionNode?.title || '')}
              </Typography>
            </Box>
            {viewMode === ViewMode.COMBINED_MODE && (
              <VideoDisplay
                clipId={currentClipId}
                setCurrentClipId={setCurrentClipId}
                audioOnly={audioOnly}
                timestampSec={timestampSec}
                setTimestampSec={setTimestampSec}
                currentSlideClipInfo={currentSlideClipInfo}
              />
            )}
            {(viewMode === ViewMode.SLIDE_MODE || viewMode === ViewMode.COMBINED_MODE) && (
              <SlideDeck
                navOnTop={viewMode === ViewMode.COMBINED_MODE}
                courseId={courseId}
                sectionId={sectionId}
                topLevelDocUrl={XhtmlContentUrl(
                  courses[courseId]?.notesArchive,
                  courses[courseId]?.notesFilepath
                )}
                onSlideChange={(slide: Slide) => {
                  setPreNotes(slide?.preNotes || []);
                  setPostNotes(slide?.postNotes || []);
                  setSlideArchive(slide?.archive);
                  setSlideFilepath(slide?.filepath);
                }}
                goToNextSection={goToNextSection}
                goToPrevSection={goToPrevSection}
                onCurrentSlideClipInfoChange={(clipInfo: SlideClipInfo) => {
                  setCurrentSlideClipInfo(clipInfo);
                }}
                slideNum={slideNum}
                slidesClipInfo={slidesClipInfo}
              />
            )}
            <hr style={{ width: '98%', padding: '1px 0' }} />
            <Box sx={{ marginTop: '10px', marginBottom: '10px' }}>
              <SectionReview
                contentUrl={XhtmlContentUrl(archive, filepath)}
                sectionTitle={sectionNode?.title}
              />
            </Box>
            <CommentNoteToggleView
              file={{ archive: slideArchive, filepath: slideFilepath }}
              defaultPrivate={true}
              extraPanel={{
                label: t.instructorNotes,
                panelContent: (
                  <Box p="5px" sx={{ overflowX: 'auto' }}>
                    <RenderElements elements={preNotes} />
                    {preNotes.length > 0 && postNotes.length > 0 && <hr style={{ width: '98%' }} />}
                    <RenderElements elements={postNotes} />
                  </Box>
                ),
              }}
            />
          </Box>
        </Box>
      </LayoutWithFixedMenu>
    </MainLayout>
  );
};

export default CourseViewPage;
