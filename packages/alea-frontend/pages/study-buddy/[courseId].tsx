import CancelIcon from '@mui/icons-material/Cancel';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Typography,
} from '@mui/material';
import {
  GetStudyBuddiesResponse,
  Languages,
  MeetType,
  StudyBuddy,
  UserInfo,
  UserStats,
  connectionRequest,
  getCourseInfo,
  getStudyBuddyList,
  getStudyBuddyUserInfo,
  getStudyBuddyUsersStats,
  getUserInfo,
  isLoggedIn,
  isModerator,
  removeConnectionRequest,
  setActive,
  updateStudyBuddyInfo,
} from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { BG_COLOR, CourseInfo, MaAI_COURSES } from '@stex-react/utils';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { StudyBuddyForm } from '../../components/StudyBuddyForm';
import {
  StudyBuddyListing,
  StudyBuddyListingTable,
} from '../../components/StudyBuddyListingTable';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';
import { CourseHeader } from '../course-home/[courseId]';

const StudyBuddyConnectionsGraph = dynamic(
  () => import('../../components/StudyBuddyConnectionsGraph'),
  {
    ssr: false,
  }
);

function OptOutButton({
  studyBuddy,
  courseId,
}: {
  studyBuddy: StudyBuddy;
  courseId: string;
}) {
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

function StatsForModerator() {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const { studyBuddy: t } = getLocaleObject(router);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [numberOfConnections, setNumberOfConnections] = useState(0);
  const [unacceptedRequest, setUnacceptedRequest] = useState(0);
  const [connections, setConnections] = useState<UserStats['connections']>([]);
  const [userIdsAndActiveStatus, setUserIdsAndActiveStatus] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getStudyBuddyUsersStats(courseId);
      setTotalUsers(data.totalUsers);
      setActiveUsers(data.activeUsers);
      setInactiveUsers(data.inactiveUsers);
      setNumberOfConnections(data.numberOfConnections);
      setUnacceptedRequest(data.unacceptedRequests);
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
          <Typography style={{ fontWeight: 'bold' }}>
            {t.totalUsers + ' : ' + totalUsers}
          </Typography>
          <Typography style={{ fontWeight: 'bold' }}>
            {t.activeUsers + ' : ' + activeUsers}
          </Typography>
          <Typography style={{ fontWeight: 'bold' }}>
            {t.inactiveUsers + ' : ' + inactiveUsers}
          </Typography>
          <Typography style={{ fontWeight: 'bold' }}>
            {t.numberOfConnections + ' : ' + numberOfConnections}
          </Typography>
          <Typography style={{ fontWeight: 'bold' }}>
            {t.unacceptedRequest + ' : ' + unacceptedRequest}
          </Typography>
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

const StudyBuddyPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const { studyBuddy: t } = getLocaleObject(router);
  const [isLoading, setIsLoading] = useState(true);
  const [fromServer, setFromServer] = useState<StudyBuddy | undefined>(
    undefined
  );
  const [allBuddies, setAllBuddies] = useState<
    GetStudyBuddiesResponse | undefined
  >(undefined);
  const [userInput, setUserInput] = useState<StudyBuddy>({
    userId: '',
    userName: '',
    intro: '',
    courseId: '',
    studyProgram: '',
    semester: 1,
    email: '',
    meetType: MeetType.Both,
    dayPreference: '',
    languages: Languages.Deutsch,
    active: false,
  });
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(null);
  const [agreed, setAgreed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [courses, setCourses] = useState<
    { [id: string]: CourseInfo } | undefined
  >(undefined);
  const masterCourses = MaAI_COURSES;
  const { mmtUrl } = useContext(ServerLinksContext);
  const refetchStudyBuddyLists = useCallback(() => {
    if (!courseId || !fromServer?.active) return;
    if (courseId) getStudyBuddyList(courseId).then(setAllBuddies);
  }, [courseId, fromServer?.active]);
  useEffect(() => {
    getUserInfo().then(setUserInfo);
  }, []);
  useEffect(() => {
    getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    refetchStudyBuddyLists();
  }, [courseId, refetchStudyBuddyLists]);

  useEffect(() => {
    if (!courseId || !isLoggedIn()) return;
    setIsLoading(true);
    getStudyBuddyUserInfo(courseId).then((data) => {
      setIsLoading(false);
      setFromServer(data);
    });
  }, [courseId]);

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];
  const courseName =
    courseInfo?.courseName || masterCourses[courseId]?.courseName;
  if (!courseName) {
    router.replace('/');
    return <>Course Not Found!</>;
  }

  const notSignedUp = !fromServer;

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ` Study Buddy | VoLL-KI`}
      bgColor={BG_COLOR}
    >
      <CourseHeader
        courseName={courseName}
        imageLink={courseInfo?.imageLink}
        courseId={courseId}
      />
      <Box
        maxWidth="900px"
        m="auto"
        px="10px"
        display="flex"
        flexDirection="column"
      >
        {isModerator(userInfo?.userId) ? <StatsForModerator /> : null}
        {notSignedUp || isEditing ? (
          !isLoading ? (
            <Card sx={{ mt: '20px' }}>
              <CardContent>
                <Typography variant="h5">{t.fillForm}</Typography>
                <br />
                <StudyBuddyForm
                  studyBuddy={userInput}
                  onUpdate={(studyBuddy) => setUserInput(studyBuddy)}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      value={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                  }
                  label={t.agreementText}
                />
              </CardContent>

              <CardActions>
                <Box display="flex" justifyContent="space-between" width="100%">
                  <Box>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        await updateStudyBuddyInfo(courseId, userInput);
                        location.reload();
                      }}
                      sx={{ mr: '10px' }}
                      disabled={!(agreed && userInput.email?.includes('@'))}
                    >
                      {notSignedUp ? t.join : t.update}
                    </Button>
                    {!notSignedUp && (
                      <Button
                        variant="contained"
                        onClick={() => setIsEditing(false)}
                      >
                        {t.discard}
                      </Button>
                    )}
                  </Box>
                  {fromServer?.active && (
                    <OptOutButton studyBuddy={fromServer} courseId={courseId} />
                  )}
                </Box>
              </CardActions>
            </Card>
          ) : isLoggedIn() ? (
            <CircularProgress />
          ) : (
            <>Please log in to continue</>
          )
        ) : (
          <>
            <Typography variant="h4">{t.myProfile}</Typography>
            <Card sx={{ mt: '20px' }}>
              <CardContent>
                <StudyBuddyListing studyBuddy={fromServer} />
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={() => {
                    setIsEditing(true);
                    setUserInput(fromServer);
                  }}
                >
                  {t.editInfo}
                </Button>
                {!fromServer.active && (
                  <OptOutButton studyBuddy={fromServer} courseId={courseId} />
                )}
              </CardActions>
            </Card>
          </>
        )}
        {fromServer && !fromServer.active && (
          <Typography variant="h6" mt="10px">
            {t.notActive}
          </Typography>
        )}

        <StudyBuddyListingTable
          studyBuddies={allBuddies?.connected}
          header={t.connected}
          subText={t.connectedSubtext}
        />
        <StudyBuddyListingTable
          studyBuddies={allBuddies?.requestReceived}
          header={t.requestReceived}
          actionIcon={<HandshakeIcon color="primary" />}
          subText={t.requestReceivedSubtext}
          onAction={(buddy) => {
            connectionRequest(courseId, buddy.userId).then(async () => {
              refetchStudyBuddyLists();
              alert(t.connectedAlert.replace('$1', buddy.userName));
            });
          }}
        />
        <StudyBuddyListingTable
          studyBuddies={allBuddies?.requestSent}
          header={t.requestSent}
          actionIcon={<CancelIcon color="warning" />}
          subText={t.requestSentSubtext}
          onAction={(buddy) => {
            removeConnectionRequest(courseId, buddy.userId).then(async () => {
              refetchStudyBuddyLists();
              alert(t.connectionRequestCancelled.replace('$1', buddy.userName));
            });
          }}
        />
        <StudyBuddyListingTable
          studyBuddies={allBuddies?.other}
          header={t.lookingFor}
          subText={t.lookingForSubtext}
          actionIcon={<ThumbUpAltIcon color="primary" />}
          onAction={(buddy) => {
            connectionRequest(courseId, buddy.userId).then(async () => {
              refetchStudyBuddyLists();
              alert(t.connectionRequestSent.replace('$1', buddy.userName));
            });
          }}
        />
      </Box>
    </MainLayout>
  );
};
export default StudyBuddyPage;
