import { NextPage } from 'next';
import MainLayout from '../layouts/MainLayout';
import { Box, IconButton, List, ListItemButton, ListItemText } from '@mui/material';
import {
  GradingContext,
  mmtHTMLToReact,
  ProblemDisplay,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
import {
  deleteGraded,
  getLearningObjectShtml,
  getMyGraded,
  getUserInfo,
  GradingInfo,
  GradingWithAnswer,
  Problem,
  ProblemResponse,
  UserInfo,
} from '@stex-react/api';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { ShowGradingFor } from 'packages/stex-react-renderer/src/lib/SubProblemAnswer';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Delete';
function GradedItemsList({
  gradedItems,
  onSelectItem,
}: {
  gradedItems: GradingWithAnswer[];
  onSelectItem: (answerId: number) => void;
}) {
  return (
    <Box maxHeight="50vh" overflow="scroll">
      <List disablePadding>
        {gradedItems.map(({ questionTitle, answer, id }, idx) => (
          <ListItemButton
            key={`${questionTitle}-${id}-${idx}`}
            onClick={(e) => onSelectItem(id)}
            sx={{ py: 0, bgcolor: idx % 2 === 0 ? '#f0f0f0' : '#ffffff' }}
          >
            <ListItemText
              primary={questionTitle ? mmtHTMLToReact(questionTitle) : id}
              secondary={mmtHTMLToReact(
                questionTitle.slice(0, questionTitle.length > 20 ? 20 : questionTitle.length)
              )}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
function GradedItemDisplay({ grade }: { grade: GradingWithAnswer }) {
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
  const onDeleteClicked = () => {
    if (confirm('Are you sure you want to delete this grade?')) {
      deleteGraded(grade.id).then(() => {
        alert('Grade Deleted');
      });
    }
  };
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
          studentId: '',
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
              onClick={onDeleteClicked}
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
const MyGrading: NextPage = () => {
  const [gradingItems, setGradingItems] = useState<GradingWithAnswer[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [selected, setSelected] = useState<{ gradedId: number } | undefined>(undefined);
  const router = useRouter();
  useEffect(() => {
    getUserInfo().then((info) => {
      if (!info) {
        router.push('/login');
        return;
      }
      getMyGraded().then((g) => {
        setGradingItems(g);
      });
      setUserInfo(info);
    });
  }, [router]);
  return (
    <MainLayout title="My Grading">
      <Box display="flex" mt={1} flexWrap="wrap" rowGap={0.5}>
        <Box sx={{ border: '1px solid #ccc' }} flex="1 1 200px" maxWidth={300}>
          <GradedItemsList
            gradedItems={gradingItems}
            onSelectItem={(gradedId) => setSelected({ gradedId })}
          />
        </Box>
        <Box border="1px solid #ccc" flex="1 1 400px" p={2} maxWidth="fill-available">
          {selected ? (
            <GradedItemDisplay grade={gradingItems.find((item) => item.id === selected.gradedId)} />
          ) : (
            <i>Please click on a Graded item on the left.</i>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};
export default MyGrading;
