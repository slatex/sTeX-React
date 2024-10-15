import { Card, CardContent, Typography } from '@mui/material';
import { AllCoursesStats, UserStats, getStudyBuddyUsersStats } from '@stex-react/api';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import StudyBuddyModeratorOverview from './StudyBuddyModeratorOverview';

const StudyBuddyConnectionsGraph = dynamic(() => import('./StudyBuddyConnectionsGraph'), {
  ssr: false,
});

export function StudyBuddyModeratorStats({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { studyBuddy: t } = getLocaleObject(router);
  const [overviewData, setOverviewData] = useState<AllCoursesStats>();
  const [connections, setConnections] = useState<UserStats['connections']>([]);
  const [userIdsAndActiveStatus, setUserIdsAndActiveStatus] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getStudyBuddyUsersStats(courseId);
      setOverviewData(data);
      setConnections(data.connections);
      setUserIdsAndActiveStatus(data.userIdsAndActiveStatus);
    };
    fetchData();
  }, [courseId]);

  return (
    <>
      <Typography variant="h4">{t.insightHeading}</Typography>
      <Card sx={{ mt: '20px', mb: '20px' }}>
        <CardContent>
          <StudyBuddyModeratorOverview overviewData={overviewData} />
          <hr />
          <StudyBuddyConnectionsGraph
            connections={connections}
            userIdsAndActiveStatus={userIdsAndActiveStatus}
          />
        </CardContent>
      </Card>
    </>
  );
}
