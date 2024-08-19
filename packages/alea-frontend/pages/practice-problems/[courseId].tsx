import { CircularProgress } from '@mui/material';
import { getCourseInfo } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { CourseInfo } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';
import ProblemList from 'packages/alea-frontend/components/ProblemList';
import ProblemList1 from 'packages/alea-frontend/components/ProblemList1';
import ProblemList2 from 'packages/alea-frontend/components/ProblemList2';
import ProblemList3 from 'packages/alea-frontend/components/ProblemList3';
import ProblemList4 from 'packages/alea-frontend/components/ProblemList4';

const CourseProblemsPage: NextPage = () => {
  const router = useRouter();
  const { home } = getLocaleObject(router);
  const t = home.courseThumb;
  const courseId = router.query.courseId as string;

  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const [data, setData] = useState<any>(null);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    if (mmtUrl) {
      getCourseInfo(mmtUrl).then(setCourses);
    }
  }, [mmtUrl]);

  useEffect(() => {
    if (courses && courseId) {
      const courseInfo = courses[courseId];
      if (courseInfo) {
        const { notesArchive, notesFilepath } = courseInfo;
        const contentUrl = `https://stexmmt.mathhub.info/:sTeX/sections?archive=${notesArchive}&filepath=${notesFilepath}`;

        const fetchData = async () => {
          try {
            const response = await fetch(contentUrl);
            const fetchedData = await response.json();
            setData(fetchedData);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };

        fetchData();
      }
    }
  }, [courses, courseId]);

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }

  if (!data) return <CircularProgress />;

  return (
    <MainLayout title={`${(courseId || '').toUpperCase()} ${t.notes} | VoLL-KI`}>
      <ProblemList data={data} courseId={courseId} />
      <ProblemList3 data={data} courseId={courseId} />
      <ProblemList4 data={data} courseId={courseId} />
      <ProblemList1 data={data} courseId={courseId} />
      <ProblemList2 data={data} courseId={courseId} />
    </MainLayout>
  );
};

export default CourseProblemsPage;
