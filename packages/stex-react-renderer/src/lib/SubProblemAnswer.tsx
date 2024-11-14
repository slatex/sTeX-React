import {
  AppBar,
  Box,
  Button,
  Dialog,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import GradingIcon from '@mui/icons-material/Grading';
import GroupsIcon from '@mui/icons-material/Groups';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  AnswerResponse,
  createAnswer,
  CreateAnswerClassRequest,
  createGradring,
  createReviewRequest,
  getAnswers,
  getHomeWorkAnswer,
  ReviewType,
  SubProblemData,
} from '@stex-react/api';
import { MystEditor, MystViewer } from '@stex-react/myst';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/router';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { getLocaleObject } from './lang/utils';
import { mmtHTMLToReact } from './mmtParser';
import { PRIMARY_COL } from '@stex-react/utils';

dayjs.extend(relativeTime);

export function SubProblemAnswer({
  subProblem,
  problemHeader,
  questionId,
  subProblemId,
  showPoints,
  homeworkId,
  isFrozen,
}: {
  subProblem: SubProblemData;
  questionId: string;
  subProblemId: string;
  problemHeader: string;
  homeworkId?: number;
  showPoints?: boolean;
  isFrozen?: boolean;
}) {
  const router = useRouter();
  const courseId = router.query.courseId?.toString() ?? '';
  const t = getLocaleObject(router).quiz;
  const [showGrading, setShowGrading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answerId, setAnswerId] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [canSaveAnswer, setCanSaveAnswer] = useState<boolean>(false);
  const [isAnswerChanged, setCanDiscardChanged] = useState(false);
  const serverAnswer = useRef<AnswerResponse>();
  const isHomework = !!homeworkId;

  useEffect(() => {
    if (courseId) getAnswers(courseId, questionId, subProblemId).then(setAnswers);
  }, [answerId, courseId, questionId, subProblemId]);

  useEffect(() => {
    setAnswer('');
    if (!isHomework) return;
    const localAnswer = localStorage.getItem(`answer-${questionId}-${subProblemId}`) ?? '';
    setAnswer(localAnswer);
    (async () => {
      serverAnswer.current = await getHomeWorkAnswer(questionId, subProblemId);
      if (serverAnswer.current && localAnswer === serverAnswer.current.answer) {
        setCanSaveAnswer(false);
        setAnswer(serverAnswer.current.answer);
      } else {
        setCanSaveAnswer(localAnswer.trim() !== '');
      }
    })();
  }, [questionId, subProblemId, isHomework]);

  async function onSubmitAnswer(event: SyntheticEvent) {
    event.preventDefault();
    if (showGrading) {
      setShowGrading(false);
      setShowSolution(false);
      setAnswer('');
      return;
    }

    const created = await SaveAnswers();
    if (created.status !== 201) return;
    setAnswerId(created.answerId.id);
    setShowGrading(true);
    setShowSolution(true);
  }

  async function onSaveGrading(acs: CreateAnswerClassRequest[], feedback: string) {
    setShowGrading(false);
    setShowSolution(false);
    if (answer === '') return;
    if (acs.length > 0)
      await createGradring({
        answerClasses: acs,
        answerId: answerId,
        customFeedback: feedback,
      });
    setAnswer('');
    setAnswerId(0);
  }

  function handleClose(): void {
    setAnchorEl(null);
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(event.currentTarget);
  }

  async function OnOnlySaveAnswer(): Promise<void> {
    SaveAnswers();
    handleClose();
  }

  function OnOnlySeeSolution(): void {
    setShowSolution(!showSolution);
  }

  async function OnSaveAndReviewRequest(reviewType: ReviewType): Promise<void> {
    let anid = answerId;
    if (anid === 0) {
      const answerCreated = await SaveAnswers();
      if (answerCreated.status !== 201) return;
      anid = answerCreated.answerId.id;
    }

    await createReviewRequest({ answerId: anid, reviewType: reviewType });
    setAnswer('');
    handleClose();
  }
  async function SaveAnswers() {
    if (answer === '') return { status: 423, answerId: null };
    return createAnswer({
      answer: answer,
      questionId: questionId,
      questionTitle: problemHeader,
      subProblemId,
      courseId,
      homeworkId,
    });
  }
  function onAnswerChanged(value: string): void {
    if (isHomework) localStorage.setItem(`answer-${questionId}-${subProblemId}`, value);
    setAnswer(value);
    setCanSaveAnswer(!!value.trim() && value !== serverAnswer.current?.answer);
    setCanDiscardChanged((serverAnswer.current?.answer ?? '') !== value);
  }

  function onDiscardClicked(): void {
    setAnswer(serverAnswer.current?.answer ?? '');
    setCanSaveAnswer(false);
    setCanDiscardChanged(false);
  }

  async function onQuizeSaveClicked(event: any) {
    event.stopPropagation();
    await SaveAnswers();
    serverAnswer.current = await getHomeWorkAnswer(questionId, subProblemId);
  }
  useEffect(() => {
    if (isFrozen && homeworkId) {
      setShowSolution(true);
    }
  }, [isFrozen, homeworkId]);

  return (
    <>
      <form onSubmit={onSubmitAnswer}>
        {showGrading ? (
          <MystViewer content={answer} />
        ) : isFrozen ? (
          <Box
            sx={{
              border: `2px solid gray`,
              paddingLeft: '10px',
              margin: '5px 0px',
              backgroundColor: '#d3d3d3',
              borderRadius: '5px',
            }}
          >
            <MystViewer content={answer} />
          </Box>
        ) : (
          <MystEditor
            name={`answer-${questionId}-${subProblemId}`}
            placeholder={t.answer + '...'}
            value={answer}
            onValueChange={onAnswerChanged}
          />
        )}
        {!isHomework && (
          <div style={{ display: 'flex', gap: '3px' }}>
            <div>
              <Button type="submit">{showGrading ? t.hideSolution : t.saveAndGrade}</Button>
              <IconButton onClick={handleClick} type="button">
                <KeyboardArrowDownIcon />
              </IconButton>
            </div>
            <Button disabled={showGrading} onClick={() => setIsHistoryOpen(true)} type="button">
              {t.showOlderAnswers}
            </Button>
          </div>
        )}
        {isHomework && !isFrozen && (
          <Box sx={{ gap: '3px' }}>
            <Button disabled={!canSaveAnswer} onClick={onQuizeSaveClicked} variant="contained">
              {t.save}
            </Button>
            <Button disabled={!isAnswerChanged} onClick={onDiscardClicked}>
              {t.discard}
            </Button>
          </Box>
        )}
      </form>
      {isHomework && (
        <>
          {showSolution && (
            <Box
              style={{
                color: '#555',
                backgroundColor: 'white',
                padding: '5px',
                borderRadius: '5px',
                margin: '10px 0px',
                border: `1px solid ${PRIMARY_COL}`,
              }}
            >
              {mmtHTMLToReact(subProblem.solution)}
            </Box>
          )}
          {showGrading && <>NOT IMPLEMENTED YET</>}
        </>
      )}
      <Dialog
        maxWidth="lg"
        fullWidth={true}
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setIsHistoryOpen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {t.history}
            </Typography>
          </Toolbar>
        </AppBar>
        <List>
          {answers.map((c) => (
            <>
              <ListItemButton>
                <ListItemText
                  onClick={() => {
                    setAnswer(c.answer);
                    setAnswerId(c.id);
                    setShowGrading(true);
                    setShowSolution(true);
                    setIsHistoryOpen(false);
                  }}
                  primary={c.answer}
                  style={{ whiteSpace: 'pre-line' }}
                  secondary={dayjs(c.updatedAt.toString()).toNow(true)}
                />
                <Box sx={{ flexDirection: 'column', display: 'flex' }}>
                  {c.reviewRequests?.map((d) =>
                    d === ReviewType.INSTRUCTOR ? (
                      <GroupsIcon></GroupsIcon>
                    ) : (
                      <Diversity3Icon></Diversity3Icon>
                    )
                  )}
                  {c.graded && (
                    <IconButton
                      onClick={(e) => {
                        router.push(`/answers/${courseId}/${c.id}`);
                        e.preventDefault();
                      }}
                    >
                      <GradingIcon></GradingIcon>
                    </IconButton>
                  )}
                </Box>
              </ListItemButton>
              <Divider />
            </>
          ))}
        </List>
      </Dialog>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={OnOnlySaveAnswer}>{t.save}</MenuItem>
        <MenuItem onClick={OnOnlySeeSolution}>
          {showSolution ? t.hideSolution : t.showSolution}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => OnSaveAndReviewRequest(ReviewType.PEER)}>
          {t.saveAndSubmitAPeerReview}
        </MenuItem>
        <MenuItem onClick={() => OnSaveAndReviewRequest(ReviewType.INSTRUCTOR)}>
          {t.saveAndSubmitAInstructorReview}
        </MenuItem>
      </Menu>
    </>
  );
}
