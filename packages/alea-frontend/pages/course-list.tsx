import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Typography } from '@mui/material';
import { DocIdx, DocIdxType, getCourseInfo, getDocIdx } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { CourseInfo, PRIMARY_COL } from '@stex-react/utils';
import { NextPage } from 'next';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { CourseThumb } from './u/[institution]';

const CourseList: NextPage = () => {
  const { mmtUrl } = useContext(ServerLinksContext);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});
  const [docIdx, setDocIdx] = useState<DocIdx[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      if (mmtUrl) {
        const docIdxData = await getDocIdx(mmtUrl);
        setDocIdx(docIdxData);

        const courseInfoData = await getCourseInfo(mmtUrl);
        setCourses(courseInfoData);
      }
    };
    fetchData();
  }, [mmtUrl]);
  const groupedCourses: { [institution: string]: CourseInfo[] } = {};
  Object.values(courses).forEach((course) => {
    if (!groupedCourses[course.institution]) {
      groupedCourses[course.institution] = [];
    }
    groupedCourses[course.institution].push(course);
  });

  const universities = docIdx.filter((doc) => doc.type === DocIdxType.university);
  return (
    <MainLayout title="Course-List | VoLL-KI">
      <Box m="0 auto" maxWidth="800px">
        {Object.entries(groupedCourses).map(([institution, institutionCourses]) => (
          <Box key={institution}>
            <Typography variant="h3">{institution}</Typography>
            {universities.map((uni) => {
              if (uni.acronym !== institution) return null;
              return (
                <Box key={uni.title}>
                  <Typography display="flex" alignItems="center" fontWeight="bold">
                    {uni.title}{' '}
                    <Link href={uni.url} target="_blank">
                      <OpenInNewIcon style={{ color: PRIMARY_COL }} />
                    </Link>
                  </Typography>
                  <Typography>{uni.country + ', ' + uni.place}</Typography>
                  <Typography display="flex" alignItems="center">
                    View sources
                    <Link href={`https://gl.mathhub.info/${uni.archive}`} target="_blank">
                      <OpenInNewIcon style={{ color: PRIMARY_COL }} />
                    </Link>
                  </Typography>
                </Box>
              );
            })}
            <Box display="flex" flexWrap="wrap">
              {institutionCourses
                .filter((c) => !['rip', 'spinf'].includes(c.courseId))
                .map((c) => (
                  <CourseThumb key={c.courseId} course={c} />
                ))}
            </Box>
            <hr style={{ width: '90%' }} />
          </Box>
        ))}
      </Box>
    </MainLayout>
  );
};

export default CourseList;
