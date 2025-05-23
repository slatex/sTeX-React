import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { TOCElem, getAuthHeaders, getCourseInfo, getDocumentSections } from '@stex-react/api';
import {
  CourseInfo,
  LectureEntry,
  CoverageTimeline,
  convertHtmlStringToPlain,
} from '@stex-react/utils';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { CoverageUpdater } from './CoverageUpdater';
import { Section } from '../types';
import { createContext } from 'react';

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

function getSectionNames(data: TOCElem, level = 0): Section[] {
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

            <Box
              sx={{
                mt: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSave}
                fullWidth
                disabled={!hasUnsavedChanges()}
                sx={{
                  py: 1.5,
                  maxWidth: '200px',
                }}
              >
                Save Changes
              </Button>

              <Typography
                variant="body2"
                color="error"
                sx={{
                  fontWeight: 'medium',
                  textAlign: 'center',
                }}
              >
                Your changes will not be saved until you click 'Save Changes'.
              </Typography>
            </Box>
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
