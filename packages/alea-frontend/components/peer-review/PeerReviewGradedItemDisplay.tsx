import { Box, IconButton } from "@mui/material";
import { GradingWithAnswer, Problem, ProblemResponse, getLearningObjectShtml } from "@stex-react/api";
import { getProblem, hackAwayProblemId } from "@stex-react/quiz-utils";
import { ServerLinksContext, GradingContext, ProblemDisplay } from "@stex-react/stex-react-renderer";
import dayjs from "dayjs";
import { ShowGradingFor } from "packages/stex-react-renderer/src/lib/SubProblemAnswer";
import { useContext, useState, useEffect } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
export function PeerReviewGradedItemDisplay({
    grade,
    onDelete,
  }: {
    grade: GradingWithAnswer;
    onDelete: (id: number) => void;
  }) {
    const { mmtUrl } = useContext(ServerLinksContext);
  
    const [problem, setProblem] = useState<Problem>();
    const [answerText, setAnswerText] = useState<ProblemResponse>();
    useEffect(() => {
      getLearningObjectShtml(mmtUrl, grade.questionId).then((p) => {
        setProblem(getProblem(hackAwayProblemId(p), ''));
      });
      setAnswerText({
        freeTextResponses: { [grade.subProblemId]: grade.answer },
        autogradableResponses: [],
      });
    }, [grade]);
    return (
      <>
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
              showUnAnsweredProblems={false}
              showPoints={false}
              problem={problem}
              isFrozen={true}
              r={answerText}
              uri={grade.questionId}
              onResponseUpdate={() => {}}
              problemId={grade.questionId}
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
      </>
    );
  }