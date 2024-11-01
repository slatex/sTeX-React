import { Box } from '@mui/material';
import { getHomeworkInfo, getHomeworkPhase, HomeworkInfo, Problem } from '@stex-react/api';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { QuizDisplay } from '@stex-react/stex-react-renderer';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const HomeworkDocPage: React.FC = () => {
  const router = useRouter();
  const [hwInfo, setHwInfo] = useState<HomeworkInfo | null>(null);
  const [problems, setProblems] = useState<{ [problemId: string]: Problem }>({});

  const id = router.query.id as string;

  useEffect(() => {
    if (!id) return;
    getHomeworkInfo(+id).then((hwInfo) => {
      setHwInfo(hwInfo);

      const problemObj: { [problemId: string]: Problem } = {};
      Object.keys(hwInfo.problems).map((problemId) => {
        const html = hackAwayProblemId(hwInfo.problems[problemId]);
        problemObj[problemId] = getProblem(html, undefined);
      });
      setProblems(problemObj);
    });
  }, [id]);

  const phase = hwInfo && getHomeworkPhase(hwInfo);

  return (
    <MainLayout title={`${hwInfo?.courseId ?? ''} Homework | VoLL-KI`}>
      <Box>
        {hwInfo && (
          <>
            {phase === 'NOT_GIVEN' ? (
              <Box>Homework not yet given</Box>
            ) : (
              <QuizDisplay
                isFrozen={phase !== 'GIVEN'}
                showPerProblemTime={false}
                problems={problems}
                existingResponses={{}}
                homeworkId={hwInfo.id}
              />
            )}
          </>
        )}
      </Box>
    </MainLayout>
  );
};

export default HomeworkDocPage;
