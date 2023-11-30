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
  connectionRequest,
  getCourseInfo,
  getStudyBuddyList,
  getStudyBuddyUserInfo,
  removeConnectionRequest,
  setActive,
  updateStudyBuddyInfo,
} from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { BG_COLOR, CourseInfo } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { StudyBuddyForm } from '../../components/StudyBuddyForm';
import {
  StudyBuddyListing,
  StudyBuddyListingTable,
  cleanupName,
} from '../../components/StudyBuddyListingTable';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';
import { CourseHeader } from '../course-home/[courseId]';

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
  const [agreed, setAgreed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [courses, setCourses] = useState<
    { [id: string]: CourseInfo } | undefined
  >(undefined);
  const { mmtUrl } = useContext(ServerLinksContext);
  const refetchStudyBuddyLists = useCallback(() => {
    if (!courseId || !fromServer?.active) return;
    if (courseId) getStudyBuddyList(courseId).then(setAllBuddies);
  }, [courseId, fromServer?.active]);

  useEffect(() => {
    getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    refetchStudyBuddyLists();
  }, [courseId, refetchStudyBuddyLists]);

  useEffect(() => {
    if (!courseId) return;
    setIsLoading(true);
    getStudyBuddyUserInfo(courseId).then((data) => {
      setIsLoading(false);
      setFromServer(data);
    });
  }, [courseId]);

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }
  if (isLoading) return;

  const notSignedUp = !fromServer;

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ` Study Buddy | VoLL-KI`}
      bgColor={BG_COLOR}
    >
      <CourseHeader courseInfo={courseInfo} />
      <Box
        maxWidth="900px"
        m="auto"
        px="10px"
        display="flex"
        flexDirection="column"
      >
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
                <Button
                  variant="contained"
                  onClick={async () => {
                    await updateStudyBuddyInfo(courseId, userInput);
                    location.reload();
                  }}
                  disabled={!agreed}
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
              </CardActions>
            </Card>
          ):<CircularProgress />
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
                <Button
                  variant="contained"
                  onClick={async () => {
                    const prompt = t.optOutPrompt.replace('$1', courseId);
                    if (fromServer.active && !confirm(prompt)) return;
                    await setActive(courseId, !fromServer.active);
                    if (!fromServer.active)
                      alert(t.haveEnrolled.replace('$1', courseId));
                    location.reload();
                  }}
                >
                  {fromServer.active ? t.optOut : t.reJoin}
                </Button>
              </CardActions>
            </Card>
          </>
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
              const name = cleanupName(buddy.userName);
              alert(t.connectedAlert.replace('$1', name));
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
              const name = cleanupName(buddy.userName);
              alert(t.connectionRequestCancelled.replace('$1', name));
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
              const name = cleanupName(buddy.userName);
              alert(t.connectionRequestSent.replace('$1', name));
            });
          }}
        />
      </Box>
    </MainLayout>
  );
};
export default StudyBuddyPage;
