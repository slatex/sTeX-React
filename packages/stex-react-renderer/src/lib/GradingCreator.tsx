import { Box, Button, FormControlLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { AnswerClass, CreateAnswerClassRequest } from '@stex-react/api';
import { DEFAULT_ANSWER_CLASSES } from '@stex-react/quiz-utils';
import { useRouter } from 'next/router';
import { ChangeEvent, SyntheticEvent, useContext, useEffect, useState } from 'react';
import { getLocaleObject } from './lang/utils';
import { GradingContext } from './SubProblemAnswer';

export function GradingCreator({
  subProblemId,
  rawAnswerClasses = [],
  showPoints = false,
}: {
  subProblemId: string;
  rawAnswerClasses: AnswerClass[];
  showPoints?: boolean;
}) {
  const router = useRouter();
  const t = getLocaleObject(router).quiz;
  const { onNewGrading } = useContext(GradingContext);
  const [answerClasses, setAnswerClasses] = useState(
    [...DEFAULT_ANSWER_CLASSES, ...rawAnswerClasses].map((c) => ({
      count: 0,
      ...c,
    }))
  );

  const [feedback, setFeedBack] = useState('');
  const [selectedAnswerClass, setSelectAnswerClass] = useState<AnswerClass | undefined>(undefined);
  const isAnswerClassSelected = !!selectedAnswerClass;

  useEffect(() => {
    setAnswerClasses(
      [...DEFAULT_ANSWER_CLASSES, ...rawAnswerClasses].map((c) => ({
        count: 0,
        ...c,
      }))
    );
  }, [rawAnswerClasses]);
  const handleAnswerClassesChange = (
    id: string,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newAnswerClasses = answerClasses.map((answerclass) => {
      //TODO:Check
      if (answerclass.className === id) {
        const newCount = +event.target.value;
        return { ...answerclass, count: newCount >= 0 ? newCount : 0 };
      }
      return answerclass;
    });

    setAnswerClasses(newAnswerClasses);
  };
  const handleDefaultAnswerClassesChange = (id: string) => {
    const newAnswerClasses = answerClasses.map((answerclass) => {
      if (answerclass.className === id) {
        setSelectAnswerClass(answerclass);
        return { ...answerclass, count: 1 };
      }
      return { ...answerclass, count: 0 };
    });

    setAnswerClasses(newAnswerClasses);
  };
  async function onSaveGrading(event: SyntheticEvent) {
    event.preventDefault();
    const acs: CreateAnswerClassRequest[] = answerClasses
      .map((c) => ({
        answerClassId: c.className,
        closed: c.closed,
        description: c.description,
        title: c.title,
        isTrait: c.isTrait,
        points: c.points,
        count: c.count,
      }))
      .filter((c) => c.count > 0);
    onNewGrading?.(subProblemId, acs, feedback);
    setFeedBack('');
    setSelectAnswerClass(answerClasses[0]);
  }
  return (
    <form onSubmit={onSaveGrading}>
      <RadioGroup>
        {answerClasses
          .filter((c) => !c.isTrait)
          .map((d) => (
            <FormControlLabel
              onChange={(e) => handleDefaultAnswerClassesChange(d.className)}
              value={d.className}
              control={<Radio />}
              label={`${d.title}, ${d.description}`}
            />
          ))}
      </RadioGroup>
      {!selectedAnswerClass?.closed &&
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

      <Button type="submit" variant="contained" disabled={!isAnswerClassSelected}>
        {t.submit}
      </Button>
    </form>
  );
}
