import {
  Box,
  Card,
  Checkbox,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio, { RadioProps } from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import {
  CustomItemsContext,
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';
import styles from '../styles/quiz.module.scss';
import { Problem, ProblemType, Tristate, UserResponse } from '@stex-react/api';
import { getPoints, getAllOptionSets } from '@stex-react/quiz-utils';
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

function getDropdownClassNames(
  isSelected: boolean,
  isFrozen: boolean,
  correctness: Tristate
) {
  if (!isFrozen || correctness === Tristate.UNKNOWN) return '';

  if (correctness === Tristate.TRUE) {
    const style =
      styles['correct'] +
      ' ' +
      (isSelected ? styles['got_right'] : styles['missed']);
    return style;
  } else if (isSelected) {
    return styles['incorrect'];
  }
  return '';
}

function ScbFeedback({
  problem,
  selectedIdxs,
}: {
  problem: Problem;
  selectedIdxs?: number[];
}) {
  if (
    problem.type !== ProblemType.MULTI_CHOICE_SINGLE_ANSWER ||
    !selectedIdxs.length
  ) {
    return null;
  }

  return selectedIdxs.map((selectedIdx, choiceBlockIdx) => {
    const optionSet = getAllOptionSets(problem)[choiceBlockIdx];
    const feedbackHtml = optionSet[selectedIdx]?.feedbackHtml ?? '';
    const isCorrect = optionSet[selectedIdx]?.shouldSelect === Tristate.TRUE;
    if (!feedbackHtml) return null;
    return (
      <Box
        key={choiceBlockIdx}
        display="block"
        padding="3px 10px"
        mb="5px"
        bgcolor={isCorrect ? '#a3e9a0' : '#f39797'}
        borderRadius="10px"
      >
        <span
          style={{ display: 'inline', textAlign: 'center', fontSize: '20px' }}
        >
          {mmtHTMLToReact(feedbackHtml || 'this')}
        </span>
      </Box>
    );
  });
}

export function PointsInfo({ points }: { points: number }) {
  return (
    <Typography
      variant="h6"
      sx={{ display: 'flex', justifyContent: 'flex-end' }}
    >
      <b>{points} pt</b>
    </Typography>
  );
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
    singleOptionIdxs: selectedIdxs,
    multipleOptionIdxs,
    filledInAnswer,
  } = response;
  if (!problem) return <CircularProgress />;

  const lastSelectedIdx = selectedIdxs?.[selectedIdxs?.length - 1];

  const items = Object.assign(
    (problem.inlineOptionSets || []).map((options, optIdx) => (
      <Select
        key={optIdx}
        name="customized-radios"
        value={selectedIdxs[optIdx]?.toString() ?? '-1'}
        onChange={(e) => {
          if (isFrozen) return;
          selectedIdxs[optIdx] = +e.target.value;
          onResponseUpdate({ singleOptionIdxs: selectedIdxs });
        }}
      >
        <MenuItem key="-1" value={'-1'} disabled={true}>
          Choose
        </MenuItem>
        {options?.map((option, optionIdx) => (
          <MenuItem key={optionIdx} value={optionIdx.toString()}>
            <Box
              display="inline"
              className={getDropdownClassNames(
                selectedIdxs[optIdx] === optionIdx,
                isFrozen,
                options[optionIdx].shouldSelect
              )}
            >
              {option.value.outerHTML
                ? mmtHTMLToReact(option.value.outerHTML)
                : option.value.textContent}
            </Box>
          </MenuItem>
        ))}
      </Select>
    ))
  );

  return (
    <Card
      sx={{
        backgroundColor: 'hsl(210, 20%, 95%)',
        border: '1px solid #CCC',
        p: '10px',
        userSelect: 'none',
      }}
    >
      <Box display="inline" fontSize="20px">
        <PointsInfo points={problem.points} />
        <CustomItemsContext.Provider value={{ items }}>
          <Box display="inline">
            {mmtHTMLToReact(problem.statement.outerHTML || '')}
          </Box>
        </CustomItemsContext.Provider>
      </Box>
      <br />
      <FormControl sx={{ width: '100%' }}>
        {problem.type === ProblemType.MULTI_CHOICE_SINGLE_ANSWER &&
          !!problem.options?.length && (
            <RadioGroup
              name="customized-radios"
              value={lastSelectedIdx?.toString() ?? '-1'}
              onChange={(e) => {
                if (isFrozen) return;
                const lastBlockIdx = selectedIdxs.length - 1;
                selectedIdxs[lastBlockIdx] = +e.target.value;
                onResponseUpdate({ singleOptionIdxs: selectedIdxs });
              }}
            >
              {problem.options?.map((option, optionIdx) => (
                <FormControlLabel
                  key={optionIdx}
                  value={optionIdx.toString()}
                  control={<BpRadio />}
                  className={getClassNames(
                    lastSelectedIdx === optionIdx,
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
          {getPoints(problem, { filledInAnswer }) === problem.points ? (
            <b style={{ fontSize: '20px', color: 'green' }}>Correct!</b>
          ) : (
            <span style={{ fontSize: '20px', color: 'red' }}>
              The correct answer is <b>{problem.fillInSolution}</b>
            </span>
          )}
        </>
      )}
      {isFrozen && (
        <ScbFeedback problem={problem} selectedIdxs={selectedIdxs} />
      )}
    </Card>
  );
}
