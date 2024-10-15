import { Box } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import CourseAccessControlDashboard from 'packages/alea-frontend/components/CourseAccessControlDashboard';
import HomeworkManager from 'packages/alea-frontend/components/HomeworkManager';
import QuizDashboard from 'packages/alea-frontend/components/QuizDashboard';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { Tabs, Tab } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { CourseHeader } from '../course-home/[courseId]';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { getCourseInfo } from '@stex-react/api';
import { CourseInfo } from '@stex-react/utils';
import { StudyBuddyModeratorStats } from 'packages/alea-frontend/components/StudyBuddyModeratorStats';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      sx={{ padding: '20px' }}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
};

const InstructorDash: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const [value, setValue] = useState(0);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  const courseInfo = courses?.[courseId];

  return (
    <MainLayout>
      <CourseHeader
        courseName={courseInfo?.courseName}
        imageLink={courseInfo?.imageLink}
        courseId={courseId}
      />
      <Box sx={{ width: '100%', margin: 'auto', maxWidth: '900px' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Instructor Dashboard Tabs"
          sx={{
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center',
            },
            '& .MuiTab-root': {
              fontSize: '14px',
              minWidth: '120px',
              textTransform: 'none',
            },
          }}
        >
          <Tab label="Access Control" />
          <Tab label="Homework Manager" />
          <Tab label="Quiz Dashboard" />
          <Tab label="Study Buddy" />
        </Tabs>
        <TabPanel value={value} index={0}>
          <CourseAccessControlDashboard courseId={courseId} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <HomeworkManager courseId={courseId} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <QuizDashboard courseId={courseId} />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <StudyBuddyModeratorStats courseId={courseId} />
        </TabPanel>
      </Box>
    </MainLayout>
  );
};

export default InstructorDash;
