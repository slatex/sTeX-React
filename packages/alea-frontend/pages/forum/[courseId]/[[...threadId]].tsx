import { Box, CircularProgress } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ForumView } from '../../../components/ForumView';
import MainLayout from '../../../layouts/MainLayout';
import { CourseHeader } from '../../course-home/[courseId]';
import { ThreadView } from '../../../components/ThreadView';
import { useContext, useEffect, useState } from 'react';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { getCourseInfo } from '@stex-react/api';
import { CourseInfo } from '@stex-react/utils';

const ForumPage: NextPage = () => {
  const router = useRouter();
  const courseId = router?.query?.courseId as string;
  const threadId = +(router?.query?.threadId?.[0] as string);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [courses, setCourses] = useState<
    { [id: string]: CourseInfo } | undefined
  >(undefined);

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }
  return (
    <MainLayout>
      <CourseHeader courseInfo={courseInfo} />
      <Box maxWidth="800px" m="auto" px="10px">
        {threadId ? (
          <ThreadView threadId={threadId} courseId={courseId} />
        ) : (
          <ForumView />
        )}
      </Box>
    </MainLayout>
  );
};

export default ForumPage;
