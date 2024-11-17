import { NextPage } from 'next';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';

import { CourseHeader } from '../../course-home/[courseId]';
import { SyntheticEvent, useContext, useEffect, useState } from 'react';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  getCourseInfo,
} from '@stex-react/api';
import { CourseInfo } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { Box, Tab, Tabs } from '@mui/material';


import { ShowPeerReviewRequestsAndProblem } from '../../../components/nap/ShowPeerReviewRequestsAndProblem';
import { ShowPeerReviewHomeworkProblems } from '../../../components/nap/ShowPeerReviewHomeworkProblems';
import { TabPanelProps, toUserFriendlyName } from 'packages/stex-react-renderer/src/lib/lang/utils';

type TabName = 'practice-problem' | 'homework';

const TAB_MAPPING: Record<TabName, number> = {
  'practice-problem': 0,
  'homework': 1,
};

function ChosenTab({ tabName, courseId }: { tabName: TabName; courseId: string }) {
  switch (tabName) {
    case 'practice-problem':
      return <ShowPeerReviewRequestsAndProblem courseId={courseId} />;
    case 'homework':
      return <ShowPeerReviewHomeworkProblems courseId={courseId} />;
    default:
      return null;
  }
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
const PeerGradingListPage: NextPage = () => {
  const router = useRouter();
  const tab = router.query.tab as TabName;
  const { mmtUrl } = useContext(ServerLinksContext);

  const courseId = router.query.courseId as string;
  const [courses, setCourses] = useState<Record<string, CourseInfo> | undefined>(undefined);
  const courseInfo = courses?.[courseId];
  const chosenTabValue = TAB_MAPPING[tab] ?? 0;
  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);
  const handleChange = (event: SyntheticEvent, newValue: number) => {
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
  return (
    <>
      <MainLayout>
        <CourseHeader
          courseName={courseInfo?.courseName}
          imageLink={courseInfo?.imageLink}
          courseId={courseId}
        />

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
       
      </MainLayout>
    </>
  );
};
export default PeerGradingListPage;
