import {
  Button,
  TextField,
  Box,
  RadioGroup,
  Radio,
  Dialog,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  AppBar,
  FormControlLabel,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AnswerClass,
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
import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react';
import { getLocaleObject } from './lang/utils';
import CloseIcon from '@mui/icons-material/Close';
import { defaultAnswerClasses } from '@stex-react/quiz-utils';
import { mmtHTMLToReact } from './mmtParser';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
  const t = getLocaleObject(useRouter()).quiz;
  const [showGrading, setShowGrading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedBack] = useState('');
  const [answerId, setAnswerId] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [answerClasses, setAnswerClasses] = useState(
    [...defaultAnswerClasses, ...subProblem.answerclasses].map((c) => ({
      count: 0,
      ...c,
    }))
  );
  const [selectedAnswerClass, setSelectAnswerClass] = useState<AnswerClass>(
    defaultAnswerClasses[0]
  );
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  useEffect(() => {
    getAnswers().then((c) =>
      setAnswers(c.filter((c) => c.questionId === questionId && c.subProblemId === subProblemId))
    );
  }, [answerId]);
  async function onSubmitAnswer(event: SyntheticEvent) {
    event.preventDefault();
    if (showGrading) {
      setShowGrading(false);
      setShowSolution(false);
      setAnswer('');
      return;
    }

    if (answer === '') return;
    const created = await createAnswer({
      answer: answer,
      questionId: questionId,
      questionTitle: problemHeader,
      subProblemId: subProblemId,
    });
    if (created.status !== 201) return;
    setAnswerId(created.answerId.id);
    setShowGrading(true);
    setShowSolution(true);
  }
  const handleDefaulAnswerClassesChange = (id: string) => {
    const newAnswerClasses = answerClasses.map((answerclass) => {
      if (answerclass.className === id) {
        setSelectAnswerClass(answerclass);
        return { ...answerclass, count: 1 };
      }
      return { ...answerclass, count: 0 };
    });

    setAnswerClasses(newAnswerClasses);
  };
  const handleAnswerClassesChange = (
    id: string,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newAnswerClasses = answerClasses.map((answerclass) => {
      if (answerclass.className === id) {
        const newCount = +event.target.value;
        return { ...answerclass, count: newCount >= 0 ? newCount : 0 };
      }
      return answerclass;
    });

    setAnswerClasses(newAnswerClasses);
  };
  async function onSaveGrading(event: SyntheticEvent) {
    event.preventDefault();
    setShowGrading(false);
    setShowSolution(false);
    if (answer === '') return;
    const acs: CreateAnswerClassRequest[] = subProblem.answerclasses
      .map((c) => {
        return {
          answerClassId: c.className,
          closed: c.closed,
          description: c.description,
          title: c.title,
          isTrait: c.isTrait,
          points: c.points,
          count: answerClasses.find((d) => d.className === c.className)?.count || 0,
        };
      })
      .filter((c) => c.count > 0);
    if (acs.length > 0)
      await createGradring({
        answerClasses: acs,
        answerId: answerId,
        customFeedback: feedback,
      });
    setAnswer('');
    setAnswerId(0);
    setFeedBack('');
    setSelectAnswerClass(answerClasses[0]);
  }

  function handleClose(): void {
    setAnchorEl(null);
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(event.currentTarget);
  }

  async function OnOnlySaveAnswer(): Promise<void> {
    if (answer === '') return;
    await createAnswer({
      answer: answer,
      questionId: questionId,
      questionTitle: problemHeader,
      subProblemId: subProblemId,
    });
    handleClose();
  }

  function OnOnlySeeSolution(): void {
    setShowSolution(!showSolution);
  }

  async function OnSaveAndReviewRequest(): Promise<void> {
    if (answer === '') return;
    const answerCreated = await createAnswer({
      answer: answer,
      questionId: questionId,
      questionTitle: problemHeader,
      subProblemId: subProblemId,
    });
    if (answerCreated.status !== 201) return;

    await createReviewRequest({ answerId: answerCreated.answerId.id, reviewType: ReviewType.PEER });
    setAnswer('');
    handleClose()
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
            Show older answers
          </Button>
        </div>
      </form>
      {showSolution && <div style={{ color: '#555' }}>{mmtHTMLToReact(subProblem.solution)}</div>}
      {showGrading && (
        <form onSubmit={onSaveGrading}>
          <RadioGroup defaultValue={answerClasses[0].className}>
            {answerClasses
              .filter((c) => !c.isTrait)
              .map((d) => (
                <FormControlLabel
                  onChange={(e) => handleDefaulAnswerClassesChange(d.className)}
                  value={d.className}
                  control={<Radio />}
                  label={`${d.title}, ${d.description}`}
                />
              ))}
          </RadioGroup>
          {(!selectedAnswerClass?.closed ?? true) &&
            answerClasses
              .filter((c) => c.isTrait)
              .map((d) => (
                <Box my="5px">
                  <TextField
                    size="small"
                    onChange={(e) => handleAnswerClassesChange(d.className, e)}
                    style={{ marginLeft: '10px', width: '3vw' }}
                    type="number"
                    defaultValue="0"
                  ></TextField>
                  {`${d.title}, ${d.description}`}
                  {showPoints && ` (${t.point}:${d.points})`}
                </Box>
              ))}
          <span>{t.feedback}</span>
          <TextField
            multiline
            fullWidth
            placeholder={t.feedback}
            minRows={5}
            value={feedback}
            style={{ display: 'block' }}
            onChange={(e) => setFeedBack(e.target.value)}
          />
          <Button type="submit" variant="contained">
            {t.submit}
          </Button>
        </form>
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
              History
            </Typography>
          </Toolbar>
        </AppBar>
        <List>
          {answers.map((c) => (
            <>
              <ListItemButton
                onClick={() => {
                  setAnswer(c.answer);
                  setAnswerId(c.id);
                  setShowGrading(true);
                  setShowSolution(true);
                  setIsHistoryOpen(false);
                }}
              >
                <ListItemText
                  primary={c.answer}
                  style={{ whiteSpace: 'pre-line' }}
                  secondary={dayjs(c.updatedAt.toString()).toNow(true)}
                />
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
        <MenuItem onClick={OnSaveAndReviewRequest}>Save & Submit review request</MenuItem>
        {/* <MenuItem onClick={handleClose}> </MenuItem> */}
      </Menu>
    </>
  );
}
