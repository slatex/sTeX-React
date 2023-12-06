import { NextPage } from 'next';
import { useRouter } from 'next/router';
import MainLayout from '../../layouts/MainLayout';
import { Fragment, useContext, useEffect, useState } from 'react';
import {
  QuizStubInfo,
  getCourseInfo,
  getCourseQuizList,
} from '@stex-react/api';
import dayjs from 'dayjs';
import { Box, Card, CircularProgress, Typography } from '@mui/material';
import Link from 'next/link';
import { CourseHeader } from '../course-home/[courseId]';
import { CourseInfo, localStore } from '@stex-react/utils';
import {
  ServerLinksContext,
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';
import { getLocaleObject } from '../../lang/utils';
import QuizPerofrmanceTable from '../../components/QuizPerformanceTable';

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
              {dayjs(quizStartTs).format('MMM-DD HH:mm')} to{' '}
              {dayjs(quizEndTs).format('HH:mm')}
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

function QuizList({
  header,
  quizList,
}: {
  header: string;
  quizList: QuizStubInfo[];
}) {
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
      {practiceInfo && (
        <PraticeQuizThumbnail courseId={courseId} practiceInfo={practiceInfo} />
      )}
    </>
  );
}

const PRACTICE_QUIZ_INFO = {
  'ai-1': {
    startSecNameExcl: 'Arc Consistency',
    endSecNameIncl: 'Propositional Natural Deduction Calculus',
  },
};

const QuizDashPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const { quiz: t, home: tHome } = getLocaleObject(router);

  const [quizList, setQuizList] = useState<QuizStubInfo[]>([]);
  const [courses, setCourses] = useState<
    { [id: string]: CourseInfo } | undefined
  >(undefined);
  const { mmtUrl } = useContext(ServerLinksContext);

  const now = Date.now();
  const upcomingQuizzes = quizList.filter(
    ({ quizStartTs }) => quizStartTs > now
  );
  const previousQuizzes = quizList.filter((q) => q.quizEndTs < now);
  const ongoingQuizzes = quizList.filter(
    (q) => q.quizStartTs < now && q.quizEndTs >= now
  );

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    if (!courseId) return;
    console.log('courseId', courseId);
    getCourseQuizList(courseId).then(setQuizList);
  }, [courseId]);

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];

  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }

  return (
    <MainLayout
      title={
        (courseId || '').toUpperCase() +
        ` ${tHome.courseThumb.quizzes} | VoLL-KI`
      }
    >
      <CourseHeader courseInfo={courseInfo} />
      <Box maxWidth="900px" m="auto" px="10px">
        <Typography variant="h4" sx={{ m: '30px 0 15px' }}>
          {t.quizDashboard}
        </Typography>
        <Typography variant="body1" sx={{ color: '#333' }}>
          {t.onTimeWarning.replace('{courseId}', courseId.toUpperCase())}
        </Typography>

        <Typography variant="h5" sx={{ m: '30px 0 10px' }}>
          {t.demoQuiz}
        </Typography>

        <Typography variant="body1" sx={{ color: '#333' }}>
          <a
            href={
              courseId === 'gdp'
                ? '/quiz/old/problems%2Fgdp'
                : '/quiz/old/MAAI%20(may)%20-%20small'
            }
            target="_blank"
            rel="noreferrer"
            style={{ color: 'blue' }}
          >
            {t.this}
          </a>
          &nbsp;{t.demoQuizText}
        </Typography>

        <QuizList header={t.ongoingQuizzes} quizList={ongoingQuizzes} />
        <UpcomingQuizList
          header={t.upcomingQuizzes}
          courseId={courseId}
          quizList={upcomingQuizzes}
          practiceInfo={PRACTICE_QUIZ_INFO[courseId]}
        />
        <QuizPerofrmanceTable
          quizList={previousQuizzes}
          header={t.previousQuizzes}
        />
      </Box>
    </MainLayout>
  );
};

export default QuizDashPage;
