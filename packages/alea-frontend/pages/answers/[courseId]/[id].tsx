import { Box, Button, Paper } from '@mui/material';
import {
  AnswerResponse,
  deleteAnswer,
  deleteReviewRequest,
  getAnswer,
  getProblemShtml,
  GradeResponse,
  Problem,
  ProblemResponse,
  ReviewType,
} from '@stex-react/api';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import MainLayout from '../../../layouts/MainLayout';
import { ProblemDisplay } from 'packages/stex-react-renderer/src/lib/ProblemDisplay';
import { useContext, useEffect, useState } from 'react';

const AnswerPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId;
  const answerId = +router.query.id;
  const { mmtUrl } = useContext(ServerLinksContext);
  const [problem, setProblem] = useState<Problem>();
  const [answer, setAnswer] = useState<{
    answer: AnswerResponse;
    grades: GradeResponse[];
    reviewRequests: { id: number; reviewType: ReviewType }[];
  }>();
  useEffect(() => {
    if (!isNaN(answerId)) getAnswer(answerId).then(setAnswer);
  }, [answerId]);
  useEffect(() => {
    if (answer)
      getProblemShtml(mmtUrl, answer.answer.questionId).then((c) => {
        setProblem(getProblem(hackAwayProblemId(c), ''));
      });
  }, [answer]);
  async function OnHandleDelete() {
    await deleteAnswer(answerId);
  }
  async function OnHandleReviewRequestDelete(id: number) {
    await deleteReviewRequest(id);
  }

  return (
    <MainLayout>
      <Box sx={{ width: '100%', margin: 'auto', maxWidth: '900px', gap: 3 }}>
        {problem && (
          <ProblemDisplay
            r={{} as ProblemResponse}
            uri={answer?.answer.questionId}
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
        <Box>
          <span>Answer: </span>
          {answer?.answer.answer}
        </Box>
        <Box>
          Grades:
          <Paper elevation={2}>
            {answer?.grades.map((c) => (
              <>
                <p>
                  {c.answerClasses.map((d) => (
                    <>
                      <p>{d.title + ' ' + d.description + ' x' + d.count}</p>
                    </>
                  ))}
                </p>
              </>
            ))}
          </Paper>
        </Box>
        <Box>
          Reviews Request:
          <Paper elevation={1}>
            {answer?.reviewRequests.map((c) => (
              <>
                <p>{c.reviewType}</p>
                <Button onClick={() => OnHandleReviewRequestDelete(c.id)}></Button>
              </>
            ))}
          </Paper>
        </Box>
        <Button onClick={OnHandleDelete}>Delete</Button>
      </Box>
    </MainLayout>
  );
};

export default AnswerPage;
