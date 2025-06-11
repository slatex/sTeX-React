import { FTML } from '@kwarc/ftml-viewer';
import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import { getAuthHeaders, getCourseInfo, getCoverageTimeline, getDocumentSections } from '@stex-react/api';
import {
  convertHtmlStringToPlain,
  CourseInfo,
  CoverageTimeline,
  LectureEntry,
} from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SecInfo } from '../types';
import { CoverageUpdater } from './CoverageUpdater';

export function getSecInfo(data: FTML.TOCElem, level = 0): SecInfo[] {
  const secInfo: SecInfo[] = [];

  if (data.type === 'Section' && data.title) {
    secInfo.push({
      id: data.id,
      title: '\xa0'.repeat(level * 4) + convertHtmlStringToPlain(data.title),
      uri: data.uri,
    });
  }
  if (data.type === 'SkippedSection' || data.type === 'Section') level++;
  if ('children' in data) {
    for (const child of data.children) {
      secInfo.push(...getSecInfo(child, level));
    }
  }
  return secInfo;
}

const CoverageUpdateTab = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const [secInfo, setSecInfo] = useState<Record<FTML.DocumentURI, SecInfo>>({});
  const [snaps, setSnaps] = useState<LectureEntry[]>([]);
  const [coverageTimeline, setCoverageTimeline] = useState<CoverageTimeline>({});
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    getCoverageTimeline().then(setCoverageTimeline);
  }, []);

  useEffect(() => {
    getCourseInfo().then(setCourses);
  }, []);

  useEffect(() => {
    const getSections = async () => {
      const courseInfo = courses?.[courseId];
      if (!courseInfo) return;
      const { notes: notesUri } = courseInfo;
      setLoading(true);
      try {
        const tocResp = await getDocumentSections(notesUri);
        const docSections = tocResp[1];
        const sections = docSections.flatMap((d) => getSecInfo(d));
        setSecInfo(
          sections.reduce((acc, s) => {
            acc[s.uri] = s;
            return acc;
          }, {} as Record<FTML.DocumentURI, SecInfo>)
        );
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
  }, [courses, courseId]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length) return;
    const courseSnaps = coverageTimeline[courseId] || [];
    setSnaps(courseSnaps);
  }, [coverageTimeline, courseId, router.isReady]);

  const handleSave = async (newSnaps: LectureEntry[]) => {
    setLoading(true);
    try {
      const body = { courseId, snaps: newSnaps };
      const headers = getAuthHeaders();
      await axios.post('/api/set-coverage-timeline', body, { headers });
      setSnaps(newSnaps);
      setSaveMessage({
        type: 'success',
        message: 'Coverage data saved successfully!',
      });
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

  if (!router.isReady || !courseId || typeof courseId !== 'string') {
    return <div>Loading...</div>;
  }

  return (
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

          <Snackbar
            open={!!saveMessage}
            autoHideDuration={8000}
            onClose={() => setSaveMessage(null)}
          >
            <Alert severity={saveMessage?.type}>{saveMessage?.message}</Alert>
          </Snackbar>

          <Box sx={{ mt: 2, overflow: 'auto' }}>
            <CoverageUpdater
              courseId={courseId}
              snaps={snaps}
              secInfo={secInfo}
              handleSave={handleSave}
            />
          </Box>
        </Paper>
      </Container>

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default CoverageUpdateTab;
