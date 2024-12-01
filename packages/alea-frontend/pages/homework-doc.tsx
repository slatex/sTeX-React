import { Box } from '@mui/material';
import {
  createAnswer,
  getHomework,
  getHomeworkPhase,
  GetHomeworkResponse,
  getUserInfo,
  GradingInfo,
  Problem,
  ProblemResponse,
  UserInfo,
} from '@stex-react/api';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { QuizDisplay } from '@stex-react/stex-react-renderer';
import { useRouter } from 'next/router';
import { GradingContext } from 'packages/stex-react-renderer/src/lib/SubProblemAnswer';
import React, { useEffect, useState } from 'react';
import { ForceFauLogin } from '../components/ForceFAULogin';
import MainLayout from '../layouts/MainLayout';

const HomeworkDocPage: React.FC = () => {
  const router = useRouter();

  const [problems, setProblems] = useState<{ [problemId: string]: Problem }>({});
  const [userInfo, setUserInfo] = useState<UserInfo | undefined | null>(null);
  const [hwInfo, setHwInfo] = useState<GetHomeworkResponse | undefined>(undefined);

  const [forceFauLogin, setForceFauLogin] = useState(false);

  const [subProblemInfoToGradingInfo, setSubProblemInfoToGradingInfo] = useState<
    Record<string, GradingInfo[]>
  >({});

  useEffect(() => {
    getUserInfo().then((i) => {
      setUserInfo(i);
      const uid = i?.userId;
      if (!uid) return;
      setForceFauLogin(uid.length !== 8 || uid.includes('@'));
    });
  }, []);
  const courseId = hwInfo?.homework.courseId;
  const instanceId = hwInfo?.homework.courseInstance;

  const [responses, setResponses] = useState<{
    [problemId: string]: ProblemResponse;
  }>({});

  const id = router.query.id as string;

  useEffect(() => {
    if (!router.isReady) return;
    if (Number.isNaN(+id)) {
      alert('Invalid homework id');
      router.replace('/');
    }
    getHomework(+id).then((hwInfo) => {
      setHwInfo(hwInfo);
      const problemObj: { [problemId: string]: Problem } = {};
      Object.keys(hwInfo.homework.problems).map((problemId) => {
        const html = hackAwayProblemId(hwInfo.homework.problems[problemId]);
        problemObj[problemId] = getProblem(html, undefined);
      });
      setProblems(problemObj);
      setResponses(hwInfo.responses);
    });
  }, [router.isReady, id]);

  const phase = hwInfo && getHomeworkPhase(hwInfo.homework);

  if (forceFauLogin) {
    return (
      <MainLayout title={`${courseId ?? ''} Homework | VoLL-KI`}>
        <ForceFauLogin />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${hwInfo?.courseId ?? ''} Homework | ALeA`}>
      <Box>
        {!userInfo ? (
          <Box p="20px">You must be logged in to see homeworks.</Box>
        ) : !phase || phase === 'NOT_GIVEN' ? (
          <Box>Homework not yet given</Box>
        ) : (
          <GradingContext.Provider
            value={{
              isGrading: false,
              showGrading: true,
              gradingInfo: hwInfo?.gradingInfo || {},
              studentId: 'fake_abc',
            }}
          >
            <QuizDisplay
              isFrozen={phase !== 'GIVEN'}
              showPerProblemTime={false}
              problems={problems}
              existingResponses={responses}
              homeworkId={+id}
              onResponse={async (problemId, response) => {
                for (const [idx, answer] of Object.entries(response.freeTextResponses)) {
                  const answerAccepted = await createAnswer({
                    homeworkId: +id,
                    questionId: problemId,
                    subProblemId: idx,
                    answer,
                    questionTitle: problems[problemId].header,
                    courseId,
                  });
                  if (!answerAccepted) {
                    alert('Answers are no longer being accepted');
                    location.reload();
                  }
                }
              }}
            />
          </GradingContext.Provider>
        )}
      </Box>
    </MainLayout>
  );
};

export default HomeworkDocPage;
