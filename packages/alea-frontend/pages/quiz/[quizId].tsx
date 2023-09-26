import { Box, Button, CircularProgress } from '@mui/material';
import {
  GetQuizResponse,
  Phase,
  Problem,
  getProblem,
  getQuiz,
  insertAnswer,
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
          {dayjs(quizStartTs).format('HH:mm on YYYY-MM-DD')}
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

const QuizPage: NextPage = () => {
  const router = useRouter();
  const quizId = router.query.quizId as string;

  const [problems, setProblems] = useState<{ [problemId: string]: Problem }>(
    {}
  );
  const [quizInfo, setQuizInfo] = useState<GetQuizResponse | undefined>(
    undefined
  );
  const clientQuizEndTimeMs = getClientEndTimeMs(quizInfo);
  const clientQuizStartTimeMs = getClientStartTimeMs(quizInfo);

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

  useEffect(() => {
    const quizEndTsMs = getClientEndTimeMs(quizInfo);
    if (!quizEndTsMs || quizInfo.phase !== Phase.STARTED) return;
    const timeToEndMs = quizEndTsMs - Date.now();
    
    if (timeToEndMs < 0) location.reload(); // This is risky.

    const timeout = setTimeout(() => {
      alert('Quiz has ended');
      location.reload();
    }, timeToEndMs);
    return () => clearTimeout(timeout);
  }, [quizInfo, quizInfo?.phase]);

  if (!quizId) return null;

  return (
    <MainLayout title="Quizzes | VoLL-KI">
      <Box>
        {phase === undefined ? (
          <CircularProgress />
        ) : phase === Phase.NOT_STARTED || phase === Phase.UNSET ? (
          <ToBeStarted quizStartTs={clientQuizStartTimeMs} />
        ) : (
          <QuizDisplay
            isFrozen={phase !== Phase.STARTED}
            quizId={quizId}
            showPerProblemTime={false}
            problems={problems}
            quizEndTs={
              [Phase.ENDED, Phase.FEEDBACK_RELEASED].includes(phase)
                ? Math.min(Date.now() - 1, clientQuizEndTimeMs ?? 0)
                : clientQuizEndTimeMs
            }
            existingResponses={quizInfo.responses}
            onSubmit={undefined}
            onResponse={async (problemId, response) => {
              if (!quizId?.length) return;
              const answerAccepted = await insertAnswer(
                quizId,
                problemId,
                response
              );
              if (!answerAccepted) {
                alert('Answers are no longer being accepted');
                location.reload();
              }
            }}
          />
        )}
      </Box>
    </MainLayout>
  );
};

export default QuizPage;
