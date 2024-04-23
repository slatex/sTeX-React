import { Box } from '@mui/material';
import { getCourseInfo } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { CourseInfo } from '@stex-react/utils';
import { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { CourseThumb } from './u/[institution]';

const CourseList: NextPage = () => {
  const { mmtUrl } = useContext(ServerLinksContext);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);
  const groupedCourses: { [institution: string]: CourseInfo[] } = {};
  Object.values(courses).forEach((course) => {
    if (!groupedCourses[course.institution]) {
      groupedCourses[course.institution] = [];
    }
    groupedCourses[course.institution].push(course);
  });
  return (
    <MainLayout title="Course-List | VoLL-KI">
      <Box m="0 auto" maxWidth="800px">
        {Object.entries(groupedCourses).map(([institution, institutionCourses]) => (
          <Box key={institution}>
            <h2>{institution}</h2>
            <Box display="flex" flexWrap="wrap">
              {institutionCourses.map((c) => (
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
