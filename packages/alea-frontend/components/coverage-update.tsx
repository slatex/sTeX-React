import { FTML } from '@kwarc/ftml-viewer';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Paper,
  Typography,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { getAuthHeaders, getCourseInfo, getDocumentSections } from '@stex-react/api';
import {
  convertHtmlStringToPlain,
  CourseInfo,
  CoverageTimeline,
  LectureEntry,
  PRIMARY_COL,
} from '@stex-react/utils';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { createContext, useCallback, useEffect, useState } from 'react';
import { Section } from '../types';
import { CoverageUpdater } from './CoverageUpdater';

export const UnsavedChangesContext = createContext<{
  hasUnsavedChanges: () => boolean;
  showUnsavedDialog: boolean;
  setShowUnsavedDialog: (show: boolean) => void;
  pendingNavigation: string | null;
  setPendingNavigation: (path: string | null) => void;
  handleNavigationConfirm: () => void;
  handleNavigationCancel: () => void;
}>({
  hasUnsavedChanges: () => false,
  showUnsavedDialog: false,
  setShowUnsavedDialog: () => {},
  pendingNavigation: null,
  setPendingNavigation: () => {},
  handleNavigationConfirm: () => {},
  handleNavigationCancel: () => {},
});

function getSectionNames(data: FTML.TOCElem, level = 0): Section[] {
  const sections: Section[] = [];

  if (data.type === 'Section' && data.title) {
    sections.push({
      id: data.id,
      title: '\xa0'.repeat(level * 4) + convertHtmlStringToPlain(data.title),
      uri: data.uri,
    });
  }
  if (data.type === 'SkippedSection' || data.type === 'Section') level++;
  if ('children' in data) {
    for (const child of data.children) {
      sections.push(...getSectionNames(child, level));
    }
  }
  return sections;
}

const bounce = keyframes`
  0% { transform: rotate(0) translateY(0px); }
  15% { transform: rotate(5deg) translateY(-4px); }
  30% { transform: rotate(-5deg) translateY(-8px);}
  45% { transform: rotate(4deg) translateY(-12px); }
  60% { transform: rotate(-4deg) translateY(-12px); }
  75% { transform: rotate(2deg) translateY(-8px); }
  85% { transform: rotate(-2deg) translateY(-4px); }
  92% { transform: rotate(1deg) translateY(-2px); }
  100% { transform: rotate(0) translateY(0px); }
`;

const CoverageUpdatePage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const currentTab = router.query.tab as string;
  const [allSectionNames, setAllSectionNames] = useState<{ [courseId: string]: Section[] }>({});
  const [sectionNames, setSectionNames] = useState<Section[]>([]);
  const [snaps, setSnaps] = useState<LectureEntry[]>([]);
  const [savedSnaps, setSavedSnaps] = useState<LectureEntry[]>([]);
  const [coverageTimeline, setCoverageTimeline] = useState<CoverageTimeline>({});
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [previousTab, setPreviousTab] = useState<string | null>(null);

  const hasUnsavedChanges = useCallback(() => {
    if (savedSnaps.length !== snaps.length) return true;
    return snaps.some((snap, index) => {
      const savedSnap = savedSnaps[index];
      return JSON.stringify(snap) !== JSON.stringify(savedSnap);
    });
  }, [snaps, savedSnaps]);

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    },
    [hasUnsavedChanges]
  );

  const handleRouteChangeStart = useCallback(
    (url: string) => {
      if (currentTab === 'syllabus' && hasUnsavedChanges()) {
        const urlObj = new URL(url, window.location.origin);
        const targetTab = urlObj.searchParams.get('tab');

        console.log('Navigation detected:', {
          current: { tab: currentTab, courseId },
          target: { url, tab: targetTab },
        });

        if (targetTab !== 'syllabus') {
          console.log('Preventing navigation due to unsaved changes');

          router.events.emit('routeChangeError');

          setPendingNavigation(url);

          setShowUnsavedDialog(true);

          throw 'Route change aborted due to unsaved changes';
        }
      }
    },
    [
      currentTab,
      courseId,
      hasUnsavedChanges,
      router.events,
      setPendingNavigation,
      setShowUnsavedDialog,
    ]
  );

  useEffect(() => {
    if (!router.isReady) return;

    console.log('Setting up route change handlers for tab:', currentTab);

    router.events.on('routeChangeStart', handleRouteChangeStart);

    const handleTabChange = () => {
      if (previousTab === 'syllabus' && currentTab !== 'syllabus' && hasUnsavedChanges()) {
        console.log('Tab changed via query params with unsaved changes');

        setShowUnsavedDialog(true);
      }
    };

    if (previousTab !== currentTab && previousTab !== null) {
      handleTabChange();
    }

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router, currentTab, previousTab, handleRouteChangeStart, hasUnsavedChanges]);

  useEffect(() => {
    if (router.isReady && currentTab) {
      console.log(`Tab changed: ${previousTab} -> ${currentTab}`);

      if (previousTab === 'syllabus' && currentTab !== 'syllabus' && hasUnsavedChanges()) {
        console.log('Unsaved changes detected during tab change');

        setPendingNavigation(`${window.location.pathname}?tab=syllabus&courseId=${courseId}`);
        setShowUnsavedDialog(true);
      }

      setPreviousTab(currentTab);
    }
  }, [router.isReady, currentTab, hasUnsavedChanges, courseId, previousTab]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  useEffect(() => {
    axios.get('/api/get-coverage-timeline').then((resp) => {
      setCoverageTimeline(resp.data);
    });
  }, []);

  useEffect(() => {
    getCourseInfo().then(setCourses);
  }, []);

  useEffect(() => {
    const getSections = async () => {
      if (!Object.keys(courses).length) return;
      setLoading(true);
      try {
        const sectionPromises = Object.keys(courses).map(async (courseId) => {
          const { notes } = courses[courseId];
          try {
            const tocResp = await getDocumentSections(notes);
            const docSections = tocResp[1];
            return { courseId, sections: docSections.flatMap((d) => getSectionNames(d)) };
          } catch (error) {
            console.error(`Failed to fetch sections for ${courseId}:`, error);
            return { courseId, sections: [] };
          }
        });
        const results = await Promise.all(sectionPromises);
        const secNames = results.reduce((acc, { courseId, sections }) => {
          acc[courseId] = sections;
          return acc;
        }, {} as { [courseId: string]: Section[] });
        setAllSectionNames(secNames);
      } catch (error) {
        console.error('Failed to fetch all sections:', error);
        setSaveMessage({
          type: 'error',
          message: 'Failed to fetch sections. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    getSections();
  }, [courses]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length) return;
    const courseSnaps = coverageTimeline[courseId] || [];
    setSnaps(courseSnaps);
    setSavedSnaps(courseSnaps);
  }, [coverageTimeline, courseId, router.isReady]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length) return;
    setSectionNames(allSectionNames[courseId] || []);
  }, [allSectionNames, courseId, router.isReady]);

  const handleSave = async () => {
    const confirmText = "Did you make sure to click 'Add' button to add entries to the table?";
    if (!confirm(confirmText)) return;

    setLoading(true);
    try {
      const body = { courseId, snaps };
      const headers = getAuthHeaders();
      await axios.post('/api/set-coverage-timeline', body, { headers });
      setSavedSnaps(JSON.parse(JSON.stringify(snaps))); // Create a deep copy
      setSaveMessage({
        type: 'success',
        message: 'Coverage data saved successfully!',
      });

      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving coverage:', error);
      setSaveMessage({
        type: 'error',
        message: 'Failed to save coverage data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationConfirm = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      router.events.off('routeChangeStart', handleRouteChangeStart);

      router.push(pendingNavigation).then(() => {
        setTimeout(() => {
          router.events.on('routeChangeStart', handleRouteChangeStart);
        }, 0);
      });
      setPendingNavigation(null);
    }
  };

  const handleNavigationCancel = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  if (!router.isReady || !courseId || typeof courseId !== 'string') {
    return <div>Loading...</div>;
  }

  const contextValue = {
    hasUnsavedChanges,
    showUnsavedDialog,
    setShowUnsavedDialog,
    pendingNavigation,
    setPendingNavigation,
    handleNavigationConfirm,
    handleNavigationCancel,
  };

  return (
    <UnsavedChangesContext.Provider value={contextValue}>
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              my: 3,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              Syllabus for {courseId}
            </Typography>

            {saveMessage && (
              <Alert
                severity={saveMessage.type}
                sx={{ mb: 2 }}
                onClose={() => setSaveMessage(null)}
              >
                {saveMessage.message}
              </Alert>
            )}

            <Box
              sx={{
                mt: 2,
                overflow: 'auto',
              }}
            >
              <CoverageUpdater
                courseId={courseId}
                snaps={snaps}
                setSnaps={setSnaps}
                sectionNames={sectionNames}
              />
            </Box>

            {hasUnsavedChanges() && (
              <>
                <Box
                  sx={{
                    mt: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    color="error"
                    sx={{
                      fontWeight: 'medium',
                      textAlign: 'center',
                    }}
                  >
                    You have unsaved changes.
                  </Typography>
                </Box>
                <Fab
                  color="secondary"
                  size="large"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    border: `2px solid ${PRIMARY_COL}`,
                    boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease 0s',
                    animation: `${bounce} 1s infinite ease`,
                    ':hover': {
                      boxShadow: '0px 15px 20px rgba(0, 0, 0, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    zIndex: 1000,
                  }}
                >
                  <SaveIcon />
                </Fab>
              </>
            )}
          </Paper>
        </Container>

        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Dialog
          open={showUnsavedDialog}
          onClose={handleNavigationCancel}
          aria-labelledby="unsaved-changes-dialog-title"
        >
          <DialogTitle id="unsaved-changes-dialog-title">Unsaved Changes</DialogTitle>
          <DialogContent>
            <Typography>
              You have unsaved changes. Are you sure you want to leave this page?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleNavigationCancel} color="primary">
              Stay
            </Button>
            <Button onClick={handleNavigationConfirm} color="error" autoFocus>
              Leave
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </UnsavedChangesContext.Provider>
  );
};

export default CoverageUpdatePage;
