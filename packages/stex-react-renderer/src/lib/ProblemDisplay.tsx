import { Visibility } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Button, Card, CircularProgress, IconButton, Typography } from '@mui/material';
import {
  AnswerUpdateEntry,
  BloomDimension,
  CognitiveDimension,
  FTMLProblemWithSolution,
  ProblemAnswerEvent,
  SymbolURI,
  UserInfo,
  createAnswer,
  getUserInfo,
  postAnswerToLMP,
} from '@stex-react/api';
import { FTMLFragment, ProblemResponse, ProblemState, Solutions } from '@stex-react/ftml-utils';
import { getPoints } from '@stex-react/quiz-utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DimIcon } from './SelfAssessmentDialog';

export function PointsInfo({ points }: { points: number | undefined }) {
  return (
    <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <b>{points ?? 1} pt</b>
    </Typography>
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
          {/*mmtHTMLToReact(getMMTHtml(uri))*/}
          TODO ALEA-4
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

function getUpdates(objectives: [CognitiveDimension, SymbolURI][] | undefined, quotient: number) {
  if (!objectives) return [];
  const dimensionAndURI = objectives.map(([dim, uri]) => `${dim}:${uri}`);
  return transformData(dimensionAndURI, quotient);
}

function handleSubmit(
  problem: FTMLProblemWithSolution,
  uri: string,
  response: ProblemResponse,
  userId: string
) {
  const maxPoint = problem.problem?.total_points ?? 1;
  const points = getPoints(problem, response);
  const quotient = points ? points / maxPoint : 0;
  const updates: AnswerUpdateEntry[] = getUpdates(problem.problem.objectives, quotient);
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
  postAnswerToLMP(answerObject);
}

function getProblemState(
  isFrozen: boolean,
  solution?: string,
  current_response?: ProblemResponse
): ProblemState {
  if (!isFrozen) return { type: 'Interactive', current_response };
  if (!solution || !current_response) return { type: 'Finished', current_response };
  const feedback = Solutions.from_jstring(solution)?.check_response(current_response);
  if (!feedback) return { type: 'Finished', current_response }; // Something went wrong!!
  return { type: 'Graded', feedback: feedback.to_json() };
}

export function ProblemViewer({
  problem,
  onResponseUpdate,
  isFrozen,
  r,
}: {
  problem: FTMLProblemWithSolution;
  onResponseUpdate?: (response: ProblemResponse) => void;
  isFrozen: boolean;
  r?: ProblemResponse;
}) {
  const problemState = getProblemState(isFrozen, problem.solution, r);
  const { html, uri } = problem.problem;

  return (
    <FTMLFragment
      key={uri}
      fragment={{ html, uri }}
      problemStates={new Map([[uri, problemState]])}
      onProblem={(response) => {
        onResponseUpdate?.(response);
      }}
    />
  );
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
        border: '1px solid #CCC',
        p: '10px',
        userSelect: 'none',
      }}
    >
      <Box fontSize="20px">
        {showPoints && <PointsInfo points={problem.problem.total_points} />}

        <ProblemViewer
          problem={problem}
          isFrozen={isEffectivelyFrozen}
          r={r}
          onResponseUpdate={onResponseUpdate}
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
