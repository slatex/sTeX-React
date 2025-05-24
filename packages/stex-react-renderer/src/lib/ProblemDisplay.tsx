import { Box, Button, Card, CircularProgress, IconButton, Typography } from '@mui/material';
import {
  AnswerUpdateEntry,
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
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getPoints } from './stex-react-renderer';
import { MystEditor } from '@stex-react/myst';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
export function PointsInfo({ points }: { points: number | undefined }) {
  return (
    <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <b>{points ?? 1} pt</b>
    </Typography>
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

export function getProblemState(
  isFrozen: boolean,
  solution?: string,
  current_response?: ProblemResponse
): ProblemState {
  if (!isFrozen) return { type: 'Interactive', current_response };
  if (!solution) return { type: 'Finished', current_response };
  const sol = Solutions.from_jstring(solution.replace(/^"|"$/g, ''));
  const feedback = current_response
    ? sol?.check_response(current_response)
    : sol?.default_feedback();
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
  const isHaveSubProblems = problem.problem.subProblems != null;
  return (
    <FTMLFragment
      key={uri}
      fragment={{ html, uri }}
      allowHovers={isFrozen}
      problemStates={new Map([[uri, problemState]])}
      onProblem={(response) => {
        onResponseUpdate?.(response);
      }}
      onFragment={(uri, kind) => {
        if (kind.type === 'Problem') {
          return (ch) => (
            <Box>
              {ch}
              <AnswerAccepter
                isHaveSubProblems={isHaveSubProblems}
                isFrozen={isFrozen}
                uri={uri}
              ></AnswerAccepter>
            </Box>
          );
        }
      }}
    />
  );
}

function AnswerAccepter({
  uri,
  isHaveSubProblems,
  isFrozen,
}: {
  uri: string;
  isHaveSubProblems: boolean;
  isFrozen: boolean;
}) {
  const [answer, setAnsewr] = useState('');
  const subId = isHaveSubProblems ? +uri.charAt(uri.length - 1) : 0;
  const router = useRouter();

  async function saveAnswer({
    problemId,
    subId,
    freeTextResponses,
  }: {
    problemId: string;
    subId?: string;
    freeTextResponses: string;
  }) {
    try {
      createAnswer({
        answer: freeTextResponses,
        questionId: uri ? uri : problemId,
        questionTitle: router.query?.title as string,
        subProblemId: subId ?? '',
        courseId: router.query.courseId as string,
      });
      console.log('All answers saved successfully!');
    } catch (error) {
      console.error('Error saving answers:', error);
      alert('Failed to save answers. Please try again.');
    }
  }
  if (isHaveSubProblems && isNaN(subId)) return;
  async function onSaveClick() {
    await saveAnswer({ freeTextResponses: answer, problemId: uri, subId: uri });
  }
  return (
    <Box display="flex" alignItems="flex-start">
      <Box flexGrow={1}>
        <MystEditor
          name={`answer-${Math.random()}`}
          placeholder={'...'}
          value={answer}
          onValueChange={(c) => setAnsewr(c)}
        />
      </Box>
      <IconButton disabled={isFrozen} onClick={onSaveClick} sx={{ ml: 2 }}>
        <SaveIcon />
      </IconButton>
    </Box>
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
}: {
  uri?: string;
  problem: FTMLProblemWithSolution | undefined;
  isFrozen: boolean;
  r?: ProblemResponse;
  showPoints?: boolean;
  onResponseUpdate?: (r: ProblemResponse) => void;
  onFreezeResponse?: () => void;
}) {
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
