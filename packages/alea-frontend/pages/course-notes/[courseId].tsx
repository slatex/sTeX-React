import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { getCourseInfo, getDocumentSections, TOCElem } from '@stex-react/api';
import { FTMLDocument, FTMLSetup } from '@stex-react/ftml-utils';
import { SectionReview, TrafficLightIndicator } from '@stex-react/stex-react-renderer';
import { CourseInfo, CoverageSnap, PRIMARY_COL } from '@stex-react/utils';
import axios from 'axios';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useRef, useState } from 'react';
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

const SectionWrap: React.FC<{
  uri: string;
  children: ReactNode;
  uriToTitle: Record<string, string>;
}> = ({ uri, children, uriToTitle }) => {
  return (
    <Box>
      {children}
      <SectionReview sectionUri={uri} sectionTitle={uriToTitle[uri] ?? ''} />
    </Box>
  );
};

function getSectionUriToTitle(toc: TOCElem[], uriToTitle: Record<string, string>) {
  for (const elem of toc) {
    if (elem.type === 'Section') {
      uriToTitle[elem.uri] = elem.title;
    }
    if ('children' in elem) {
      getSectionUriToTitle(elem.children, uriToTitle);
    }
  }
}

const CourseNotesPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const [gottos, setGottos] = useState<{ uri: string; timestamp: number }[] | undefined>(undefined);
  const [toc, setToc] = useState<TOCElem[] | undefined>(undefined);
  const uriToTitle = useRef<Record<string, string>>({});

  useEffect(() => {
    getCourseInfo().then(setCourses);
  }, []);

  useEffect(() => {
    const notes = courses?.[courseId]?.notes;
    if (!notes) return;
    setToc(undefined);
    getDocumentSections(notes).then(([css, toc]) => {
      setToc(toc);
      uriToTitle.current = {};
      getSectionUriToTitle(toc, uriToTitle.current);
    });
  }, [router.isReady, courses, courseId]);

  useEffect(() => {
    async function fetchGottos() {
      try {
        const response = await axios.get('/api/get-coverage-timeline');
        const currentSemData: CoverageSnap[] = response.data[courseId] || [];
        const coverageData = currentSemData
          .filter((item) => item.sectionName)
          .map((item) => ({
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

  if (!router.isReady || !courses || !gottos || !toc) {
    return <CircularProgress />;
  }
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }
  const { notes } = courseInfo;

  return (
    <MainLayout title={courseId.toUpperCase()}>
      <FTMLSetup>
        <FTMLDocument
          key={notes}
          document={{ uri: notes, toc: { Predefined: toc }, gottos }}
          onFragment={(uri, kind) => {
            if (kind.type === 'Section') {
              return (ch) => (
                <SectionWrap uri={uri} children={ch} uriToTitle={uriToTitle.current} />
              );
            }
          }}
          onSectionTitle={(uri, lvl) => {
            return <TrafficLightIndicator sectionUri={uri} />;
          }}
        />
      </FTMLSetup>
    </MainLayout>
  );
};

export default CourseNotesPage;
