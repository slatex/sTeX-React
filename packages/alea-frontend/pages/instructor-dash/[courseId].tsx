import { Box, Tab, Tabs } from '@mui/material';
import { canAccessResource, getCourseInfo } from '@stex-react/api';
import { Action, CourseInfo, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CourseAccessControlDashboard from '../../components/CourseAccessControlDashboard';
import HomeworkManager from '../../components/HomeworkManager';
import { GradingInterface } from '../../components/nap/GradingInterface';
import InstructorPeerReviewViewing from '../../components/peer-review/InstructorPeerReviewViewing';
import QuizDashboard from '../../components/QuizDashboard';
import { StudyBuddyModeratorStats } from '../../components/StudyBuddyModeratorStats';
import MainLayout from '../../layouts/MainLayout';
import { CourseHeader } from '../course-home/[courseId]';
import CoverageUpdatePage from '../../components/coverage-update';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

type TabName =
  | 'access-control'
  | 'homework-manager'
  | 'homework-grading'
  | 'quiz-dashboard'
  | 'study-buddy'
  | 'peer-review'
  | 'lecture-schedule';

const TAB_ACCESS_REQUIREMENTS: Record<TabName, { resource: ResourceName; actions: Action[] }> = {
  'access-control': { resource: ResourceName.COURSE_ACCESS, actions: [Action.ACCESS_CONTROL] },
  'homework-manager': { resource: ResourceName.COURSE_HOMEWORK, actions: [Action.MUTATE] },
  'homework-grading': {
    resource: ResourceName.COURSE_HOMEWORK,
    actions: [Action.INSTRUCTOR_GRADING],
  },
  'quiz-dashboard': {
    resource: ResourceName.COURSE_QUIZ,
    actions: [Action.MUTATE, Action.PREVIEW],
  },
  'peer-review': { resource: ResourceName.COURSE_PEERREVIEW, actions: [Action.MUTATE] },
  'study-buddy': { resource: ResourceName.COURSE_STUDY_BUDDY, actions: [Action.MODERATE] },
  'lecture-schedule': { resource: ResourceName.COURSE_ACCESS, actions: [Action.ACCESS_CONTROL] },
};
function ChosenTab({ tabName, courseId }: { tabName: TabName; courseId: string }) {
  switch (tabName) {
    case 'access-control':
      return <CourseAccessControlDashboard courseId={courseId} />;
    case 'homework-manager':
      return <HomeworkManager courseId={courseId} />;
    case 'homework-grading':
      return <GradingInterface isPeerGrading={false} courseId={courseId} />;
    case 'quiz-dashboard':
      return <QuizDashboard courseId={courseId} />;
    case 'study-buddy':
      return <StudyBuddyModeratorStats courseId={courseId} />;
    case 'peer-review':
      return <InstructorPeerReviewViewing courseId={courseId}></InstructorPeerReviewViewing>;
    case 'lecture-schedule':
      return <CoverageUpdatePage />;
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

const TAB_MAX_WIDTH: Record<TabName, string | undefined> = {
  'access-control': '900px',
  'homework-grading': undefined,
  'peer-review': undefined,
  'homework-manager': '900px',
  'quiz-dashboard': '900px',
  'study-buddy': '900px',
  'lecture-schedule': '900px',
};

const InstructorDash: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const tab = router.query.tab as TabName;

  const [courses, setCourses] = useState<Record<string, CourseInfo> | undefined>(undefined);

  const [accessibleTabs, setAccessibleTabs] = useState<TabName[]>([]);
  const [currentTabIdx, setCurrentTabIdx] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabIdx(newValue);
    const selectedTab = accessibleTabs[newValue];
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: selectedTab },
      },
      undefined,
      { shallow: true }
    );
  };
  useEffect(() => {
    getCourseInfo().then(setCourses);
  }, []);

  useEffect(() => {
    if (!courseId) return;
    async function checkTabAccess() {
      const tabs: TabName[] = [];
      for (const [tabName, { resource, actions }] of Object.entries(TAB_ACCESS_REQUIREMENTS)) {
        for (const action of actions) {
          if (await canAccessResource(resource, action, { courseId, instanceId: CURRENT_TERM })) {
            tabs.push(tabName as TabName);
            break;
          }
        }
      }
      setAccessibleTabs(tabs);
      if (tab && tabs.includes(tab)) {
        setCurrentTabIdx(tabs.indexOf(tab));
      } else {
        setCurrentTabIdx(0);
        router.replace(
          {
            pathname: router.pathname,
            query: { ...router.query, tab: tabs[0] },
          },
          undefined,
          { shallow: true }
        );
      }
    }
    checkTabAccess();
  }, [courseId, tab]);

  const courseInfo = courses?.[courseId];

  return (
    <MainLayout>
      <CourseHeader
        courseName={courseInfo?.courseName}
        imageLink={courseInfo?.imageLink}
        courseId={courseId}
      />
      <Box
        sx={{
          width: '100%',
          margin: 'auto',
          maxWidth: TAB_MAX_WIDTH[accessibleTabs[currentTabIdx]],
        }}
      >
        <Tabs
          value={currentTabIdx}
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
          {accessibleTabs.map((tabName, index) => (
            <Tab key={tabName} label={toUserFriendlyName(tabName)} />
          ))}
        </Tabs>
        {accessibleTabs.map((tabName, index) => (
          <TabPanel key={tabName} value={currentTabIdx} index={index}>
            <ChosenTab tabName={tabName} courseId={courseId} />
          </TabPanel>
        ))}
      </Box>
    </MainLayout>
  );
};

export default InstructorDash;
