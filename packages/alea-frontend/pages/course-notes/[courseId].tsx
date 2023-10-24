import { CircularProgress } from '@mui/material';
import { getCourseInfo } from '@stex-react/api';
import {
  ServerLinksContext,
  StexReactRenderer,
} from '@stex-react/stex-react-renderer';
import { CourseInfo, XhtmlContentUrl } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { getLocaleObject } from '../../lang/utils';

const CourseNotesPage: NextPage = () => {
  const router = useRouter();
  const { home } = getLocaleObject(router);
  const t = home.courseThumb;
  const courseId = router.query.courseId as string;
  const [courses, setCourses] = useState<
    { [id: string]: CourseInfo } | undefined
  >(undefined);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }
  const url = XhtmlContentUrl(
    courseInfo.notesArchive,
    courseInfo.notesFilepath
  );

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ` ${t.notes} | VoLL-KI`}
    >
      <StexReactRenderer contentUrl={url} topOffset={64} />
    </MainLayout>
  );
};

export default CourseNotesPage;
