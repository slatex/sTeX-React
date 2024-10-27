import Box from '@mui/material/Box';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import {
  CreateAnswerClassRequest,
  createGradring,
  getHomeworkAnswer,
  getHomeworkAnswers,
  getHomeworkTree,
  ProblemResponse,
} from '@stex-react/api';
import { useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import { Card, List, ListItemButton, ListItemText, Paper } from '@mui/material';
import { GradingSubProblems } from 'packages/stex-react-renderer/src/lib/nap/GradingProblem';
import { ProblemDisplay } from 'packages/stex-react-renderer/src/lib/ProblemDisplay';
import { getProblem } from '@stex-react/quiz-utils';
import { tree } from 'next/dist/build/templates/app-page';
export function ShowPeerReviewHomeworkProblems({ courseId }: { courseId: string }) {
  const [homeworks, setHomeworks] = useState<any[]>();
  const [answers, setAnswers] = useState<any[]>();
  const [selectedAnswer, setSelectedAnswer] = useState<any>();
  useEffect(() => {
    getHomeworkTree(courseId).then(setHomeworks);
  }, [courseId]);
  async function onQuestionSelected(questionId: string, homeworkId: string) {
    setAnswers(await getHomeworkAnswers(questionId, courseId));
  }
  async function onAnAnswerSelected(id: number) {
    const answer = await getHomeworkAnswer(id);
    answer.problem = getProblem(answer.problem);
    console.log(answer.problem);
    setSelectedAnswer(answer);
  }
  async function onGraded(answerClass: CreateAnswerClassRequest[], feedback: string): void {
    await createGradring({
      answerClasses: answerClass,
      answerId: selectedAnswer.answer.id,
      customFeedback: feedback,
    });
  }

  return (
    <Box sx={{ display: 'flex', direction: 'row' }}>
      <TreeView 
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ minWidth: '300px', maxWidth: 400 }}
      >
        {homeworks?.map((c) => (
          <>
            <TreeItem label={mmtHTMLToReact(c.title)} nodeId={c.id}>
              <List>
                {c.problems.map((d) => (
                  <>
                    <ListItemButton onClick={() => onQuestionSelected(d, c.id)}>{d}</ListItemButton>
                  </>
                ))}
              </List>
            </TreeItem>
          </>
        ))}
      </TreeView>
      <List sx={{ maxWidth: '700px' }}>
        {answers &&
          answers?.map((c) => (
            <>
              <ListItemButton onClick={() => onAnAnswerSelected(c.id)}>
                <ListItemText>{c.answer}</ListItemText>
              </ListItemButton>
            </>
          ))}
      </List>
      {selectedAnswer && (
        <Box sx={{ maxWidth: '900px' }}>
          <ProblemDisplay
            r={{} as ProblemResponse}
            showPoints={true}
            isFrozen={true}
            onResponseUpdate={(response) => {
              return;
            }}
            onFreezeResponse={() => {
              return;
            }}
            problem={selectedAnswer.problem}
          ></ProblemDisplay>
          <Card sx={{ gap: 2, bgcolor: '#99F8FD', marginTop: '3px' }} elevation={3}>
            <div>
              <span>Sub Problem: </span>
              <span>{+selectedAnswer?.answer.subProblemId + 1}</span>
            </div>
            <span>Answer:</span>
            <p style={{ whiteSpace: 'pre-line' }}>{selectedAnswer?.answer.answer}</p>
          </Card>
          <GradingSubProblems
            onGraded={onGraded}
            showBackButton={true}
            rawAnswerClasses={selectedAnswer.answer.answerClasses}
          ></GradingSubProblems>
        </Box>
      )}
    </Box>
  );
}
