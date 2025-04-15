import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton } from '@mui/material';
import {
  FTMLProblemWithSolution,
  GradingWithAnswer,
  getLearningObjectShtml,
} from '@stex-react/api';
import { ProblemResponse } from '@stex-react/ftml-utils';
import {
  GradingContext,
  ProblemDisplay,
  ServerLinksContext,
  ShowGradingFor,
} from '@stex-react/stex-react-renderer';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
export function PeerReviewGradedItemDisplay({
  grade,
  onDelete,
}: {
  grade: GradingWithAnswer;
  onDelete: (id: number) => void;
}) {
  const { mmtUrl } = useContext(ServerLinksContext);

  const [problem, setProblem] = useState<FTMLProblemWithSolution>();
  const [answerText, setAnswerText] = useState<ProblemResponse>();
  useEffect(() => {
    getLearningObjectShtml(mmtUrl, grade.questionId).then((p) => {
      // setProblem(getProblem(p, '')); TODO alea4
    });
    // TODO alea4
    // setAnswerText({
    //   freeTextResponses: { [grade.subProblemId]: grade.answer },
    //   autogradableResponses: [],
    // });
  }, [grade]);
  return (
    <GradingContext.Provider
      value={{
        isGrading: false,
        showGrading: true,
        showGradingFor: ShowGradingFor.ALL,
        gradingInfo: {
          [grade.questionId]: {
            [grade.subProblemId]: [grade],
          },
        },
        studentId: grade.checkerId,
      }}
    >
      <Box>
        <ProblemDisplay
          showUnansweredProblems={false}
          showPoints={false}
          problem={problem}
          isFrozen={true}
          r={answerText}
          uri={grade.questionId}
          // problemId={grade.questionId} TODO alea4
        ></ProblemDisplay>
        <Box sx={{ margin: '10px' }}>
          <span>{dayjs(grade.updatedAt).fromNow()}</span>
          <IconButton
            onClick={() => onDelete(grade.id)}
            sx={{ float: 'right', display: 'inline' }}
            aria-label="delete"
            color="primary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </GradingContext.Provider>
  );
}
