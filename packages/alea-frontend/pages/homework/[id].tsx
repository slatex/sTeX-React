import { Box, CircularProgress, Typography } from '@mui/material';
import { getCourseInfo, getUserInfo } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { CourseInfo } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import HomeworkPerformanceTable from '../../components/HomeworkPerformanceTable';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';
import { CourseHeader } from '../course-home/[courseId]';
import { ForceFauLogin } from '../../components/ForceFAULogin';

const HomeworkPage: NextPage = () => {
  const router = useRouter();

  const courseId = router.query.id as string;
  const { homework: t, home: tHome } = getLocaleObject(router);

  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);

  const { mmtUrl } = useContext(ServerLinksContext);

  const [forceFauLogin, setForceFauLogin] = useState(false);

  useEffect(() => {
    getUserInfo().then((i) => {
      const uid = i?.userId;

      if (!uid) return;

      setForceFauLogin(uid.length !== 8 || uid.includes('@'));
    });
  });

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  if (!router.isReady || !courses) return <CircularProgress />;

  const courseInfo = courses[courseId];
  if (!courseInfo) {
    router.replace('/');

    return <>Course Not Found!</>;
  }

  if (forceFauLogin) {
    return (
      <MainLayout
        title={(courseId || '').toUpperCase() + ` ${tHome.courseThumb.homeworks} | VoLL-KI`}
      >
        <ForceFauLogin />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ` ${tHome.courseThumb.homeworks} | VoLL-KI`}
    >
      <CourseHeader
        courseName={courseInfo.courseName}
        imageLink={courseInfo.imageLink}
        courseId={courseId}
      />

      <Box maxWidth="900px" m="auto" px="10px">
        <Typography variant="h4" sx={{ m: '30px 0 15px' }}>
          {t.homeworkDashboard}
        </Typography>

        <Typography variant="body1" sx={{ color: '#333' }}>
          {t.onTimeWarning.replace('{courseId}', courseId.toUpperCase())}
        </Typography>

        <HomeworkPerformanceTable courseId={courseId} />
      </Box>
    </MainLayout>
  );
};

export default HomeworkPage;
