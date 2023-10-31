import CancelIcon from '@mui/icons-material/Cancel';
import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
} from '@mui/material';
import {
  Problem,
  TimerEvent,
  TimerEventType,
  UserResponse,
} from '@stex-react/api';
import { getPoints, getAllOptionSets } from '@stex-react/quiz-utils';
import {
  FixedPositionMenu,
  LayoutWithFixedMenu,
} from '@stex-react/stex-react-renderer';
import { shouldUseDrawer } from '@stex-react/utils';
import { useEffect, useReducer, useState } from 'react';
import { ProblemDisplay } from './QuestionDisplay';
import { QuizSubmitConfirm } from './QuizSubmitConfirm';
import { QuizTimer, Timer, timerEvent } from './QuizTimer';
import { getLocaleObject } from '../lang/utils';
import { useRouter } from 'next/router';

function isAnswered(r: UserResponse) {
  return (
    !!r?.filledInAnswer?.length ||
    (r.singleOptionIdxs?.length > 0 &&
      r.singleOptionIdxs.every((o) => (o ?? -1) >= 0)) ||
    Object.values(r?.multipleOptionIdxs ?? {}).some((v) => v === true)
  );
}

function roundedScore(points: { [problemId: string]: number | undefined }) {
  const score = Object.values(points).reduce((prev, s) => prev + (s ?? 0), 0);
  return (Math.round(score * 100) / 100).toString();
}

function IndexEntry({
  response,
  points,
  idx,
  selectedIdx,
  isFrozen,
  events,
  showClock,
  onSelect,
}: {
  response: UserResponse;
  points: number | undefined;
  idx: number;
  selectedIdx: number;
  isFrozen: boolean;
  events: TimerEvent[];
  showClock: boolean;
  onSelect: (idx: number) => void;
}) {
  const { quiz: t } = getLocaleObject(useRouter());
  const isCorrectnessKnown = isFrozen && points !== undefined;
  // TODO: support problem score.
  const isCorrect = points > 0;
  const answered = isAnswered(response);
  return (
    <span
      key={idx}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: idx === selectedIdx ? 'bold' : undefined,
        fontSize: '20px',
        cursor: 'pointer',
        color: isCorrectnessKnown ? (isCorrect ? 'green' : 'red') : '#333',
        margin: '8px',
      }}
      onClick={() => onSelect(idx)}
    >
      <Box display="flex" alignItems="center">
        {isFrozen ? (
          <span style={{ width: '24px' }}></span>
        ) : answered ? (
          <CheckBox />
        ) : (
          <CheckBoxOutlineBlankIcon />
        )}
        <span>
          &nbsp;{t.problem} {idx + 1}&nbsp;
        </span>
        {isCorrectnessKnown &&
          (isCorrect ? <CheckCircleIcon /> : <CancelIcon />)}
      </Box>
      {showClock && (
        <Box fontSize="12px">
          <Timer events={events} problemIndex={idx} />
        </Box>
      )}
    </span>
  );
}

function ProblemNavigation({
  responses,
  points,
  problemIdx,
  isFrozen,
  showClock,
  events,
  onClose,
  onSelect,
}: {
  responses: { [problemId: string]: UserResponse };
  points: { [problemId: string]: number | undefined };
  problemIdx: number;
  isFrozen: boolean;
  showClock: boolean;
  events: TimerEvent[];
  onClose: () => void;
  onSelect: (idx: number) => void;
}) {
  return (
    <FixedPositionMenu
      staticContent={
        <Box display="flex" alignItems="center">
          <IconButton sx={{ m: '2px' }} onClick={() => onClose()}>
            <CloseIcon />
          </IconButton>
        </Box>
      }
    >
      {Object.keys(responses).map((problemId, idx) => (
        <IndexEntry
          key={problemId}
          response={responses[problemId]}
          points={points[problemId]}
          idx={idx}
          events={events}
          showClock={showClock}
          selectedIdx={problemIdx}
          isFrozen={isFrozen}
          onSelect={onSelect}
        />
      ))}
    </FixedPositionMenu>
  );
}

function computeResult(
  problems: { [problemId: string]: Problem },
  responses: { [problemId: string]: UserResponse }
) {
  const points: { [problemId: string]: number } = {};
  for (const problemId of Object.keys(problems ?? {})) {
    const r = responses[problemId];
    const q = problems[problemId];
    points[problemId] = getPoints(q, r);
  }
  return points;
}

export function QuizDisplay({
  quizId,
  problems,
  onResponse,
  onSubmit,
  quizEndTs,
  showPerProblemTime = false,
  existingResponses,
  isFrozen,
  showRecordOption = false,
}: {
  quizId: string;
  quizEndTs?: number;
  showPerProblemTime: boolean;
  problems: { [problemId: string]: Problem };
  existingResponses: { [problemId: string]: UserResponse };
  isFrozen: boolean;
  onResponse?: (problemId: string, r: UserResponse) => void;
  onSubmit?: (
    name: string,
    events: TimerEvent[],
    responses: { [problemId: string]: UserResponse },
    result: { [problemId: string]: number | undefined }
  ) => void;
  showRecordOption?: boolean;
}) {
  const { quiz: t } = getLocaleObject(useRouter());
  const [points, setPoints] = useState<{
    [problemId: string]: number | undefined;
  }>({});
  const [responses, setResponses] = useState<{
    [problemId: string]: UserResponse;
  }>({});
  const [problemIdx, setProblemIdx] = useState(0);
  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());
  const [events, setEvents] = useState<TimerEvent[]>([]);
  const [showClock, setShowClock] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const problemIds = Object.keys(problems ?? {});
  const currentProblemId = problemIds[problemIdx];

  useEffect(() => {
    const numQ = Object.keys(problems ?? {}).length || 0;
    if (numQ === 0) return;
    console.log(problems);
    console.log(existingResponses);
    setEvents([timerEvent(TimerEventType.SWITCH, 0)]);

    const rs: { [problemId: string]: UserResponse } = {};
    for (const problemId of Object.keys(problems ?? {})) {
      const e = existingResponses[problemId];
      const numOptionSets = getAllOptionSets(problems[problemId]).length;
      rs[problemId] = {
        filledInAnswer: e?.filledInAnswer ?? '',
        singleOptionIdxs:
          e?.singleOptionIdxs ?? new Array(numOptionSets).fill(-1),
        multipleOptionIdxs: e?.multipleOptionIdxs ?? {},
      };
    }
    setResponses(rs);
  }, [problems, existingResponses]);

  useEffect(() => {
    if (!isFrozen) return;
    setPoints(computeResult(problems, responses));
  }, [isFrozen, problems, responses]);

  function setProblemIdx2(i: number) {
    setProblemIdx(i);
    if (isFrozen) return;
    setEvents((prev) => [...prev, timerEvent(TimerEventType.SWITCH, i)]);
  }

  function onPause() {
    if (isFrozen) return;
    setEvents((prev) => [...prev, timerEvent(TimerEventType.PAUSE)]);
  }

  function onUnpause() {
    if (isFrozen) return;
    setEvents((prev) => [...prev, timerEvent(TimerEventType.UNPAUSE)]);
  }

  if (problemIds.length === 0) return <CircularProgress />;
  if (Object.keys(responses).length !== problemIds.length)
    return <CircularProgress size="2em" />;
  const response = responses[currentProblemId];
  const problem = problems[currentProblemId];

  return (
    <LayoutWithFixedMenu
      menu={
        <ProblemNavigation
          points={points}
          responses={responses}
          problemIdx={problemIdx}
          isFrozen={isFrozen}
          showClock={showClock && showPerProblemTime}
          events={events}
          onClose={() => setShowDashboard(false)}
          onSelect={(i) => setProblemIdx2(i)}
        />
      }
      topOffset={64}
      showDashboard={showDashboard}
      setShowDashboard={setShowDashboard}
    >
      <Box px="10px" maxWidth="800px" m="auto">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <h2>
            {t.problem} {problemIdx + 1} {t.of} {problemIds.length}
          </h2>
          {(!!quizEndTs || showPerProblemTime) && (
            <QuizTimer
              quizEndTs={quizEndTs}
              events={events}
              showClock={showClock}
              showHideClock={(v) => setShowClock(v)}
              onPause={() => onPause()}
              onUnpause={() => onUnpause()}
            />
          )}
        </Box>

        <Box my="10px">
          <ProblemDisplay
            response={response}
            //problemUrl={problemUrl}
            problem={problem}
            isFrozen={isFrozen}
            onResponseUpdate={(response) => {
              forceRerender();
              const problemId = problemIds[problemIdx];
              setResponses((prev) => {
                prev[problemId] = response;
                return prev;
              });
              if (onResponse) onResponse(problemId, response);
            }}
          />
        </Box>

        <Box>
          <Button
            onClick={() => setProblemIdx2(problemIdx - 1)}
            disabled={problemIdx <= 0}
            size="small"
            variant="contained"
            sx={{ mr: '10px' }}
          >
            <NavigateBeforeIcon />
            {t.prev}
          </Button>

          <Button
            onClick={() => setProblemIdx2(problemIdx + 1)}
            disabled={problemIdx >= problemIds.length - 1}
            size="small"
            variant="contained"
          >
            {t.next}
            <NavigateNextIcon />
          </Button>
        </Box>

        {!isFrozen ? (
          !!onSubmit && (
            <Button
              onClick={() => setShowSubmitDialog(true)}
              sx={{ my: '20px' }}
              variant="contained"
            >
              {t.finish}
            </Button>
          )
        ) : !Object.values(points).some((s) => s === undefined) ? (
          <i style={{ margin: '20px 0', color: '#333', fontSize: '26px' }}>
            {t.youScored.replace('$1', roundedScore(points)).replace(
              '$2',
              Object.values(problems)
                .reduce((a, b) => a + b.points, 0)
                .toString()
            )}
          </i>
        ) : (
          <i style={{ margin: '20px 0', color: '#333', fontSize: '26px' }}>
            {t.feedbackAwaited}
          </i>
        )}
      </Box>

      {!!onSubmit && (
        <Dialog
          open={showSubmitDialog}
          onClose={() => setShowSubmitDialog(false)}
        >
          <QuizSubmitConfirm
            left={Object.values(responses).filter((r) => !isAnswered(r)).length}
            onClose={(submit, name) => {
              setShowSubmitDialog(false);
              if (!submit) return;

              onSubmit(name, events, responses, points);
              setEvents((prev) => [...prev, timerEvent(TimerEventType.SUBMIT)]);
            }}
            showRecordOption={
              false
            } /*showRecordOption removed because of 'demo quiz'*/
          />
        </Dialog>
      )}
    </LayoutWithFixedMenu>
  );
}
