import { Button, TextField, Box } from '@mui/material';
import {
  createAnswer,
  CreateAnswerClassRequest,
  createGradring,
  SubProblemData,
} from '@stex-react/api';
import { useRouter } from 'next/router';
import { ChangeEvent, SyntheticEvent, useState } from 'react';
import { getLocaleObject } from './lang/utils';

export function SubProblemAnswer({
  subProblem,
  problemHeader,
  questionId,
  subProblemId,
}: {
  subProblem: SubProblemData;
  questionId: string;
  subProblemId: string;
  problemHeader: string;
}) {
  const t = getLocaleObject(useRouter()).quiz;
  const [showSolution, setShowSolution] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedBack] = useState('');
  const [answerId, setAnswerId] = useState(0);
  const [answerClasses, setAnswerClasses] = useState(
    subProblem.answerclasses.map((c) => ({
      count: 0,
      id: c.className,
      title: c.title,
      points: c.points,
    }))
  );
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
  const handleAnswerClassesChange = (
    id: string,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newAnswerClasses = answerClasses.map((answerclass) => {
      if (answerclass.id === id) {
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
    const acs: CreateAnswerClassRequest[] = subProblem.answerclasses.map((c) => {
      return {
        answerClassId: c.className,
        closed: false,
        description: c.description,
        title: c.title,
        isTrait: false,
        points: c.points,
        count: answerClasses.find((d) => d.id === c.className)?.count || 0,
      };
    });
    await createGradring({
      answerClasses: acs.filter((c) => c.count > 0),
      answerId: answerId,
      customFeedback: feedback,
    });
    setAnswer('');
    setAnswerId(0);
    setFeedBack('');
  }

  return (
    <>
      <form onSubmit={onSubmitAnswer}>
        <TextField
          disabled={showSolution}
          multiline
          fullWidth
          placeholder={t.answer+"..."}
          minRows={5}
          style={{ display: 'block' }}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <Button type="submit" variant="contained">
          {showSolution ? t.hideSolution : t.checkSolution}
        </Button>
      </form>
      {showSolution && (
        <form onSubmit={onSaveGrading}>
          {answerClasses.map((d) => (
            <Box my="5px">
              <TextField
                size="small"
                onChange={(e) => handleAnswerClassesChange(d.id, e)}
                style={{ marginLeft: '10px', width: '3vw' }}
                type="number"
                defaultValue="0"
              ></TextField>
              {`${d.title} (${t.point}:${d.points})`}
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
    </>
  );
}
