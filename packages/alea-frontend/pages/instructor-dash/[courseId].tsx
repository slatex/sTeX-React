import { Box, Tab, Tabs } from '@mui/material';
import { canAccessResource, getCourseInfo } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { Action, CourseInfo, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import CourseAccessControlDashboard from 'packages/alea-frontend/components/CourseAccessControlDashboard';
import HomeworkManager from 'packages/alea-frontend/components/HomeworkManager';
import QuizDashboard from 'packages/alea-frontend/components/QuizDashboard';
import { StudyBuddyModeratorStats } from 'packages/alea-frontend/components/StudyBuddyModeratorStats';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { useContext, useEffect, useState } from 'react';
import { CourseHeader } from '../course-home/[courseId]';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

type TabName = 'access-control' | 'homework-manager' | 'quiz-dashboard' | 'study-buddy';

const TAB_ACCESS_REQUIREMENTS: Record<TabName, { resource: ResourceName; action: Action }> = {
  'access-control': { resource: ResourceName.COURSE_ACCESS, action: Action.ACCESS_CONTROL },
  'homework-manager': { resource: ResourceName.COURSE_HOMEWORK, action: Action.MUTATE },
  'quiz-dashboard': { resource: ResourceName.COURSE_QUIZ, action: Action.MUTATE },
  'study-buddy': { resource: ResourceName.COURSE_STUDY_BUDDY, action: Action.MODERATE },
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
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    if (!courseId) return;

    async function checkTabAccess() {
      const tabs: TabName[] = [];
      for (const [tabName, { resource, action }] of Object.entries(TAB_ACCESS_REQUIREMENTS)) {
        const hasAccess = await canAccessResource(resource, action, {
          courseId,
          instanceId: CURRENT_TERM,
        });
        if (hasAccess) {
          tabs.push(tabName as TabName);
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
      <Box sx={{ width: '100%', margin: 'auto', maxWidth: '900px' }}>
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
