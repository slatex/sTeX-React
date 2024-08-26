import { CircularProgress } from '@mui/material';
import { getCourseInfo, getDocumentSections, SectionsAPIData } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { CourseInfo } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import ProblemList from 'packages/alea-frontend/components/ProblemList';
import { useContext, useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

const CourseProblemsPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;

  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const [sectionsData, setSectionsData] = useState<SectionsAPIData | undefined>(undefined);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    if (!courses || !courseId) return;
    const courseInfo = courses?.[courseId];
    if (!courseInfo) {
      router.replace('/');
      return;
    }

    const { notesArchive, notesFilepath } = courseInfo;
    getDocumentSections(mmtUrl, notesArchive, notesFilepath).then(setSectionsData);
  }, [courses, courseId]);

  if (!router.isReady || !courses) return <CircularProgress />;
  if (!sectionsData) return <CircularProgress />;

  return (
    <MainLayout title={`${(courseId || '').toUpperCase()} Problems | VoLL-KI`}>
      <ProblemList courseSections={sectionsData} courseId={courseId} />
    </MainLayout>
  );
};

export default CourseProblemsPage;
