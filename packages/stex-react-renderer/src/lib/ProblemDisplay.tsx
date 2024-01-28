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
  BloomDimension,
  FillInAnswerClass,
  FillInAnswerClassType,
  Input,
  InputResponse,
  InputType,
  Option,
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
import { getMMTHtml } from './CompetencyTable';
import { DocumentWidthSetter } from './DocumentWidthSetter';
import { DimIcon } from './SelfAssessmentDialog';
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

function DebugMCQandSCQ({
  feedbackHtml,
  shouldSelect,
}: {
  feedbackHtml: string;
  shouldSelect: QuadState;
}) {
  const textColor = getQuadStateColor(shouldSelect);
  return (
    <Box
      sx={{
        color: textColor,
        border: `2px solid ${textColor}`,
        margin: '-10px 10px 10px 10px',
        p: '10px',
        borderRadius: '5px',
      }}
    >
      {mmtHTMLToReact(feedbackHtml)}
    </Box>
  );
}

function inputDisplay({
  input,
  response,
  isFrozen,
  onUpdate,
  debug,
}: {
  input: Input;
  response: InputResponse;
  isFrozen: boolean;
  onUpdate: (value: InputResponse) => void;
  debug: boolean;
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
            {(input.options || []).map(
              ({ optionId, shouldSelect, value, feedbackHtml }) => (
                <>
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
                  {debug && (
                    <DebugMCQandSCQ
                      feedbackHtml={feedbackHtml}
                      shouldSelect={shouldSelect}
                    />
                  )}
                </>
              )
            )}
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
        {input.options?.map(
          ({ optionId, value, shouldSelect, feedbackHtml }) => (
            <>
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
              {debug && (
                <DebugMCQandSCQ
                  feedbackHtml={feedbackHtml}
                  shouldSelect={shouldSelect}
                />
              )}
            </>
          )
        )}
        <FeedbackDisplay inline={inline} info={info} />
      </Box>
    );
  }
}

function getParameters(type: FillInAnswerClassType, input: FillInAnswerClass) {
  switch (type) {
    case FillInAnswerClassType.numrange:
      return `${input.startNum} - ${input.endNum}`;
    case FillInAnswerClassType.regex:
      return input.regex || '';
    case FillInAnswerClassType.exact:
      return input.exactMatch || '';
    default:
      return 'Unhandled Case';
  }
}

function AnswerClassesTable({
  fillInAnswerClass,
}: {
  fillInAnswerClass: FillInAnswerClass[];
}) {
  const tableRows = fillInAnswerClass.map(
    (input: FillInAnswerClass, index: number) => (
      <TableRow key={index}>
        <TableCell>{input?.type}</TableCell>
        <TableCell>{getParameters(input?.type, input)}</TableCell>
        <TableCell>{mmtHTMLToReact(input?.feedbackHtml || '')}</TableCell>
        <TableCell>{input?.verdict?.toString()}</TableCell>
      </TableRow>
    )
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
const getQuadStateColor = (shouldSelect: QuadState) => {
  switch (shouldSelect) {
    case QuadState.TRUE:
      return 'green';

    case QuadState.FALSE:
      return 'red';

    case QuadState.UNKNOWN:
      return 'gray';

    default:
      return 'orange';
  }
};
function InlineScqTable({ options }: { options: Option[] }) {
  const tableRows = options.map(({ value, feedbackHtml, shouldSelect }) => (
    <TableRow>
      <TableCell>{mmtHTMLToReact(value.outerHTML)}</TableCell>
      <TableCell sx={{ color: getQuadStateColor(shouldSelect) }}>
        {mmtHTMLToReact(feedbackHtml)}
      </TableCell>
    </TableRow>
  ));
  const tHeadStyle = { minWidth: '60px', fontWeight: 'bold' };
  return (
    <TableContainer component={Paper} sx={{ marginBottom: '10px' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2} align="center" sx={{ fontWeight: 'bold' }}>
              For inline SCC
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={tHeadStyle}>Options</TableCell>
            <TableCell sx={tHeadStyle}>Feedback</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </TableContainer>
  );
}
function toBloomDimension(key: string): BloomDimension {
  for (const dim of Object.values(BloomDimension)) {
    if (dim.toLowerCase() === key.toLowerCase()) return dim;
  }
  throw new Error(`Invalid BloomDimension value: ${key}`);
}

function getBloomDimesionAndUriList(data: string) {
  return data.split(',').map((dimAndURI) => {
    const [key, value] = dimAndURI.split(':');
    const dim = toBloomDimension(key);
    const uri = decodeURIComponent(value);
    return [dim, uri] as [BloomDimension, string];
  });
}

function groupingByBloomDimension(data?: string) {
  const groupedData: Record<BloomDimension, string[]> = Object.assign(
    {},
    ...Object.values(BloomDimension).map((dim) => ({ [dim]: [] }))
  );
  if (!data) return groupedData;
  const dimAndURIList = getBloomDimesionAndUriList(data);
  for (const [dim, uri] of dimAndURIList) {
    groupedData[dim].push(uri);
  }
  return groupedData;
}

function DimAndURIListDisplay({
  title,
  data,
}: {
  title: string;
  data?: string;
}) {
  const groupedData = groupingByBloomDimension(data);
  return (
    <Box border="1px solid black" mb="10px" bgcolor="white">
      <Typography fontWeight="bold" sx={{ p: '10px' }}>
        {title}&nbsp;
      </Typography>
      {Object.values(BloomDimension).map((dim) =>
        groupedData[dim].length ? (
          <Box
            key={dim}
            borderTop="1px solid #AAA"
            p="5px"
            display="flex"
            flexWrap="wrap"
          >
            <DimIcon dim={dim} />
            &nbsp;
            {groupedData[dim]?.map((uri, index) => (
              <span key={index}>
                {mmtHTMLToReact(getMMTHtml(uri))}
                {index < groupedData[dim].length - 1 ? ',\xa0' : ''}
              </span>
            ))}
          </Box>
        ) : null
      )}
    </Box>
  );
}

export function ProblemDisplay({
  problem,
  isFrozen,
  r,
  showPoints = true,
  onResponseUpdate,
  onFreezeResponse,
  debug = false,
}: {
  problem: Problem | undefined;
  isFrozen: boolean;
  r: ProblemResponse;
  showPoints?: boolean;
  onResponseUpdate: (r: ProblemResponse) => void;
  onFreezeResponse?: () => void;
  debug?: boolean;
}) {
  const t = getLocaleObject(useRouter()).quiz;
  if (!problem) return <CircularProgress />;
  const isEffectivelyFrozen = isFrozen || !problem.inputs?.length;
  const fillInInputs =
    problem.inputs?.filter((input) => input.type === InputType.FILL_IN) || [];
  const inlineSCQInputs =
    problem.inputs?.filter(
      (input) => input.type === InputType.SCQ && input.inline
    ) || [];
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
      debug: debug,
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
        {debug && (
          <>
            {inlineSCQInputs.map((inlineInput) => (
              <InlineScqTable options={inlineInput?.options || []} />
            ))}
            {(fillInInputs || []).map((fillInInput) => (
              <AnswerClassesTable
                fillInAnswerClass={fillInInput?.fillInAnswerClasses || []}
              />
            ))}
            <DimAndURIListDisplay
              title="Objectives"
              data={problem.objectives}
            />
            <DimAndURIListDisplay
              title="Preconditions"
              data={problem.preconditions}
            />
          </>
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
