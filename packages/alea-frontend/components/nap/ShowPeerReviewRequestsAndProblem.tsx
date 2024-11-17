import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Box, Paper } from '@mui/material';
import {
  AnswerResponse,
  CreateAnswerClassRequest,
  createGradring,
  getAnswerWithReviewRequestId,
  getCourseInfo,
  getProblemShtml,
  getReviewRequests,
  Problem,
  ProblemResponse,
  ReviewType,
} from '@stex-react/api';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { CourseInfo } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { GradingSubProblems } from 'packages/stex-react-renderer/src/lib/nap/GradingProblem';
import { ShowReviewRequests } from 'packages/stex-react-renderer/src/lib/nap/ShowReviewRequests';
import { ProblemDisplay } from 'packages/stex-react-renderer/src/lib/ProblemDisplay';
import { useState, useContext, useEffect } from 'react';
export function ShowPeerReviewRequestsAndProblem({ courseId }: { courseId: string }) {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerResponse>();
  const [problem, setProblem] = useState<Problem>();
  const { mmtUrl } = useContext(ServerLinksContext);
  const [reviewRequests, setReviewRequests] = useState<
    {
      answers: { subProblemId: number; id: number; answer: string; answerId: number }[];
      questionTitle: string;
    }[]
  >([]);
  useEffect(() => {
    if (courseId) getReviewRequests(courseId).then(setReviewRequests);
  }, [courseId]);
  const reviewId = +router.query.reviewId;
  useEffect(() => {
    if (!reviewId || isNaN(reviewId)) return;
    getAnswerWithReviewRequestId(reviewId).then(setSelectedAnswer);
  }, [reviewId]);
  useEffect(() => {
    if (selectedAnswer)
      getProblemShtml(mmtUrl, selectedAnswer.questionId).then((c) => {
        setProblem(getProblem(hackAwayProblemId(c), ''));
      });
  }, [selectedAnswer?.questionId]);
  async function onSaveGrading(acs: CreateAnswerClassRequest[], feedback: string) {
    if (acs.length === 0) return;
    await createGradring({
      answerClasses: acs,
      answerId: selectedAnswer.id,
      customFeedback: feedback,
    });
  }
  async function onAnswerSelected(reviewId: number) {
    setSelectedAnswer(await getAnswerWithReviewRequestId(reviewId));
  }
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
        <ShowReviewRequests
          onAnswerSelected={onAnswerSelected}
          courseId={courseId}
          reviewRequests={reviewRequests}
        ></ShowReviewRequests>
        {/* <Divider  /> */}
        <Box sx={{ width: '900px' }}>
          {selectedAnswer && (
            <>
              {problem && (
                <ProblemDisplay
                  r={{} as ProblemResponse}
                  uri={selectedAnswer?.questionId}
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
              <Paper sx={{ gap: 2, bgcolor: '#99F8FD', marginTop: '3px' }} elevation={3}>
                <div>
                  <span>Sub Problem: </span>
                  <span>{+selectedAnswer?.subProblemId + 1}</span>
                </div>
                <span>Answer:</span>
                <p style={{ whiteSpace: 'pre-line' }}>{selectedAnswer?.answer}</p>
              </Paper>
              {problem && (
                <>
                  <GradingSubProblems
                    showBackButton={true}
                    rawAnswerClasses={
                      problem?.subProblemData[selectedAnswer.subProblemId]?.answerclasses
                    }
                    onGraded={onSaveGrading}
                  ></GradingSubProblems>
                </>
              )}
            </>
          )}
          {!selectedAnswer && (
            <span style={{ margin: 'auto' }}>NO Review Request has been Selected</span>
          )}
        </Box>
      </Box>
    </>
  );
}
