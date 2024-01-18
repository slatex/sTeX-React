import CancelIcon from '@mui/icons-material/Cancel';
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio, { RadioProps } from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import {
  FillInAnswerClass,
  Input,
  InputResponse,
  InputType,
  Problem,
  ProblemResponse,
  QuadState,
  Tristate,
} from '@stex-react/api';
import {
  getFillInFeedbackHtml,
  isFillInInputCorrect,
  removeAnswerInfo,
} from '@stex-react/quiz-utils';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/router';
import { DocumentWidthSetter } from './DocumentWidthSetter';
import { getLocaleObject } from './lang/utils';
import {
  CustomItemsContext,
  NoMaxWidthTooltip,
  mmtHTMLToReact,
} from './mmtParser';
import styles from './quiz.module.scss';

function BpRadio(props: RadioProps) {
  return <Radio disableRipple color="default" {...props} />;
}

function removeInfoIfNeeded(sHtml: string, isFrozen: boolean) {
  return isFrozen ? sHtml : removeAnswerInfo(sHtml);
}

function getClassNames(
  isSelected: boolean,
  isFrozen: boolean,
  correctness: QuadState
) {
  const shouldSelect = correctness === QuadState.TRUE;
  const shouldNotSelect = correctness === QuadState.FALSE;
  const toBeIgnored = correctness === QuadState.ANY;
  const relevant = isSelected || (isFrozen && !isSelected && shouldSelect);

  const styleList = ['option'];
  styleList.push(relevant ? 'option_relevant' : 'option_not_relevant');

  if (isFrozen) {
    if (shouldSelect) {
      styleList.push('should_select');
      styleList.push(isSelected ? 'got_right' : 'got_wrong');
    } else if (shouldNotSelect) {
      if (isSelected) {
        styleList.push('should_not_select');
        styleList.push('got_wrong');
      }
    } else if (toBeIgnored) {
      styleList.push('to_be_ignored');
    }
  } else {
    if (isSelected) styleList.push('option_unsubmitted_selected');
  }

  // console.log(style);
  return styleList.map((s) => styles[s]).join(' ');
}

function getDropdownClassNames(
  isSelected: boolean,
  isFrozen: boolean,
  correctness: QuadState
) {
  if (!isFrozen || correctness === QuadState.UNKNOWN) return '';

  if (correctness === QuadState.TRUE) {
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
  const expected = input.fillInAnswerClasses;
  if (!expected) return { isCorrect: Tristate.UNKNOWN, feedbackHtml: '' };
  const actual = response.filledInAnswer;
  const isCorrect = isFillInInputCorrect(expected, actual) === Tristate.TRUE;
  const feedbackHtml = getFillInFeedbackHtml(input, actual);
  return {
    isCorrect: isCorrect ? Tristate.TRUE : Tristate.FALSE,
    feedbackHtml,
  };
}

function quadStateToTristate(qs: QuadState) {
  switch (qs) {
    case QuadState.TRUE:
    case QuadState.ANY:
      return Tristate.TRUE;
    case QuadState.FALSE:
      return Tristate.FALSE;
    default:
      return Tristate.UNKNOWN;
  }
}

function scbFeedback(input: Input, response: InputResponse) {
  const { singleOptionIdx } = response;
  const chosen = (input.options || []).find(
    (o) => o.optionId === singleOptionIdx
  );
  if (!chosen) return { isCorrect: Tristate.FALSE, feedbackHtml: 'Wrong!' };
  const isCorrect: Tristate = quadStateToTristate(chosen.shouldSelect);
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
  info?: { isCorrect: Tristate; feedbackHtml: string };
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
      {isCorrect === Tristate.TRUE ? (
        <CheckCircleIcon htmlColor="green" />
      ) : (
        <CancelIcon htmlColor="red" />
      )}
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
            {(input.options || []).map(({ optionId, value, shouldSelect }) => (
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
                    ? mmtHTMLToReact(
                        removeInfoIfNeeded(value.outerHTML, isFrozen)
                      )
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
            {(input.options || []).map(({ optionId, shouldSelect, value }) => (
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
                      ? mmtHTMLToReact(
                          removeInfoIfNeeded(value.outerHTML, isFrozen)
                        )
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
    const setColor = isFrozen && input.fillInAnswerClasses;
    const color = setColor ? (info?.isCorrect ? 'green' : 'red') : undefined;
    return (
      <Box display="inline-flex" alignItems="center">
        <TextField
          label="Answer"
          value={response.filledInAnswer}
          onChange={(e) =>
            onUpdate({
              type: InputType.FILL_IN,
              filledInAnswer: e.target.value,
            } as InputResponse)
          }
          disabled={isFrozen}
          sx={{ color, minWidth: '250px' }}
          variant="outlined"
        />
        <FeedbackDisplay inline={true} info={info} />
      </Box>
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
                  if (!response.multipleOptionIdxs) {
                    console.error('Error: multipleOptionIdxs is undefined');
                    response.multipleOptionIdxs = {};
                  }
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
                  ? mmtHTMLToReact(
                      removeInfoIfNeeded(value.outerHTML, isFrozen)
                    )
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

function getParameters(type: string, input: FillInAnswerClass) {
  switch (type) {
    case 'numrange':
      return `${input.startNum} - ${input.endNum}`;
    case 'regex':
      return input.regex || '';
    case 'exact':
      return input.exactMatch || '';
    default:
      return 'Unhandled Case';
  }
}

function FillInTable({ fillInInputs }: { fillInInputs: Input[] }) {
  const tableRows = fillInInputs.map(
    (fillInInput: Input, fillInIndex: number) => {
      return fillInInput.fillInAnswerClasses?.map(
        (input: FillInAnswerClass, index: number) => (
          <TableRow key={`${fillInIndex}-${index}`}>
            <TableCell>{input?.type}</TableCell>
            <TableCell>{getParameters(input?.type, input)}</TableCell>
            <TableCell>{mmtHTMLToReact(input?.feedbackHtml || '')}</TableCell>
            <TableCell>{input?.verdict.toString()}</TableCell>
          </TableRow>
        )
      );
    }
  );
  const tHeadStyle = { minWidth: '60px', fontWeight: 'bold' };
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={tHeadStyle}>Match Type</TableCell>
            <TableCell sx={tHeadStyle}>Parameter</TableCell>
            <TableCell sx={tHeadStyle}>Feedback</TableCell>
            <TableCell sx={tHeadStyle}>Verdict</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </TableContainer>
  );
}

export function ProblemDisplay({
  problem,
  isFrozen,
  r,
  showPoints = true,
  onResponseUpdate,
  onFreezeResponse,
}: {
  problem: Problem | undefined;
  isFrozen: boolean;
  r: ProblemResponse;
  showPoints?: boolean;
  onResponseUpdate: (r: ProblemResponse) => void;
  onFreezeResponse?: () => void;
}) {
  const t = getLocaleObject(useRouter()).quiz;
  if (!problem) return <CircularProgress />;
  const isEffectivelyFrozen = isFrozen || !problem.inputs?.length;
  const fillInInputs =
    problem.inputs?.filter((input) => input.type === InputType.FILL_IN) || [];
  const inputWidgets = problem.inputs.map((input, optIdx) => {
    return inputDisplay({
      input,
      response: r.responses[optIdx],
      isFrozen,
      onUpdate: (resp) => {
        if (isFrozen) return;
        r.responses[optIdx] = resp;
        onResponseUpdate({ ...r });
      },
    });
  });
  const customItems = Object.assign(inputWidgets);
  const statement = removeInfoIfNeeded(
    problem.statement.outerHTML ?? '',
    isEffectivelyFrozen
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
      <Box fontSize="20px">
        {showPoints && <PointsInfo points={problem.points} />}
        <CustomItemsContext.Provider value={{ items: customItems }}>
          <DocumentWidthSetter>{mmtHTMLToReact(statement)}</DocumentWidthSetter>
        </CustomItemsContext.Provider>
        {problem.debug && fillInInputs.length > 0 && (
          <FillInTable fillInInputs={fillInInputs} />
        )}
        {onFreezeResponse && !isEffectivelyFrozen && (
          <Button onClick={() => onFreezeResponse()} variant="contained">
            {t.checkSolution}
          </Button>
        )}
      </Box>
    </Card>
  );
}
