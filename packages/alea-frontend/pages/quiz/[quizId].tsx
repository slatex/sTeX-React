import SchoolIcon from '@mui/icons-material/School';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import {
  canAccessResource,
  getQuiz,
  GetQuizResponse,
  getUserInfo,
  insertQuizResponse,
  Phase,
  Problem,
  UserInfo,
} from '@stex-react/api';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { QuizDisplay } from '@stex-react/stex-react-renderer';
import { Action, CURRENT_TERM, localStore, ResourceName } from '@stex-react/utils';
import dayjs from 'dayjs';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ForceFauLogin } from '../../components/ForceFAULogin';
import MainLayout from '../../layouts/MainLayout';
import { handleEnrollment } from '../course-home/[courseId]';
import { getLocaleObject } from '../../lang/utils';

function ToBeStarted({ quizStartTs }: { quizStartTs?: number }) {
  const [showReload, setShowReload] = useState(false);
  const roundedTs = Math.round(quizStartTs / 60000) * 60000; // 60000 milliseconds = 1 minute

  useEffect(() => {
    if (!quizStartTs) return;
    const interval = setInterval(() => {
      if (quizStartTs && quizStartTs < Date.now()) setShowReload(true);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizStartTs]);

  return (
    <Box p="10px">
      {quizStartTs ? (
        <>
          The quiz will begin at {dayjs(roundedTs).format('HH:mm on YYYY-MM-DD')}
          <br />
          {showReload && (
            <Button variant="contained" onClick={() => location.reload()}>
              Reload to Start Quiz
            </Button>
          )}
        </>
      ) : (
        'The quiz is not available'
      )}
    </Box>
  );
}

function EarlyFinish({ quizEndTs, goBack }: { quizEndTs?: number; goBack: () => void }) {
  return (
    <Box p="10px">
      The quiz is still open till {dayjs(quizEndTs).format('HH:mm on YYYY-MM-DD')}
      <br />
      <Button onClick={() => goBack()} variant="contained">
        Click here
      </Button>{' '}
      to go back.
    </Box>
  );
}

function getServerClientOffsetMs(quizInfo?: GetQuizResponse) {
  if (!quizInfo?.currentServerTs) return 0;
  return Date.now() - quizInfo.currentServerTs;
}

function getClientEndTimeMs(quizInfo?: GetQuizResponse) {
  if (!quizInfo?.quizEndTs) return undefined;
  return quizInfo?.quizEndTs + getServerClientOffsetMs(quizInfo);
}

function getClientStartTimeMs(quizInfo?: GetQuizResponse) {
  if (!quizInfo?.quizStartTs) return undefined;
  return quizInfo?.quizStartTs + getServerClientOffsetMs(quizInfo);
}

function finishedKey(quizId: string) {
  return `${quizId}-finished`;
}

function setFinishedInLocalStore(quizId: string) {
  localStore?.setItem(finishedKey(quizId), 'true');
}

function unsetFinishedInLocalStore(quizId: string) {
  localStore.removeItem(finishedKey(quizId));
}

function isFinishedFromLocalStore(quizId: string) {
  return !!localStore?.getItem(finishedKey(quizId));
}

const QuizPage: NextPage = () => {
  const router = useRouter();
  const quizId = router.query.quizId as string;
  const { quiz: q } = getLocaleObject(router);

  const [problems, setProblems] = useState<{ [problemId: string]: Problem }>({});
  const [finished, setFinished] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined | null>(null);
  const [quizInfo, setQuizInfo] = useState<GetQuizResponse | undefined>(undefined);
  const [moderatorPhase, setModeratorPhase] = useState<Phase>(undefined);
  const [debuggerMode, setDebuggerMode] = useState<boolean>(false);
  const [enrolled, setIsEnrolled] = useState<boolean>(false);
  const clientQuizEndTimeMs = getClientEndTimeMs(quizInfo);
  const clientQuizStartTimeMs = getClientStartTimeMs(quizInfo);

  const phase = moderatorPhase ?? quizInfo?.phase;
  const courseId = quizInfo?.courseId;
  const instanceId = quizInfo?.courseTerm;

  const [forceFauLogin, setForceFauLogin] = useState(false);

  const enrollInCourse = async () => {
    if (!userInfo.userId || !courseId) return;
    const enrollmentSuccess = await handleEnrollment(userInfo.userId, courseId, CURRENT_TERM);
    if (enrollmentSuccess) setIsEnrolled(true);
  };


  useEffect(() => {
    getUserInfo().then((i) => {
      const uid = i?.userId;
      if (!uid) return;
      setForceFauLogin(uid.length !== 8 || uid.includes('@'));
    });
  }, []);

  useEffect(() => {
    if (!quizId) return;
    getQuiz(quizId).then((quizInfo) => {
      setQuizInfo(quizInfo);
      const problemObj: { [problemId: string]: Problem } = {};
      Object.keys(quizInfo.problems).map((problemId) => {
        const html = hackAwayProblemId(quizInfo.problems[problemId]);
        problemObj[problemId] = getProblem(html, undefined);
      });
      setProblems(problemObj);
    });
  }, [quizId]);

  useEffect(() => {
    const quizEndTsMs = getClientEndTimeMs(quizInfo);
    if (!quizEndTsMs || quizInfo.phase !== Phase.STARTED) return;
    const timeToEndMs = quizEndTsMs - Date.now();

    if (timeToEndMs < 0) location.reload(); // This is risky.

    const timeout = setTimeout(() => {
      alert('Quiz has ended');
      location.reload();
    }, timeToEndMs + 5000);
    // 5000 as buffer to account for network latency. This is not a big deal
    // because the server will reject any response after the time, and the
    // rejection will cause the quiz to end.
    return () => clearTimeout(timeout);
  }, [quizInfo, quizInfo?.phase]);

  useEffect(() => {
    if (!quizId) return;
    setFinished(isFinishedFromLocalStore(quizId));
  }, [quizId]);

  useEffect(() => {
    getUserInfo().then(setUserInfo);
  }, []);

  useEffect(() => {
    if (!courseId || !instanceId) return;
    canAccessResource(ResourceName.COURSE_QUIZ, Action.MUTATE, {
      courseId,
      instanceId,
    }).then((isModerator) => {
      if (!isModerator) return;
      const p =
        'Hello moderator! Do you want to see the quiz in feedback release phase (press OK) or quiz started phase (press Cancel)?';
      const moderatorPhase = confirm(p) ? Phase.FEEDBACK_RELEASED : Phase.STARTED;
      setModeratorPhase(moderatorPhase);
      if (moderatorPhase === Phase.FEEDBACK_RELEASED) {
        const debugMessage = 'Would you like to view the quiz in debugger mode?';
        setDebuggerMode(confirm(debugMessage));
      }
    });
  }, [courseId, instanceId]);

  useEffect(() => {
    if (!courseId) return;
    const checkAccess = async () => {
      const hasAccess = await canAccessResource(ResourceName.COURSE_QUIZ, Action.TAKE, {
        courseId,
        instanceId: CURRENT_TERM,
      });
      if (hasAccess) {
        setIsEnrolled(true);
      }
    };
    checkAccess();
  }, [courseId]);

  if (!quizId) return null;
  if (forceFauLogin) {
    return (
      <MainLayout title="Quizzes | ALeA">
        <ForceFauLogin />
      </MainLayout>
    );
  }

  // if (!enrolled) {
  //   return (
  //     <MainLayout title="Quizzes | VoLL-KI">
  //       <Box
  //         p="20px"
  //         sx={{
  //           display: 'flex',
  //           alignItems: 'center',
  //           gap: '10px',
  //           justifyContent: 'center',
  //           flexDirection: 'column',
  //         }}
  //       >
  //         <Typography variant="h6">
  //           You are not enrolled in this course. Please click the &quot;Enroll&quot; button to
  //           access the quiz.
  //         </Typography>
  //         <Button onClick={enrollInCourse} variant="contained" sx={{ backgroundColor: 'green' }}>
  //           {q.getEnrolled}
  //           <SchoolIcon />
  //         </Button>
  //       </Box>
  //     </MainLayout>
  //   );
  // }

  return (
    <MainLayout title="Quizzes | ALeA">
      <Box>
        {!userInfo ? (
          <Box p="20px">You must be logged in to see quizzes.</Box>
        ) : phase === undefined ? (
          <CircularProgress />
        ) : phase === Phase.NOT_STARTED || phase === Phase.UNSET ? (
          <ToBeStarted quizStartTs={clientQuizStartTimeMs} />
        ) : phase === Phase.STARTED && finished ? (
          <EarlyFinish
            quizEndTs={clientQuizEndTimeMs}
            goBack={() => {
              setFinished(false);
              unsetFinishedInLocalStore(quizId);
              // Reloading is a hack. This is needed because QuizDisplay gets
              // re-created and its starts using the old value of
              // existingResponses.
              location.reload();
            }}
          />
        ) : (
          <QuizDisplay
            debug={debuggerMode}
            isFrozen={phase !== Phase.STARTED}
            showPerProblemTime={false}
            problems={problems}
            quizEndTs={clientQuizEndTimeMs}
            existingResponses={quizInfo?.responses}
            onResponse={async (problemId, response) => {
              if (!quizId?.length) return;
              const answerAccepted = await insertQuizResponse(quizId, problemId, response);
              if (!answerAccepted) {
                alert('Answers are no longer being accepted');
                location.reload();
              }
            }}
            onSubmit={() => {
              setFinished(true);
              setFinishedInLocalStore(quizId);
            }}
          />
        )}
      </Box>
    </MainLayout>
  );
};

export default QuizPage;
