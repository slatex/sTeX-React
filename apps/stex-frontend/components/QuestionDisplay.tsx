import {
  Box,
  Card,
  Checkbox,
  CircularProgress,
  TextField,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio, { RadioProps } from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import styles from '../styles/quiz.module.scss';
import { Question, QuestionType, UserResponse } from './question-utils';

function BpRadio(props: RadioProps) {
  return <Radio disableRipple color="default" {...props} />;
}

function getClassNames(
  isSelected: boolean,
  isSubmitted: boolean,
  isCorrect: boolean
) {
  let style = styles['option'];
  style +=
    ' ' +
    (isSelected ? styles['option_selected'] : styles['option_not_selected']);
  if (isSubmitted) {
    if (isCorrect) style += ' ' + styles['correct'];
    if (isSelected && !isCorrect) style += ' ' + styles['incorrect'];
  } else {
    if (isSelected) style += ' ' + styles['option_unsubmitted_selected'];
  }
  return style;
}

function checkFilledInSolution(filledIn: string, question: Question) {
  if(!filledIn?.length) return false;
  if (!question.fillInSolution?.length) return true;
  return filledIn.toLowerCase() === question.fillInSolution.toLowerCase();
}

function isCorrect(question: Question, response: UserResponse) {
  const { filledInAnswer, singleOptionIdx, multiOptionIdx } = response;
  switch (question.type) {
    case QuestionType.FILL_IN:
      return checkFilledInSolution(filledInAnswer, question);
    case QuestionType.MULTI_CHOICE_SINGLE_ANSWER:
      return (
        singleOptionIdx >= 0 && question.options[singleOptionIdx].shouldSelect
      );
    case QuestionType.MULTI_CHOICE_MULTI_ANSWER:
      return !question.options.some(
        (opt, idx) => opt.shouldSelect !== (multiOptionIdx[idx] ?? false)
      );
  }
  return false;
}

export function QuestionDisplay({
  question,
  isSubmitted,
  response,
  onResponseUpdate,
}: {
  question: Question | undefined;
  isSubmitted: boolean;
  response: UserResponse;
  onResponseUpdate: (
    response: UserResponse,
    isAnswered: boolean,
    isCorrect: boolean
  ) => void;
}) {
  const {
    singleOptionIdx: selectedIdx,
    multiOptionIdx: multiSelectedIdx,
    filledInAnswer,
  } = response;
  if (!question) return <CircularProgress />;

  const feedback =
    selectedIdx >= 0 && question?.options[selectedIdx].feedbackHtml;

  return (
    <Card
      sx={{
        backgroundColor: 'hsl(210, 20%, 95%)',
        border: '1px solid #CCC',
        p: '10px',
      }}
    >
      <Box display="inline" fontSize="20px">
        <Box display="inline">
          {mmtHTMLToReact(question.statement.outerHTML || '')}
        </Box>
      </Box>
      <br />
      <FormControl sx={{ width: '100%' }}>
        {question.type === QuestionType.MULTI_CHOICE_SINGLE_ANSWER && (
          <RadioGroup
            aria-labelledby="demo-customized-radios"
            name="customized-radios"
            value={selectedIdx.toString()}
            onChange={(e) => {
              if (isSubmitted) return;
              const sIdx = +e.target.value;
              const r = { singleOptionIdx: sIdx };
              onResponseUpdate(r, sIdx >= 0, isCorrect(question, r));
            }}
          >
            {question.options?.map((option, optionIdx) => (
              <FormControlLabel
                key={optionIdx}
                value={optionIdx.toString()}
                control={<BpRadio />}
                className={getClassNames(
                  selectedIdx === optionIdx,
                  isSubmitted,
                  question.options[optionIdx].shouldSelect
                )}
                label={
                  <Box display="inline">
                    {option.value.map((node, idx) => (
                      <Box display="inline" key={`${idx}`}>
                        {node.outerHTML
                          ? mmtHTMLToReact(node.outerHTML)
                          : node.textContent}
                      </Box>
                    ))}
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        )}

        {question.type === QuestionType.MULTI_CHOICE_MULTI_ANSWER && (
          <>
            {question.options?.map((option, optionIdx) => (
              <FormControlLabel
                key={optionIdx}
                className={getClassNames(
                  multiSelectedIdx[optionIdx] ?? false,
                  isSubmitted,
                  question.options[optionIdx].shouldSelect
                )}
                control={
                  <Checkbox
                    checked={multiSelectedIdx[optionIdx] ?? false}
                    onChange={(e) => {
                      if (isSubmitted) return;
                      const checked = e.target.checked;
                      multiSelectedIdx[optionIdx] = checked;
                     const r = { multiOptionIdx: { ...multiSelectedIdx } };
                      onResponseUpdate(
                        r,
                        Object.values(multiSelectedIdx).some((v) => v === true),
                        isCorrect(question, r)
                      );
                    }}
                  />
                }
                label={
                  <Box display="inline">
                    {option.value.map((node, idx) => (
                      <Box display="inline" key={`${idx}`}>
                        {node.outerHTML
                          ? mmtHTMLToReact(node.outerHTML)
                          : node.textContent}
                      </Box>
                    ))}
                  </Box>
                }
              />
            ))}
          </>
        )}
        {question.type === QuestionType.FILL_IN && (
          <TextField
            label="Answer"
            value={filledInAnswer}
            onChange={(e) => {
              if (isSubmitted) return;
              const filledIn = e.target.value;
              const r = { filledInAnswer: filledIn };
              onResponseUpdate(r, !!filledIn?.length, isCorrect(question, r));
            }}
            variant="outlined"
            fullWidth
          />
        )}
      </FormControl>
      <br />
      <br />

      {isSubmitted && question.fillInSolution && (
        <>
          {checkFilledInSolution(filledInAnswer, question) ? (
            <b style={{ fontSize: '20px', color: 'green' }}>Correct!</b>
          ) : (
            <span style={{ fontSize: '20px', color: 'red' }}>
              The correct answer is <b>{question.fillInSolution}</b>
            </span>
          )}
        </>
      )}
      {isSubmitted && feedback && (
        <Box
          display="block"
          padding="3px 10px"
          bgcolor={
            question.options[selectedIdx].shouldSelect ? '#a3e9a0' : '#f39797'
          }
          borderRadius="10px"
        >
          <span
            style={{
              display: 'inline',
              textAlign: 'center',
              fontSize: '20px',
            }}
          >
            {mmtHTMLToReact(feedback)}
          </span>
        </Box>
      )}
    </Card>
  );
}
