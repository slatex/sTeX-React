import { FTML } from '@kwarc/ftml-viewer';
import { Box } from '@mui/material';
import {
  FTMLProblemWithSolution,
  getHomework,
  getHomeworkPhase,
  GetHomeworkResponse,
  getUserInfo,
  GradingInfo,
  UserInfo,
} from '@stex-react/api';
import { GradingContext, QuizDisplay, ShowGradingFor } from '@stex-react/stex-react-renderer';
import { isFauId } from '@stex-react/utils';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ForceFauLogin } from '../components/ForceFAULogin';
import MainLayout from '../layouts/MainLayout';

const HomeworkDocPage: React.FC = () => {
  const router = useRouter();

  const [problems, setProblems] = useState<Record<string, FTMLProblemWithSolution>>({});
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
      isFauId(uid) ? setForceFauLogin(false) : setForceFauLogin(true);
    });
  }, []);
  const courseId = hwInfo?.homework.courseId;
  const instanceId = hwInfo?.homework.courseInstance;

  const [responses, setResponses] = useState<{
    [problemId: string]: FTML.ProblemResponse;
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
      for (const e of hwInfo.homework.css ?? []) FTML.injectCss(e);
      setProblems(hwInfo.homework.problems);
      setResponses(hwInfo.responses);
    });
  }, [router.isReady, id]);

  const phase = hwInfo && getHomeworkPhase(hwInfo.homework);

  if (forceFauLogin) {
    return (
      <MainLayout title={`${courseId ?? ''} Homework | ALeA`}>
        <ForceFauLogin />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${courseId ?? ''} Homework | ALeA`}>
      <Box>
        {!userInfo ? (
          <Box p="20px">You must be logged in to see homeworks.</Box>
        ) : !phase || phase === 'NOT_GIVEN' ? (
          <Box>Homework not yet given</Box>
        ) : (
          <GradingContext.Provider
            value={{
              showGradingFor: ShowGradingFor.INSTRUCTOR,
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
                /*for (const [idx, answer] of Object.entries(response.freeTextResponses)) {
                  const answerAccepted = await createAnswer({
                    homeworkId: +id,
                    questionId: problemId,
                    subProblemId: idx,
                    answer,
                    questionTitle: problems[problemId].problem.title_html,
                    courseId,
                  });
                  if (!answerAccepted) {
                    alert('Answers are no longer being accepted');
                    location.reload();
                  }
                } TODO ALEA4-P4*/
              }}
            />
          </GradingContext.Provider>
        )}
      </Box>
    </MainLayout>
  );
};

export default HomeworkDocPage;
