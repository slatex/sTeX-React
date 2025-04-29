import { 
  Box, 
  Button, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  Typography, 
  Container, 
  Paper, 
  useTheme, 
  useMediaQuery, 
  Alert, 
  Backdrop, 
  CircularProgress
} from '@mui/material';
import {
  DocumentURI,
  TOCElem,
  getAuthHeaders,
  getCourseInfo,
  getDocumentSections,
} from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  CourseInfo,
  CoverageSnap,
  CoverageTimeline,
  convertHtmlStringToPlain,
} from '@stex-react/utils';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { CoverageUpdater } from '../components/CoverageUpdater';
import MainLayout from '../layouts/MainLayout';

export interface Section {
  id: string;
  title: string;
  uri: DocumentURI;
}

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
  const [allSectionNames, setAllSectionNames] = useState<{ [courseId: string]: Section[] }>({});
  const [sectionNames, setSectionNames] = useState<Section[]>([]);
  const [snaps, setSnaps] = useState<CoverageSnap[]>([]);
  const [coverageTimeline, setCoverageTimeline] = useState<CoverageTimeline>({});
  const { mmtUrl } = useContext(ServerLinksContext);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    axios.get('/api/get-coverage-timeline').then((resp) => setCoverageTimeline(resp.data));
  }, []);

  useEffect(() => {
    if (mmtUrl) {
      getCourseInfo().then(setCourses);
    }
  }, [mmtUrl]);

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
          message: 'Failed to fetch sections. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    getSections();
  }, [mmtUrl, courses]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length) return;
    setSnaps(coverageTimeline[courseId] || []);
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
      setSaveMessage({
        type: 'success',
        message: 'Coverage data saved successfully!'
      });
      
      
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving coverage:', error);
      setSaveMessage({
        type: 'error',
        message: 'Failed to save coverage data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Coverage Update | ALeA">
      <Container maxWidth="xl">
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 3 },
            my: 3,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Coverage Update
          </Typography>
          
          <FormControl 
            variant="outlined" 
            fullWidth={isMobile}
            sx={{ 
              my: 2, 
              minWidth: { xs: '100%', sm: '200px' }
            }}
          >
            <InputLabel id="course-select-label">Course</InputLabel>
            <Select
              labelId="course-select-label"
              value={courseId ?? 'ai-2'}
              onChange={(e) => {
                const { pathname, query } = router;
                query.courseId = e.target.value;
                router.replace({ pathname, query });
              }}
              label="Course"
            >
              {Object.keys(courses).map((courseId) => (
                <MenuItem key={courseId} value={courseId}>
                  {courseId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
              overflow: 'auto'
            }}
          >
            <CoverageUpdater snaps={snaps} setSnaps={setSnaps} sectionNames={sectionNames} />
          </Box>
          
          <Box 
            sx={{ 
              mt: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSave}
              fullWidth={isMobile}
              sx={{ 
                py: 1.5,
                maxWidth: { xs: '100%', sm: '200px' }
              }}
            >
              Save Changes
            </Button>
            
            <Typography 
              variant="body2" 
              color="error"
              sx={{ 
                fontWeight: 'medium',
                textAlign: { xs: 'center', sm: 'right' }
              }}
            >
              Your changes will not be saved until you click 'Save Changes'.
            </Typography>
          </Box>
        </Paper>
      </Container>
      
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </MainLayout>
  );
};

export default CoverageUpdatePage;