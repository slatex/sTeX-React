import { NextPage } from 'next';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';

import { CourseHeader } from '../../course-home/[courseId]';
import { useContext, useEffect, useState } from 'react';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
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
import { CourseInfo } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { Box, Divider, Paper } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ShowReviewRequests } from 'packages/stex-react-renderer/src/lib/nap/ShowReviewRequests';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { GradingSubProblems } from 'packages/stex-react-renderer/src/lib/nap/GradingProblem';
import { ProblemDisplay } from 'packages/stex-react-renderer/src/lib/ProblemDisplay';
const PeerGradingListPage: NextPage = () => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerResponse>();
  const [problem, setProblem] = useState<Problem>();
  const { mmtUrl } = useContext(ServerLinksContext);
  const courseId = router.query.courseId as string;
  const [courses, setCourses] = useState<Record<string, CourseInfo> | undefined>(undefined);
  const [reviewRequests, setReviewRequests] = useState<
    {
      answers: { subProblemId: number; id: number; answer: string; answerId: number }[];
      questionTitle: string;
    }[]
  >([]);
  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);
  useEffect(() => {
    getReviewRequests(ReviewType.PEER, courseId).then(setReviewRequests);
  }, [courseId]);
  const courseInfo = courses?.[courseId];

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
      <MainLayout>
        <CourseHeader
          courseName={courseInfo?.courseName}
          imageLink={courseInfo?.imageLink}
          courseId={courseId}
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
          <ShowReviewRequests
            onAnswerSelected={onAnswerSelected}
            courseId={courseId}
            reviewRequests={reviewRequests}
          ></ShowReviewRequests>
          {/* <Divider  /> */}
          {selectedAnswer && (
            <Box>
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
                      problem?.subProblemDatas[selectedAnswer.subProblemId].answerclasses
                    }
                    onGraded={onSaveGrading}
                  ></GradingSubProblems>
                </>
              )}
            </Box>
          )}
          {!selectedAnswer && (
            <Box>
              <span style={{margin:'auto'}}>NO Review Request has been Selected</span>
            </Box>
          )}
        </Box>
      </MainLayout>
    </>
  );
};
export default PeerGradingListPage;
