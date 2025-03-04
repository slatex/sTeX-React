import SearchIcon from '@mui/icons-material/Search';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { getCourseInfo } from '@stex-react/api';
import { StexReactRenderer } from '@stex-react/stex-react-renderer';
import { CourseInfo, PRIMARY_COL, XhtmlContentUrl } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SearchCourseNotes from '../../components/SearchCourseNotes';
import { getLocaleObject } from '../../lang/utils';
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
};

const CourseNotesPage: NextPage = () => {
  const router = useRouter();
  const { home } = getLocaleObject(router);
  const t = home.courseThumb;
  const courseId = router.query.courseId as string;
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    getCourseInfo().then(setCourses);
  }, []);

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
  };

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }
  //Todo alea-4
  // const url = XhtmlContentUrl(courseInfo.notesArchive, courseInfo.notesFilepath);
  const url = ' ';

  return (
    <MainLayout title={(courseId || '').toUpperCase() + ` ${t.notes} | ALeA`}>
      <IconButton
        onClick={handleSearchClick}
        style={{
          position: 'fixed',
          right: '10px',
          top: '80px',
          zIndex: 1000,
          background: '#FFFFFFF0',
          transform: 'scale(1.1)',
        }}
      >
        <SearchIcon style={{ color: PRIMARY_COL }} />
      </IconButton>
      <SearchDialog open={dialogOpen} onClose={handleDialogClose} courseId={courseId} />
      <StexReactRenderer contentUrl={url} topOffset={64} />
    </MainLayout>
  );
};

export default CourseNotesPage;
