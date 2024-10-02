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
} from '@mui/material';
import {
  AnswerClass,
  AnswerResponse,
  createAnswer,
  CreateAnswerClassRequest,
  createGradring,
  getAnswers,
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
  const [showSolution, setShowSolution] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedBack] = useState('');
  const [answerId, setAnswerId] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
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
    if (showSolution) {
      setShowSolution(false);
      setAnswer('');
      return;
    }

    setShowSolution(true);
    if (answer === '') return;
    const created = await createAnswer({
      answer: answer,
      questionId: questionId,
      questionTitle: problemHeader,
      subProblemId: subProblemId,
    });
    if (created.status === 201) setAnswerId(created.answerId.id);
    else setShowSolution(false);
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

  return (
    <>
      <form onSubmit={onSubmitAnswer}>
        <TextField
          disabled={showSolution}
          multiline
          fullWidth
          placeholder={t.answer + '...'}
          minRows={5}
          style={{ display: 'block' }}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '3px' }}>
          <Button type="submit" variant="contained">
            {showSolution ? t.hideSolution : t.checkSolution}
          </Button>
          <Button disabled={showSolution} onClick={() => setIsHistoryOpen(true)} type="button">
            Show older answers
          </Button>
        </div>
      </form>

      {showSolution && (
        <form onSubmit={onSaveGrading}>
          <div style={{ color: '#555' }}>{mmtHTMLToReact(subProblem.solution)}</div>
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
      <Dialog fullScreen open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)}>
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
                  setShowSolution(true);
                  setIsHistoryOpen(false);
                }}
              >
                <ListItemText
                  primary={c.answer}
                  secondary={dayjs(c.updatedAt.toString()).toNow(true)}
                />
              </ListItemButton>
              <Divider />
            </>
          ))}
        </List>
      </Dialog>
    </>
  );
}
