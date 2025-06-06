import { FTML } from '@kwarc/ftml-viewer';
import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  Container,
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
} from '@stex-react/utils';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Section } from '../types';
import { CoverageUpdater } from './CoverageUpdater';

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
  const [coverageTimeline, setCoverageTimeline] = useState<CoverageTimeline>({});
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
  }, [coverageTimeline, courseId, router.isReady]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length) return;
    setSectionNames(allSectionNames[courseId] || []);
  }, [allSectionNames, courseId, router.isReady]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const body = { courseId, snaps };
      const headers = getAuthHeaders();
      await axios.post('/api/set-coverage-timeline', body, { headers });
      setSnaps(JSON.parse(JSON.stringify(snaps))); // Create a deep copy
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

          {saveMessage && (
            <Alert severity={saveMessage.type} sx={{ mb: 2 }} onClose={() => setSaveMessage(null)}>
              {saveMessage.message}
            </Alert>
          )}

          <Box sx={{ mt: 2, overflow: 'auto' }}>
            <CoverageUpdater
              courseId={courseId}
              snaps={snaps}
              setSnaps={setSnaps}
              sectionNames={sectionNames}
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

export default CoverageUpdatePage;
