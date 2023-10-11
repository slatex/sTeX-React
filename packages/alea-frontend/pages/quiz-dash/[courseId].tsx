import { NextPage } from 'next';
import { useRouter } from 'next/router';
import MainLayout from '../../layouts/MainLayout';
import { useContext, useEffect, useState } from 'react';
import { getCourseInfo, getCourseQuizList } from '@stex-react/api';
import dayjs from 'dayjs';
import { Box, Card, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { CourseHeader } from '../course-home/[courseId]';
import { CourseInfo } from '@stex-react/utils';
import {
  ServerLinksContext,
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';

function getUpcomingQuiz(
  quizList: {
    quizId: string;
    quizStartTs: number;
    title: string;
    quizEndTs: number;
  }[]
) {
  const now = Date.now();
  const upcomingQuizzes = quizList.filter(
    ({ quizStartTs }) => quizStartTs > now
  );
  if (upcomingQuizzes.length === 0) return undefined;
  return upcomingQuizzes.reduce((a, b) =>
    a.quizStartTs < b.quizStartTs ? a : b
  );
}

function QuizThumbnail({
  quizId,
  quizStartTs,
  title,
}: {
  quizId: string;
  quizStartTs: number;
  title: string;
}) {
  return (
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
          <b>{dayjs(quizStartTs).format('MMM-DD HH:mm')}</b>
        </Box>
      </Card>
    </Link>
  );
}

const QuizDashPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const [quizList, setQuizList] = useState<
    { quizId: string; quizStartTs: number; quizEndTs: number; title: string }[]
  >([]);
  const upcomingQuiz = getUpcomingQuiz(quizList);
  const [courses, setCourses] = useState<
    { [id: string]: CourseInfo } | undefined
  >(undefined);
  const { mmtUrl } = useContext(ServerLinksContext);
  const now = Date.now();
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
    <MainLayout title="Quiz Dashboard">
      <CourseHeader courseInfo={courseInfo} />
      <Box maxWidth="900px" m="auto" px="10px">
        <h1>Quiz Dashboard</h1>
        <h2>Demo Quiz</h2>
        {!!ongoingQuizzes.length && <h2>On-going Quizzes</h2>}
        {ongoingQuizzes.map((quiz) => (
          <Box key={quiz.quizId}>
            <QuizThumbnail {...quiz} />
          </Box>
        ))}
        <a
          href="/quiz/old/MAAI%20(may)%20-%20small"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'blue' }}
        >
          This
        </a>
        &nbsp;is a demo quiz - so that you can test your hard/software (you will
        need a recent chrome or firefox browser) and see the format. In
        particular, you should be able to read the Math in the travelling
        salesperson problem.
        {!ongoingQuizzes.length &&
          (upcomingQuiz ? (
            <>
              <h2>Upcoming Quiz</h2>
              <QuizThumbnail {...upcomingQuiz} />{' '}
            </>
          ) : (
            <h2><i>No upcoming quizzes</i></h2>
          ))}
        {!!previousQuizzes.length && <h2>Previous Quizzes</h2>}
        {previousQuizzes.map((quiz) => (
          <Box key={quiz.quizId}>
            <QuizThumbnail {...quiz} />
          </Box>
        ))}
      </Box>
    </MainLayout>
  );
};

export default QuizDashPage;
