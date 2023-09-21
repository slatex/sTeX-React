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
import {
  Problem,
  ProblemType,
  Tristate,
  UserResponse,
  getCorrectness,
} from '@stex-react/api';

function BpRadio(props: RadioProps) {
  return <Radio disableRipple color="default" {...props} />;
}

function getClassNames(
  isSelected: boolean,
  isFrozen: boolean,
  correctness: Tristate
) {
  let style = styles['option'];
  const isCorrect = correctness === Tristate.TRUE;
  const relevant = isSelected || (isFrozen && !isSelected && isCorrect);
  style +=
    ' ' +
    (relevant ? styles['option_relevant'] : styles['option_not_relevant']);

  const isUnknown = correctness === Tristate.UNKNOWN;
  if (isFrozen) {
    if (!isUnknown) {
      if (isCorrect) {
        style += ' ' + styles['correct'];
        style += ' ' + (isSelected ? styles['got_right'] : styles['missed']);
      } else {
        if (isSelected) style += ' ' + styles['missed'];
      }
      if (isSelected && !isCorrect) style += ' ' + styles['incorrect'];
    }
  } else {
    if (isSelected) style += ' ' + styles['option_unsubmitted_selected'];
  }
  // console.log(style);
  return style;
}

export function ProblemDisplay({
  problem,
  isFrozen,
  response,
  onResponseUpdate,
}: {
  problem: Problem | undefined;
  isFrozen: boolean;
  response: UserResponse;
  onResponseUpdate: (response: UserResponse) => void;
}) {
  const {
    singleOptionIdx: selectedIdx,
    multipleOptionIdxs,
    filledInAnswer,
  } = response;
  if (!problem) return <CircularProgress />;

  const feedback =
    selectedIdx >= 0 && problem?.options[selectedIdx].feedbackHtml;

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
          {mmtHTMLToReact(problem.statement.outerHTML || '')}
        </Box>
      </Box>
      <br />
      <FormControl sx={{ width: '100%' }}>
        {problem.type === ProblemType.MULTI_CHOICE_SINGLE_ANSWER && (
          <RadioGroup
            aria-labelledby="demo-customized-radios"
            name="customized-radios"
            value={selectedIdx.toString()}
            onChange={(e) => {
              if (isFrozen) return;
              onResponseUpdate({ singleOptionIdx: +e.target.value });
            }}
          >
            {problem.options?.map((option, optionIdx) => (
              <FormControlLabel
                key={optionIdx}
                value={optionIdx.toString()}
                control={<BpRadio />}
                className={getClassNames(
                  selectedIdx === optionIdx,
                  isFrozen,
                  problem.options[optionIdx].shouldSelect
                )}
                label={
                  <Box display="inline">
                    {option.value.outerHTML
                      ? mmtHTMLToReact(option.value.outerHTML)
                      : option.value.textContent}
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        )}

        {problem.type === ProblemType.MULTI_CHOICE_MULTI_ANSWER && (
          <>
            {problem.options?.map((option, optionIdx) => (
              <FormControlLabel
                key={optionIdx}
                className={getClassNames(
                  multipleOptionIdxs[optionIdx] ?? false,
                  isFrozen,
                  problem.options[optionIdx].shouldSelect
                )}
                control={
                  <Checkbox
                    checked={multipleOptionIdxs[optionIdx] ?? false}
                    onChange={(e) => {
                      if (isFrozen) return;
                      multipleOptionIdxs[optionIdx] = e.target.checked;
                      onResponseUpdate({
                        multipleOptionIdxs: { ...multipleOptionIdxs },
                      });
                    }}
                  />
                }
                label={
                  <Box display="inline">
                    {option.value.outerHTML
                      ? mmtHTMLToReact(option.value.outerHTML)
                      : option.value.textContent}
                  </Box>
                }
              />
            ))}
          </>
        )}
        {problem.type === ProblemType.FILL_IN && (
          <TextField
            label="Answer"
            value={filledInAnswer}
            onChange={(e) => {
              if (isFrozen) return;
              onResponseUpdate({ filledInAnswer: e.target.value });
            }}
            variant="outlined"
            fullWidth
          />
        )}
      </FormControl>
      <br />
      <br />

      {isFrozen && problem.fillInSolution && (
        <>
          {getCorrectness(problem, { filledInAnswer }) === Tristate.TRUE ? (
            <b style={{ fontSize: '20px', color: 'green' }}>Correct!</b>
          ) : (
            <span style={{ fontSize: '20px', color: 'red' }}>
              The correct answer is <b>{problem.fillInSolution}</b>
            </span>
          )}
        </>
      )}
      {isFrozen && feedback && (
        <Box
          display="block"
          padding="3px 10px"
          bgcolor={
            problem.options[selectedIdx].shouldSelect ? '#a3e9a0' : '#f39797'
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
