import { CircularProgress } from '@mui/material';
import { StexReactRenderer } from '@stex-react/stex-react-renderer';
import { COURSES_INFO, XhtmlContentUrl } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import MainLayout from '../../layouts/MainLayout';


const CourseNotesPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  if(!router.isReady) return <CircularProgress /> ;
  const courseInfo = COURSES_INFO[courseId];

  if(!courseInfo) {
    router.push('/');
    return <div>Course not found!</div>
  }

  const url = XhtmlContentUrl(courseInfo.notesArchive, courseInfo.notesFilepath);
  return (
    <MainLayout title="sTeX Browser">
      <StexReactRenderer contentUrl={url} topOffset={64} />
    </MainLayout>
  );
};

export default CourseNotesPage;
