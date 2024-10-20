import { Box, Tab, Tabs } from '@mui/material';
import { getCourseInfo } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { CourseInfo } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import CourseAccessControlDashboard from 'packages/alea-frontend/components/CourseAccessControlDashboard';
import HomeworkManager from 'packages/alea-frontend/components/HomeworkManager';
import QuizDashboard from 'packages/alea-frontend/components/QuizDashboard';
import { StudyBuddyModeratorStats } from 'packages/alea-frontend/components/StudyBuddyModeratorStats';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { useContext, useEffect, useState } from 'react';
import { CourseHeader } from '../../course-home/[courseId]';
import { ProblemReviewModeratorStats } from 'packages/alea-frontend/components/ProblemReviewModeratorStats';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

type TabName =
  | 'access-control'
  | 'homework-manager'
  | 'quiz-dashboard'
  | 'study-buddy'
  | 'problem-review';

const TAB_MAPPING: Record<TabName, number> = {
  'access-control': 0,
  'homework-manager': 1,
  'quiz-dashboard': 2,
  'study-buddy': 3,
  'problem-review': 4,
};

function ChosenTab({ tabName, courseId }: { tabName: TabName; courseId: string }) {
  switch (tabName) {
    case 'access-control':
      return <CourseAccessControlDashboard courseId={courseId} />;
    case 'homework-manager':
      return <HomeworkManager courseId={courseId} />;
    case 'quiz-dashboard':
      return <QuizDashboard courseId={courseId} />;
    case 'study-buddy':
      return <StudyBuddyModeratorStats courseId={courseId} />;
    case 'problem-review':
      return <ProblemReviewModeratorStats courseId={courseId}></ProblemReviewModeratorStats>
    default:
      return null;
  }
}

const toUserFriendlyName = (tabName: string) => {
  return tabName
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\b\w/g, (str) => str.toUpperCase()); // Capitalize the first letter of each word
};

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
  const tab = router.query.tab as TabName;

  const { mmtUrl } = useContext(ServerLinksContext);
  const [courses, setCourses] = useState<Record<string, CourseInfo> | undefined>(undefined);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    const tabName = Object.keys(TAB_MAPPING).find((key) => TAB_MAPPING[key] === newValue);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: tabName },
      },
      undefined,
      { shallow: true }
    );
  };
  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    if (!router.isReady) return;
    if (TAB_MAPPING.hasOwnProperty(tab)) return;
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: Object.keys(TAB_MAPPING)[0] },
      },
      undefined,
      { shallow: true }
    );
  }, [router.isReady, tab]);
  const chosenTabValue = TAB_MAPPING[tab] ?? 0;

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
          value={chosenTabValue}
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
          {Object.keys(TAB_MAPPING).map((tabName) => (
            <Tab key={tabName} label={toUserFriendlyName(tabName)} />
          ))}
        </Tabs>
        {Object.entries(TAB_MAPPING).map(([tabName, value]) => (
          <TabPanel key={tabName} value={chosenTabValue} index={value}>
            <ChosenTab tabName={tabName as TabName} courseId={courseId} />
          </TabPanel>
        ))}
      </Box>
    </MainLayout>
  );
};

export default InstructorDash;
