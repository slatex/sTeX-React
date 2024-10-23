import {
  Button,
  TextField,
  Dialog,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';

import {
  AnswerResponse,
  createAnswer,
  CreateAnswerClassRequest,
  createGradring,
  createReviewRequest,
  getAnswers,
  ReviewType,
  SubProblemData,
} from '@stex-react/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/router';
import { SyntheticEvent, useEffect, useState } from 'react';
import { getLocaleObject } from './lang/utils';
import CloseIcon from '@mui/icons-material/Close';
import { mmtHTMLToReact } from './mmtParser';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { GradingSubProblems } from './nap/GradingProblem';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import GradingIcon from '@mui/icons-material/Grading';
import FeedbackIcon from '@mui/icons-material/Feedback';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import GroupsIcon from '@mui/icons-material/Groups';
export function SubProblemAnswer({
  subProblem,
  problemHeader,
  questionId,
  subProblemId,
  showPoints,
}: {
  subProblem: SubProblemData;
  questionId: string;
  subProblemId: string;
  problemHeader: string;
  showPoints: boolean;
}) {
  dayjs.extend(relativeTime);
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
  useEffect(() => {
    if (courseId) getAnswers(courseId, questionId, subProblemId).then(setAnswers);
  }, [answerId, courseId, questionId, subProblemId]);
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
      subProblemId: subProblemId,
      courseId: courseId,
    });
  }
  return (
    <>
      <form onSubmit={onSubmitAnswer}>
        <TextField
          disabled={showGrading}
          multiline
          fullWidth
          placeholder={t.answer + '...'}
          minRows={5}
          style={{ display: 'block' }}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
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
      </form>
      {showSolution && <div style={{ color: '#555' }}>{mmtHTMLToReact(subProblem.solution)}</div>}
      {showGrading && (
        <GradingSubProblems
          rawAnswerClasses={subProblem.answerclasses}
          onGraded={onSaveGrading}
        ></GradingSubProblems>
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
                  {c.reviewRequests.map((d) =>
                    d === ReviewType.INSTRUCTOR ? (
                      <GroupsIcon></GroupsIcon>
                    ) : (
                      <Diversity3Icon></Diversity3Icon>
                    )
                  )}
                  {c.graded && (
                    <IconButton
                      onClick={(e) => {
                        router.push(`/answers/${courseId}/${c.id}`)
                        e.preventDefault();
                      }}
                      aria-label="delete"
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
      <Menu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={OnOnlySaveAnswer}>Save</MenuItem>
        <MenuItem onClick={OnOnlySeeSolution}>
          {showSolution ? t.hideSolution : t.showSolution}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => OnSaveAndReviewRequest(ReviewType.PEER)}>
          Save & Submit a peer review request
        </MenuItem>
        <MenuItem onClick={() => OnSaveAndReviewRequest(ReviewType.INSTRUCTOR)}>
          {t.saveAndSubmitAInstructorReview}
        </MenuItem>
      </Menu>
    </>
  );
}
