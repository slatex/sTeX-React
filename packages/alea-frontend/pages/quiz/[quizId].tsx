import { Box, Button, CircularProgress } from '@mui/material';
import {
    Phase,
    Problem,
    QuizInfoResponse,
    getProblem,
    getQuiz,
    insertAnswer
} from '@stex-react/api';
import dayjs from 'dayjs';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { clearInterval } from 'timers';
import { QuizDisplay } from '../../components/QuizDisplay';
import MainLayout from '../../layouts/MainLayout';

function ToBeStarted({ quizStartTs }: { quizStartTs?: number }) {
  const [showReload, setShowReload] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      if (quizStartTs && quizStartTs < Date.now()) setShowReload(true);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizStartTs]);

  return (
    <Box p="10px">
      {quizStartTs ? (
        <>
          The quiz will begin at{' '}
          {dayjs(quizStartTs).format('HH:mm on YYYY-mm-DD')}
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

const QuizPage: NextPage = () => {
  const router = useRouter();
  const quizId = router.query.quizId as string;

  const [problems, setProblems] = useState<{ [problemId: string]: Problem }>(
    {}
  );
  const [quizInfo, setQuizInfo] = useState<QuizInfoResponse | undefined>(undefined);

  const phase = quizInfo?.phase;
  useEffect(() => {
    if (!quizId) return;
    getQuiz(quizId).then((quizInfo) => {
      setQuizInfo(quizInfo);
      const problemObj: { [problemId: string]: Problem } = {};
      Object.keys(quizInfo.problems).map((problemId) => {
        const html = quizInfo.problems[problemId]
          .replace('Problem 0.1', '')
          .replace('Aufgabe 0.1', '');
        problemObj[problemId] = getProblem(html, undefined);
      });
      setProblems(problemObj);
    });
  }, [quizId]);

  if (!quizId) return null;

  return (
    <MainLayout title="Quizzes | VoLL-KI">
      <Box>
        {phase === undefined ? (
          <CircularProgress />
        ) : phase === Phase.NOT_STARTED || phase === Phase.UNSET ? (
          <ToBeStarted quizStartTs={quizInfo.quizStartTs} />
        ) : (
          <QuizDisplay
            isFrozen={phase !== Phase.STARTED}
            quizId={quizId}
            showPerProblemTime={false}
            problems={problems}
            quizEndTs={
              [Phase.ENDED, Phase.FEEDBACK_RELEASED].includes(phase)
                ? Date.now() - 1000
                : quizInfo.quizEndTs
            }
            existingResponses={quizInfo.responses}
            onSubmit={undefined}
            onResponse={(problemId, response) => {
              if (!quizId?.length) return;
              insertAnswer(quizId, problemId, response);
            }}
          />
        )}
      </Box>
    </MainLayout>
  );
};

export default QuizPage;
