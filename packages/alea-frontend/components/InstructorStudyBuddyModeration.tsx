import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
  } from '@mui/material';
  import {
    AllCoursesStats,
    StudyBuddy,
    UserStats,
    canModerateStudyBuddy,
    getStudyBuddyUsersStats,
    setActive,
  } from '@stex-react/api';
  import { CURRENT_TERM} from '@stex-react/utils';
  import { NextPage } from 'next';
  import dynamic from 'next/dynamic';
  import { useRouter } from 'next/router';
  import {useEffect, useState } from 'react';
  import { getLocaleObject } from '../lang/utils';
  import StudyBuddyModeratorOverview from './StudyBuddyModeratorOverview';
  
  const StudyBuddyConnectionsGraph = dynamic(() => import('./StudyBuddyConnectionsGraph'), {
    ssr: false,
  });
  
  function OptOutButton({ studyBuddy, courseId }: { studyBuddy: StudyBuddy; courseId: string }) {
    const { studyBuddy: t } = getLocaleObject(useRouter());
    return (
      <Button
        variant="contained"
        onClick={async () => {
          const prompt = t.optOutPrompt.replace('$1', courseId);
          if (studyBuddy.active && !confirm(prompt)) return;
          await setActive(courseId, !studyBuddy.active);
          if (!studyBuddy.active) alert(t.haveEnrolled.replace('$1', courseId));
          location.reload();
        }}
      >
        {studyBuddy.active ? t.optOut : t.reJoin}
      </Button>
    );
  }
  
  function StatsForModerator({ courseId }) {
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
  
  interface InstructorStudyBuddyModerationProps {
    courseId: string;
  }
  
  const InstructorStudyBuddyModeration: NextPage<InstructorStudyBuddyModerationProps> = ({courseId}) => {
    const [isModerator, setIsModerator] = useState(true);
    useEffect(() => {
      if (!courseId) return;
      canModerateStudyBuddy(courseId, CURRENT_TERM).then(setIsModerator);
    }, [courseId]);
    return (
      <Box maxWidth="900px" m="auto" px="10px" display="flex" flexDirection="column">
        {isModerator ? <StatsForModerator courseId={courseId} /> : 'un authorized'}
      </Box>
    );
  };
  export default InstructorStudyBuddyModeration;
  