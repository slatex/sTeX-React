import InfoIcon from '@mui/icons-material/Info';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio, { RadioProps } from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import {
  Input,
  InputResponse,
  InputType,
  Problem,
  ProblemResponse,
  Tristate,
} from '@stex-react/api';
import { isFillInInputCorrect } from '@stex-react/quiz-utils';
import {
  CustomItemsContext,
  DocumentWidthSetter,
  NoMaxWidthTooltip,
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';
import styles from '../styles/quiz.module.scss';

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

function fillInFeedback(input: Input, response: InputResponse) {
  const expected = input.fillInSolution;
  if (!expected) return { isCorrect: Tristate.UNKNOWN, feedbackHtml: '' };
  const actual = response.filledInAnswer;
  const isCorrect = isFillInInputCorrect(expected, actual);
  const feedbackHtml = isCorrect
    ? 'Correct!'
    : `The correct answer is <b><code>${expected}</code></b>`;
  return {
    isCorrect: isCorrect ? Tristate.TRUE : Tristate.FALSE,
    feedbackHtml,
  };
}

function scbFeedback(input: Input, response: InputResponse) {
  const { singleOptionIdx } = response;
  const chosen = input.options.find((o) => o.optionId === singleOptionIdx);
  if (!chosen) return { isCorrect: Tristate.FALSE, feedbackHtml: 'Wrong!' };
  const isCorrect = chosen.shouldSelect;
  if (isCorrect === Tristate.UNKNOWN) return { isCorrect, feedbackHtml: '' };
  let feedbackHtml = chosen?.feedbackHtml;
  if (chosen && !feedbackHtml?.length)
    feedbackHtml = isCorrect === Tristate.TRUE ? 'Correct!' : 'Wrong!';
  return { isCorrect, feedbackHtml };
}

function feedbackInfo(
  isFrozen: boolean,
  input: Input,
  response: InputResponse
) {
  if (!isFrozen) return undefined;
  switch (input.type) {
    case InputType.FILL_IN:
      return fillInFeedback(input, response);
    case InputType.SCQ:
      return scbFeedback(input, response);
    case InputType.MCQ:
    default:
      return undefined;
  }
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

function DirectFeedback({
  isCorrect,
  feedbackHtml,
}: {
  isCorrect: Tristate;
  feedbackHtml: string;
}) {
  if (isCorrect === Tristate.UNKNOWN) return null;
  return (
    <Box
      display="block"
      padding="3px 10px"
      mb="5px"
      bgcolor={isCorrect === Tristate.TRUE ? '#a3e9a0' : '#f39797'}
      borderRadius="10px"
    >
      <span
        style={{ display: 'inline', textAlign: 'center', fontSize: '20px' }}
      >
        {mmtHTMLToReact(feedbackHtml)}
      </span>
    </Box>
  );
}

function FeedbackDisplay({
  inline,
  info,
}: {
  inline: boolean;
  info: { isCorrect: Tristate; feedbackHtml: string };
}) {
  if (!info) return null;
  const { isCorrect, feedbackHtml } = info;
  if (isCorrect === Tristate.UNKNOWN) return null;
  return inline ? (
    <NoMaxWidthTooltip
      title={
        <DirectFeedback isCorrect={isCorrect} feedbackHtml={feedbackHtml} />
      }
    >
      <InfoIcon />
    </NoMaxWidthTooltip>
  ) : (
    <>
      <DirectFeedback isCorrect={isCorrect} feedbackHtml={feedbackHtml} />
    </>
  );
}

function inputDisplay({
  input,
  response,
  isFrozen,
  onUpdate,
}: {
  input: Input;
  response: InputResponse;
  isFrozen: boolean;
  onUpdate: (value: InputResponse) => void;
}) {
  const { type, inline } = input;
  const info = feedbackInfo(isFrozen, input, response);
  if (type === InputType.SCQ) {
    if (inline) {
      return (
        <>
          <Select
            name="customized-select"
            value={response.singleOptionIdx || '-1'}
            onChange={(e) => {
              onUpdate({
                type: InputType.SCQ,
                singleOptionIdx: e.target.value,
              } as InputResponse);
            }}
          >
            <MenuItem key="-1" value="-1" disabled={true}>
              <i style={{ color: 'gray' }}>Choose</i>
            </MenuItem>
            {input.options.map(({ optionId, value, shouldSelect }) => (
              <MenuItem key={optionId} value={optionId}>
                <Box
                  display="inline"
                  className={getDropdownClassNames(
                    response.singleOptionIdx === optionId,
                    isFrozen,
                    shouldSelect
                  )}
                >
                  {value.outerHTML
                    ? mmtHTMLToReact(value.outerHTML)
                    : value.textContent}
                </Box>
              </MenuItem>
            ))}
          </Select>
          <FeedbackDisplay inline={inline} info={info} />
        </>
      );
    } else {
      return (
        <>
          <RadioGroup
            name="customized-radios"
            value={response.singleOptionIdx ?? ''}
            onChange={(e) => {
              if (isFrozen) return;
              onUpdate({
                type: InputType.SCQ,
                singleOptionIdx: e.target.value,
              } as InputResponse);
            }}
          >
            {input.options.map(({ optionId, shouldSelect, value }) => (
              <FormControlLabel
                key={optionId}
                value={optionId}
                control={<BpRadio />}
                className={getClassNames(
                  response.singleOptionIdx === optionId,
                  isFrozen,
                  shouldSelect
                )}
                label={
                  <Box display="inline">
                    {value.outerHTML
                      ? mmtHTMLToReact(value.outerHTML)
                      : value.textContent}
                  </Box>
                }
              />
            ))}
          </RadioGroup>
          <FeedbackDisplay inline={inline} info={info} />
        </>
      );
    }
  } else if (type === InputType.FILL_IN) {
    const setColor = isFrozen && input.fillInSolution;
    const color = setColor ? (info?.isCorrect ? 'green' : 'red') : undefined;
    return (
      <>
        <TextField
          label="Answer"
          value={response.filledInAnswer}
          onChange={(e) =>
            onUpdate({
              type: InputType.FILL_IN,
              filledInAnswer: e.target.value,
            } as InputResponse)
          }
          sx={{
            color,
            display: inline ? undefined : 'block',
            mb: inline ? undefined : '10px',
          }}
          variant="outlined"
          fullWidth={!inline}
        />
        <FeedbackDisplay inline={inline} info={info} />
      </>
    );
  } else if (type === InputType.MCQ) {
    return (
      <Box display="inline-flex" flexDirection="column" width="100%">
        {input.options?.map(({ optionId, value, shouldSelect }) => (
          <FormControlLabel
            key={optionId}
            className={getClassNames(
              response.multipleOptionIdxs?.[optionId] ?? false,
              isFrozen,
              shouldSelect
            )}
            control={
              <Checkbox
                checked={response.multipleOptionIdxs?.[optionId] ?? false}
                onChange={(e) => {
                  response.multipleOptionIdxs[optionId] = e.target.checked;
                  onUpdate({
                    type: InputType.MCQ,
                    multipleOptionIdxs: response.multipleOptionIdxs,
                  } as InputResponse);
                }}
              />
            }
            label={
              <Box display="inline">
                {value.outerHTML
                  ? mmtHTMLToReact(value.outerHTML)
                  : value.textContent}
              </Box>
            }
          />
        ))}
        <FeedbackDisplay inline={inline} info={info} />
      </Box>
    );
  }
}

export function ProblemDisplay({
  problem,
  isFrozen,
  r,
  onResponseUpdate,
}: {
  problem: Problem | undefined;
  isFrozen: boolean;
  r: ProblemResponse;
  onResponseUpdate: (r: ProblemResponse) => void;
}) {
  if (!problem) return <CircularProgress />;
  const inputWidgets = problem.inputs.map((input, optIdx) => {
    return inputDisplay({
      input,
      response: r.responses[optIdx],
      isFrozen,
      onUpdate: (resp) => {
        r.responses[optIdx] = resp;
        onResponseUpdate(r);
      },
    });
  });
  const customItems = Object.assign(inputWidgets);

  return (
    <Card
      sx={{
        backgroundColor: 'hsl(210, 20%, 95%)',
        border: '1px solid #CCC',
        p: '10px',
        userSelect: 'none',
      }}
    >
      <Box fontSize="20px">
        <PointsInfo points={problem.points} />
        <CustomItemsContext.Provider value={{ items: customItems }}>
          <DocumentWidthSetter>
            {mmtHTMLToReact(problem.statement.outerHTML || '')}
          </DocumentWidthSetter>
        </CustomItemsContext.Provider>
      </Box>
    </Card>
  );
}
