import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { getCourseInfo } from '@stex-react/api';
import { FTMLDocument, FTMLSetup } from '@stex-react/ftml-utils';
import { CourseInfo, CoverageSnap, PRIMARY_COL } from '@stex-react/utils';
import axios from 'axios';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import SearchCourseNotes from '../../components/SearchCourseNotes';
import MainLayout from '../../layouts/MainLayout';

const SearchDialog = ({ open, onClose, courseId }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: PRIMARY_COL }}>
        {courseId.toUpperCase()}
      </DialogTitle>
      <DialogContent>
        <SearchCourseNotes courseId={courseId || ''} onClose={onClose} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
  /*
  <SearchDialog open={dialogOpen} onClose={handleDialogClose} courseId={courseId} />
  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setDialogOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };*/
};

const SectionWrap: React.FC<{ uri: string; children: ReactNode }> = ({ uri, children }) => {
  return (
    <div style={{ border: '1px solid red', margin: '1em 0', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <p>This is the start of a section: {uri}!</p>
      </div>
      {children}
      <div style={{ textAlign: 'center' }}>
        <p>This is the end of a section!</p>
      </div>
    </div>
  );
};

const CourseNotesPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const [gottos, setGottos] = useState<{ uri: string; timestamp: number }[] | undefined>(undefined);

  useEffect(() => {
    getCourseInfo().then(setCourses);
  }, []);

  useEffect(() => {
    async function fetchGottos() {
      try {
        const response = await axios.get('/api/get-coverage-timeline');
        const currentSemData: CoverageSnap[] = response.data[courseId] || [];
        const coverageData = currentSemData.map((item) => ({
          uri: item.sectionName,
          timestamp: item.timestamp_ms,
        }));
        setGottos(coverageData);
      } catch (error) {
        setGottos([]);
        console.error('Error fetching gottos:', error);
      }
    }
    if (courseId) fetchGottos();
  }, [courseId]);

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }
  const { notes } = courseInfo;

  return (
    <MainLayout title={courseId.toUpperCase()}>
      <FTMLSetup>
        {/* FTML does not effificent update if the props (i.e., gottos) are changed.
        Therefore, we only render it when all the props are ready. */}
        {gottos === undefined ? null : (
          <FTMLDocument
            document={{ uri: notes, toc: 'GET', gottos }}
            /*onFragment={(uri, kind) => {
              if (kind.type === 'Section') {
                return (ch) => <SectionWrap uri={uri}>{ch}</SectionWrap>;
              }
            }}*/
          />
        )}
      </FTMLSetup>
    </MainLayout>
  );
};

export default CourseNotesPage;
