import { Box, Button } from '@mui/material';
import {
  AnswerResponse,
  CreateAnswerClassRequest,
  createGradring,
  getAnswerWithReviewRequestId,
  getProblemShtml,
  Problem,
  ProblemResponse,
} from '@stex-react/api';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { GradingSubProblems } from 'packages/stex-react-renderer/src/lib/nap/GradingProblem';
import { ProblemDisplay } from 'packages/stex-react-renderer/src/lib/ProblemDisplay';
import { useContext, useEffect, useState } from 'react';

const InstructorReviewProblems: NextPage = () => {
    const router = useRouter();
    const [answer, setAnswer] = useState<AnswerResponse>();
    const { mmtUrl } = useContext(ServerLinksContext);
    const [problem, setProblem] = useState<Problem>();
    const reviewId = +router.query.reviewId;
    useEffect(() => {
      if (!reviewId || isNaN(reviewId)) return;
      getAnswerWithReviewRequestId(reviewId).then(setAnswer);
    }, [reviewId]);
    useEffect(() => {
      if (answer)
        getProblemShtml(mmtUrl, answer.questionId).then((c) => {
          setProblem(getProblem(hackAwayProblemId(c), ''));
        });
    }, [answer]);
    async function onSaveGrading(acs: CreateAnswerClassRequest[], feedback: string) {
      if (acs.length === 0) return;
      await createGradring({
        answerClasses: acs,
        answerId: answer.id,
        customFeedback: feedback,
      });
      router.back();
    }
  
    return (
      <MainLayout>
        <Box>
          <Box>
            {problem && (
              <ProblemDisplay
                r={{} as ProblemResponse}
                uri={answer?.questionId}
                showPoints={false}
                problem={problem}
                isFrozen={true}
                onResponseUpdate={(response) => {
                  return;
                }}
                onFreezeResponse={() => {
                  return;
                }}
              />
            )}
            <div>
              <span>Sub Problem: </span>
              <span>{+answer?.subProblemId+1}</span>
            </div>
            <span>Answer:</span>
            <p style={{ whiteSpace: 'pre-line' }}>{answer?.answer}</p>
            {problem && (
              <>
              <GradingSubProblems
              showBackButton={true}
                rawAnswerClasses={problem?.subProblemDatas[answer.subProblemId].answerclasses}
                onGraded={onSaveGrading}
              ></GradingSubProblems>
              
              </>
            )}
          </Box>
        </Box>
      </MainLayout>
    );
};
export default InstructorReviewProblems;
