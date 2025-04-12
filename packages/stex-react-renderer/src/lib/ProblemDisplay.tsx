import { Visibility } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Button, Card, CircularProgress, IconButton, Typography } from '@mui/material';
import {
  AnswerUpdateEntry,
  AutogradableResponse,
  BloomDimension,
  FTMLProblemWithSolution,
  Input,
  InputType,
  ProblemAnswerEvent,
  QuadState,
  Tristate,
  UserInfo,
  createAnswer,
  getUserInfo,
  postAnswer,
} from '@stex-react/api';
import { FTMLFragment, ProblemResponse } from '@stex-react/ftml-utils';
import { getFillInFeedbackHtml, isFillInInputCorrect } from '@stex-react/quiz-utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getMMTHtml } from './CompetencyTable';
import { NoMaxWidthTooltip, mmtHTMLToReact } from './mmtParser';
import styles from './quiz.module.scss';
import { DimIcon } from './SelfAssessmentDialog';

function getClassNames(isSelected: boolean, isFrozen: boolean, correctness: QuadState) {
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

function getDropdownClassNames(isSelected: boolean, isFrozen: boolean, correctness: QuadState) {
  if (!isFrozen || correctness === QuadState.UNKNOWN) return '';

  if (correctness === QuadState.TRUE) {
    const style = styles['correct'] + ' ' + (isSelected ? styles['got_right'] : styles['missed']);
    return style;
  } else if (isSelected) {
    return styles['incorrect'];
  }
  return '';
}

function fillInFeedback(input: Input, response?: AutogradableResponse) {
  if (input.ignoreForScoring) {
    return {
      isCorrect: Tristate.TRUE,
      feedbackHtml: 'Your response to this input will not be graded.',
    };
  }
  const expected = input.fillInAnswerClasses;
  if (!expected) return { isCorrect: Tristate.UNKNOWN, feedbackHtml: '' };
  const actual = response?.filledInAnswer;
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

function scbFeedback(input: Input, response?: AutogradableResponse) {
  if (input.ignoreForScoring) {
    return {
      isCorrect: Tristate.TRUE,
      feedbackHtml: 'Your response to this input will not be graded.',
    };
  }
  const chosen = (input.options || []).find((o) => o.optionId === response?.singleOptionIdx);
  if (!chosen) return { isCorrect: Tristate.FALSE, feedbackHtml: 'Wrong!' };
  const isCorrect: Tristate = quadStateToTristate(chosen.shouldSelect);
  if (isCorrect === Tristate.UNKNOWN) return { isCorrect, feedbackHtml: '' };
  let feedbackHtml = chosen?.feedbackHtml;
  if (chosen && !feedbackHtml?.length)
    feedbackHtml = isCorrect === Tristate.TRUE ? 'Correct!' : 'Wrong!';
  return { isCorrect, feedbackHtml };
}

function feedbackInfo(isFrozen: boolean, input: Input, response?: AutogradableResponse) {
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

export function PointsInfo({ points }: { points: number | undefined }) {
  return (
    <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <b>{points?? 1} pt</b>
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
      <span style={{ display: 'inline', textAlign: 'center', fontSize: '20px' }}>
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
    <NoMaxWidthTooltip title={<DirectFeedback isCorrect={isCorrect} feedbackHtml={feedbackHtml} />}>
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

function toBloomDimension(key: string): BloomDimension {
  const key_lc = key.toLowerCase();
  if (key_lc === 'analyze') return BloomDimension.Analyse;
  for (const dim of Object.values(BloomDimension)) {
    if (dim.toLowerCase() === key_lc) return dim;
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
interface URIListDisplayProps {
  uris?: string[];
  displayReverseRelation?: (conceptUri: string) => void;
}
export function URIListDisplay({ uris, displayReverseRelation }: URIListDisplayProps) {
  const handleCopy = (uri: string) => {
    navigator.clipboard.writeText(uri).then(
      () => alert(`Copied: ${uri}`),
      (err) => console.error('Failed to copy:', err)
    );
  };

  return (
    <Box>
      {uris?.map((uri, index, array) => (
        <span key={index}>
          {mmtHTMLToReact(getMMTHtml(uri))}
          <IconButton
            size="small"
            onClick={() => handleCopy(uri)}
            aria-label="copy"
            style={{ marginLeft: '5px' }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          {displayReverseRelation && (
            <IconButton
              size="small"
              onClick={() => displayReverseRelation(uri)}
              aria-label="mirror"
              style={{ marginLeft: '5px' }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          )}

          {index < array.length - 1 ? ',\xa0' : ''}
        </span>
      ))}
    </Box>
  );
}

export function DimAndURIListDisplay({
  title,
  data,
  displayReverseRelation,
}: {
  title: string;
  data?: string;
  displayReverseRelation?: (conceptUri: string) => void;
}) {
  const transformedData = groupingByBloomDimension(data);
  return (
    <Box border="1px solid black" mb="10px" bgcolor="white">
      <Typography fontWeight="bold" sx={{ p: '10px' }}>
        {title}&nbsp;
      </Typography>
      {Object.entries(transformedData)
        .filter(([_, uris]) => uris.length > 0)
        .map(([group, uris]) => (
          <Box key={group} borderTop="1px solid #AAA" p="5px" display="flex" flexWrap="wrap">
            <DimIcon dim={group as BloomDimension} /> &nbsp;
            <URIListDisplay uris={uris} displayReverseRelation={displayReverseRelation} />
          </Box>
        ))}
    </Box>
  );
}

function transformData(dimensionAndURI: string[], quotient: number): AnswerUpdateEntry[] {
  const conceptUpdate: { [url: string]: AnswerUpdateEntry } = {};

  dimensionAndURI.forEach((item) => {
    const [dimension, uri] = item.split(':');
    const url = decodeURIComponent(uri);
    if (!conceptUpdate[url]) {
      conceptUpdate[url] = {
        concept: url,
        dimensions: [],
        quotient,
      };
    }
    if (!conceptUpdate[url].dimensions.includes(dimension)) {
      conceptUpdate[url].dimensions.push(dimension);
    }
  });
  return Object.values(conceptUpdate);
}

function getUpdates(objectives: string, quotient: number) {
  const dimensionAndURI = objectives.split(',');
  return transformData(dimensionAndURI, quotient);
}

function handleSubmit(
  problem: FTMLProblemWithSolution,
  uri: string,
  response: ProblemResponse,
  userId: string
) {
  const maxPoint = 1; // problem.points; TODO alea4
  const points = 0; // getPoints(problem, response);
  const quotient = points ? points / maxPoint : 0;
  const updates: AnswerUpdateEntry[] = []; //getUpdates(problem.objectives, quotient);
  const answerObject: ProblemAnswerEvent = {
    type: 'problem-answer',
    uri: uri.substring(0, uri.indexOf('.en')) + '.tex',
    learner: userId,
    score: points,
    'max-points': maxPoint,
    updates: updates,
    time: new Date().toISOString(),
    payload: '',
    comment: ' ',
  };
  postAnswer(answerObject);
}

export function ProblemDisplay({
  uri,
  problem,
  isFrozen,
  r,
  showPoints = true,
  onResponseUpdate,
  onFreezeResponse,
  debug,
}: {
  uri?: string;
  problem: FTMLProblemWithSolution | undefined;
  isFrozen: boolean;
  r?: ProblemResponse;
  showPoints?: boolean;
  showUnansweredProblems?: boolean;
  onResponseUpdate?: (r: ProblemResponse) => void;
  onFreezeResponse?: () => void;
  debug?: boolean;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  useEffect(() => {
    getUserInfo().then((u: UserInfo | undefined) => {
      if (u) {
        setUserId(u.userId as string);
      }
    });
  }, []);
  if (!problem) return <CircularProgress />;
  const isEffectivelyFrozen = isFrozen;

  async function saveAnswers({
    problemId,
    uri,
    freeTextResponses,
  }: {
    problemId: string;
    uri?: string;
    freeTextResponses: Record<string, string>;
  }) {
    try {
      const promises = Object.keys(freeTextResponses).map((idx) =>
        createAnswer({
          answer: freeTextResponses[idx],
          questionId: uri ? uri : problemId,
          questionTitle: router.query?.title as string,
          subProblemId: idx,
          courseId: router.query.courseId as string,
        })
      );
      await Promise.all(promises);
      console.log('All answers saved successfully!');
    } catch (error) {
      console.error('Error saving answers:', error);
      alert('Failed to save answers. Please try again.');
    }
  }

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
        {showPoints && <PointsInfo points={problem.problem.total_points} />}

        <FTMLFragment
          key={problem.problem.uri}
          fragment={{ html: problem.problem.html }}
          problems={(response) => {
            //if (isFrozen || !response) return;
            console.log(JSON.stringify(response));
            //r.autogradableResponses[optIdx] = resp;
            //onResponseUpdate?.({ ...r });
          }}
        />

        {onFreezeResponse && !isEffectivelyFrozen && r && (
          <Button
            onClick={() => {
              onFreezeResponse();
              if (uri) handleSubmit(problem, uri, r, userId);
            }}
            variant="contained"
          >
            Submit
          </Button>
        )}
      </Box>
    </Card>
  );
}
