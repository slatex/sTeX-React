import CancelIcon from '@mui/icons-material/Cancel';
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
  Tristate,
  UserResponse,
  getCorrectness,
} from '@stex-react/api';
import {
  FixedPositionMenu,
  LayoutWithFixedMenu,
} from '@stex-react/stex-react-renderer';
import { shouldUseDrawer } from '@stex-react/utils';
import { useEffect, useReducer, useState } from 'react';
import { ProblemDisplay } from './QuestionDisplay';
import { QuizSubmitConfirm } from './QuizSubmitConfirm';
import { QuizTimer, Timer, timerEvent } from './QuizTimer';

function isAnswered(r: UserResponse) {
  return (
    !!r?.filledInAnswer?.length ||
    r?.singleOptionIdx >= 0 ||
    Object.values(r?.multipleOptionIdxs ?? {}).some((v) => v === true)
  );
}
function IndexEntry({
  response,
  result,
  idx,
  selectedIdx,
  isFrozen,
  events,
  showClock,
  onSelect,
}: {
  response: UserResponse;
  result: Tristate;
  idx: number;
  selectedIdx: number;
  isFrozen: boolean;
  events: TimerEvent[];
  showClock: boolean;
  onSelect: (idx: number) => void;
}) {
  const isCorrectnessKnown = isFrozen && result !== Tristate.UNKNOWN;
  const isCorrect = result === Tristate.TRUE;
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
        {answered ? (
          <span style={{ width: '24px' }}></span>
        ) : (
          <CheckBoxOutlineBlankIcon />
        )}
        <span>&nbsp;Problem {idx + 1}&nbsp;</span>
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
  result,
  problemIdx,
  isFrozen,
  showClock,
  events,
  onClose,
  onSelect,
}: {
  responses: { [problemId: string]: UserResponse };
  result: { [problemId: string]: Tristate };
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
          result={result[problemId]}
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
  const result: { [problemId: string]: Tristate } = {};
  for (const problemId of Object.keys(problems ?? {})) {
    const r = responses[problemId];
    const q = problems[problemId];
    result[problemId] = getCorrectness(q, r);
  }
  return result;
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
    result: { [problemId: string]: Tristate }
  ) => void;
}) {
  const [result, setResult] = useState<{ [problemId: string]: Tristate }>({});
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
      rs[problemId] = {
        filledInAnswer: e?.filledInAnswer ?? '',
        singleOptionIdx: e?.singleOptionIdx ?? -1,
        multipleOptionIdxs: e?.multipleOptionIdxs ?? {},
      };
    }
    setResponses(rs);
  }, [problems, existingResponses]);

  useEffect(() => {
    if (!isFrozen) return;
    setResult(computeResult(problems, responses));
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
          result={result}
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
            Problem {problemIdx + 1} of {problemIds.length}
          </h2>
          <QuizTimer
            quizEndTs={quizEndTs}
            events={events}
            showClock={showClock}
            showHideClock={(v) => setShowClock(v)}
            onPause={() => onPause()}
            onUnpause={() => onUnpause()}
          />
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
            Prev
          </Button>

          <Button
            onClick={() => setProblemIdx2(problemIdx + 1)}
            disabled={problemIdx >= problemIds.length - 1}
            size="small"
            variant="contained"
          >
            Next
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
              Submit
            </Button>
          )
        ) : !Object.values(result).some((s) => s === Tristate.UNKNOWN) ? (
          <i style={{ margin: '20px 0', color: '#333', fontSize: '26px' }}>
            You answered{' '}
            {Object.values(result).reduce(
              (prev, s) => prev + (s === Tristate.TRUE ? 1 : 0),
              0
            )}{' '}
            out of {problemIds.length} problems correctly
          </i>
        ) : (
          <i style={{ margin: '20px 0', color: '#333', fontSize: '26px' }}>
            Quiz Submitted. Feedback awaited
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

              onSubmit(name, events, responses, result);
              setEvents((prev) => [...prev, timerEvent(TimerEventType.SUBMIT)]);
            }}
          />
        </Dialog>
      )}
    </LayoutWithFixedMenu>
  );
}
