import SchoolIcon from '@mui/icons-material/School';
import { Box, Button, Card, CircularProgress, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import {
  QuizStubInfo,
  canAccessResource,
  getCourseInfo,
  getCourseQuizList,
  getUserInfo,
} from '@stex-react/api';
import { ServerLinksContext, mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import { Action, CURRENT_TERM, CourseInfo, ResourceName } from '@stex-react/utils';
import dayjs from 'dayjs';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useContext, useEffect, useState } from 'react';
import { ForceFauLogin } from '../../components/ForceFAULogin';
import QuizPerformanceTable from '../../components/QuizPerformanceTable';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';
import { CourseHeader, handleEnrollment } from '../course-home/[courseId]';

function QuizThumbnail({ quiz }: { quiz: QuizStubInfo }) {
  const { quizId, quizStartTs, quizEndTs, title } = quiz;
  return (
    <Box width="fit-content">
      <Link href={`/quiz/${quizId}`}>
        <Card
          sx={{
            backgroundColor: 'hsl(210, 20%, 95%)',
            border: '1px solid #CCC',
            p: '10px',
            my: '10px',
            width: 'fit-content',
          }}
        >
          <Box>{mmtHTMLToReact(title)}</Box>
          <Box>
            <b>
              {dayjs(quizStartTs).format('MMM-DD HH:mm')} to {dayjs(quizEndTs).format('HH:mm')}
            </b>
          </Box>
        </Card>
      </Link>
    </Box>
  );
}

function PraticeQuizThumbnail({
  courseId,
  practiceInfo,
}: {
  courseId: string;
  practiceInfo: { startSecNameExcl: string; endSecNameIncl: string };
}) {
  const { quiz: t } = getLocaleObject(useRouter());
  const { startSecNameExcl, endSecNameIncl } = practiceInfo;
  return (
    <Box width="fit-content">
      <Link
        href={`/course-problems/${courseId}?startSecNameExcl=${startSecNameExcl}&endSecNameIncl=${endSecNameIncl}`}
      >
        <Card
          sx={{
            backgroundColor: 'hsl(210, 20%, 95%)',
            border: '1px solid #CCC',
            p: '10px',
            my: '10px',
            width: 'fit-content',
          }}
        >
          <Box>{t.practiceProblems}</Box>
        </Card>
      </Link>
    </Box>
  );
}

function QuizList({ header, quizList }: { header: string; quizList: QuizStubInfo[] }) {
  if (!quizList?.length) return <></>;
  return (
    <>
      <Typography variant="h5" sx={{ m: '30px 0 15px' }}>
        {header}
      </Typography>
      {quizList
        .sort((a, b) => b.quizStartTs - a.quizStartTs)
        .map((quiz) => (
          <Fragment key={quiz.quizId}>
            <QuizThumbnail quiz={quiz} />
          </Fragment>
        ))}
    </>
  );
}

function UpcomingQuizList({
  header,
  quizList,
  courseId,
  practiceInfo,
}: {
  header: string;
  quizList: QuizStubInfo[];
  courseId: string;
  practiceInfo?: { startSecNameExcl: string; endSecNameIncl: string };
}) {
  if (!quizList?.length && !practiceInfo) return null;
  return (
    <>
      <Typography variant="h5" sx={{ m: '30px 0 15px' }}>
        {header}
      </Typography>
      {quizList
        .sort((a, b) => b.quizStartTs - a.quizStartTs)
        .map((quiz) => (
          <Fragment key={quiz.quizId}>
            <QuizThumbnail quiz={quiz} />
          </Fragment>
        ))}
      {practiceInfo && <PraticeQuizThumbnail courseId={courseId} practiceInfo={practiceInfo} />}
    </>
  );
}

const PRACTICE_QUIZ_INFO = {
  'ai-1': {
    startSecNameExcl: 'Description Logics and the Semantic Web',
    endSecNameIncl: 'Partial Order Planning',
  },
};

const QuizDashPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const { quiz: t, home: tHome } = getLocaleObject(router);
  const [userId, setUserId] = useState<string | null>(null);

  const [quizList, setQuizList] = useState<QuizStubInfo[]>([]);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const { mmtUrl } = useContext(ServerLinksContext);

  const now = Date.now();
  const upcomingQuizzes = quizList.filter(({ quizStartTs }) => quizStartTs > now);
  const previousQuizzes = quizList.filter((q) => q.quizEndTs < now);
  const ongoingQuizzes = quizList.filter((q) => q.quizStartTs < now && q.quizEndTs >= now);

  const [forceFauLogin, setForceFauLogin] = useState(false);
  const [enrolled, setIsEnrolled] = useState<boolean>(false);

  useEffect(() => {
    getUserInfo().then((i) => {
      const uid = i?.userId;
      setUserId(i?.userId);
      if (!uid) return;
      setForceFauLogin(uid.length !== 8 || uid.includes('@'));
    });
  });

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    if (!courseId) return;
    console.log('courseId', courseId);
    getCourseQuizList(courseId).then(setQuizList);
  }, [courseId]);
  useEffect(() => {
    if (!courseId) return;
    const enrolledStudentActions = [{ resource: ResourceName.COURSE_QUIZ, action: Action.TAKE }];
    async function checkAccess() {
      for (const { resource, action } of enrolledStudentActions) {
        const hasAccess = await canAccessResource(resource, action, {
          courseId,
          instanceId: CURRENT_TERM,
        });
        if (hasAccess) {
          setIsEnrolled(true);
          return;
        }
      }
    }
    checkAccess();
  }, [courseId]);

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];

  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }
  const enrollInCourse = async () => {
    if (!userId || !courseId) return;
    const enrollmentSuccess = await handleEnrollment(userId, courseId, CURRENT_TERM);
    setIsEnrolled(enrollmentSuccess);
  };

  if (forceFauLogin) {
    return (
      <MainLayout
        title={(courseId || '').toUpperCase() + ` ${tHome.courseThumb.quizzes} | VoLL-KI`}
      >
        <ForceFauLogin />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={(courseId || '').toUpperCase() + ` ${tHome.courseThumb.quizzes} | VoLL-KI`}>
      <CourseHeader
        courseName={courseInfo.courseName}
        imageLink={courseInfo.imageLink}
        courseId={courseId}
      />
      <Box maxWidth="900px" m="auto" px="10px">
        {/* {!enrolled && <Alert severity="info">{t.enrollmentMessage}</Alert>} */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', m: '30px 0 15px' }}>
          <Typography variant="h4">{t.quizDashboard}</Typography>
          {!enrolled && (
            <Button onClick={enrollInCourse} variant="contained" sx={{ backgroundColor: 'green' }}>
              {t.getEnrolled}
              <SchoolIcon />
            </Button>
          )}
        </Box>
        <Typography variant="body1" sx={{ color: '#333' }}>
          {t.onTimeWarning.replace('{courseId}', courseId.toUpperCase())}
        </Typography>

        <Typography variant="h5" sx={{ m: '30px 0 10px' }}>
          {t.demoQuiz}
        </Typography>

        <Typography variant="body1" sx={{ color: '#333' }}>
          <a
            href={
              courseId === 'gdp' ? '/quiz/old/problems%2Fgdp' : '/quiz/old/MAAI%20(may)%20-%20small'
            }
            target="_blank"
            rel="noreferrer"
            style={{ color: 'blue' }}
          >
            {t.this}
          </a>
          &nbsp;{t.demoQuizText}
        </Typography>

        {
          // enrolled &&
          <>
            {' '}
            <QuizList header={t.ongoingQuizzes} quizList={ongoingQuizzes} />
            <UpcomingQuizList
              header={t.upcomingQuizzes}
              courseId={courseId}
              quizList={upcomingQuizzes}
              practiceInfo={PRACTICE_QUIZ_INFO[courseId]}
            />
            <QuizPerformanceTable
              courseId={courseId}
              quizList={previousQuizzes}
              header={t.previousQuizzes}
            />
          </>
        }
      </Box>
    </MainLayout>
  );
};

export default QuizDashPage;
