import CancelIcon from '@mui/icons-material/Cancel';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, Button, CircularProgress, IconButton } from '@mui/material';
import {
  FileNode,
  FixedPositionMenu,
  LayoutWithFixedMenu,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
import { shouldUseDrawer } from '@stex-react/utils';
import axios from 'axios';
import { useContext, useEffect, useReducer, useState } from 'react';
import ROOT_NODES from '../file-structure.preval';
import { QuestionDisplay } from './QuestionDisplay';
import {
  QuizTimer,
  Timer,
  TimerEvent,
  TimerEventType,
  timerEvent,
} from './QuizTimer';
import {
  Question,
  UserResponse,
  getMaaiMayQuestionURLs,
  getQuestion,
} from './question-utils';

function getAllQuestionUrls(
  nodes: FileNode[],
  pathSegments: string[],
  mmtUrl: string
): string[] {
  if (pathSegments.length === 0) {
    return nodes
      .map((node) => {
        const match = /archive=([^&]+)&filepath=([^"]+xhtml)/g.exec(node.link);
        const archive = match?.[1];
        const filepath = match?.[2];
        if (!archive || !filepath) return null;
        return `${mmtUrl}/:sTeX/document?archive=${archive}&filepath=${filepath}`;
      })
      .filter((x) => x);
  }
  const top = pathSegments[0];
  for (const node of nodes) {
    if (node.label === top)
      return getAllQuestionUrls(node.children, pathSegments.slice(1), mmtUrl);
  }
  return [];
}

interface QuestionStatus {
  isAnswered: boolean;
  isCorrect: boolean;
}

function IndexEntry({
  s,
  idx,
  selectedIdx,
  isSubmitted,
  events,
  onSelect,
}: {
  s: QuestionStatus;
  idx: number;
  selectedIdx: number;
  isSubmitted: boolean;
  events: TimerEvent[];
  onSelect: (idx: number) => void;
}) {
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
        color: isSubmitted ? (s.isCorrect ? 'green' : 'red') : '#333',
        margin: '8px',
      }}
      onClick={() => onSelect(idx)}
    >
      <Box display="flex">
        {s.isAnswered ? <DoneIcon /> : <CheckBoxOutlineBlankIcon />}
        &nbsp;Question {idx + 1}&nbsp;
        {isSubmitted && (s.isCorrect ? <CheckCircleIcon /> : <CancelIcon />)}
      </Box>
      <Box fontSize="12px">
        <Timer events={events} questionIndex={idx} />
      </Box>
    </span>
  );
}
function QuestionNavigation({
  questionStatuses,
  questionIdx,
  isSubmitted,
  events,
  onClose,
  onSelect,
}: {
  questionStatuses: QuestionStatus[];
  questionIdx: number;
  isSubmitted: boolean;
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
      {questionStatuses.map((s, idx) => (
        <IndexEntry
          key={idx}
          s={s}
          idx={idx}
          events={events}
          selectedIdx={questionIdx}
          isSubmitted={isSubmitted}
          onSelect={onSelect}
        />
      ))}
    </FixedPositionMenu>
  );
}

export function QuizDisplay({ quizId }: { quizId: string }) {
  const [questionUrls, setQuestionUrls] = useState([] as string[]);
  const [questionStatuses, setQuestionStatuses] = useState(
    [] as QuestionStatus[]
  );
  const [questions, setQuestions] = useState<Question[] | undefined>(undefined);
  const [responses, setResponses] = useState([] as UserResponse[]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());
  const [events, setEvents] = useState<TimerEvent[]>([]);

  const [, forceRerender] = useReducer((x) => x + 1, 0);

  function setQuestionIdx2(i: number) {
    setQuestionIdx(i);
    if (!isSubmitted)
      setEvents((prev) => [...prev, timerEvent(TimerEventType.SWITCH, i)]);
  }

  function onPause() {
    if (!isSubmitted)
      setEvents((prev) => [...prev, timerEvent(TimerEventType.PAUSE)]);
  }

  function onUnpause() {
    if (!isSubmitted)
      setEvents((prev) => [...prev, timerEvent(TimerEventType.UNPAUSE)]);
  }

  useEffect(() => {
    if (!quizId?.length) return;
    const urls = quizId.startsWith('MAAI (may)')
      ? getMaaiMayQuestionURLs(mmtUrl, quizId === 'MAAI (may)')
      : getAllQuestionUrls(ROOT_NODES, quizId.split('/'), mmtUrl);
    setQuestionUrls(urls);

    Promise.all(urls.map((url) => axios.get(url))).then((responses) => {
      setQuestions(
        responses.map((r, idx) => {
          const htmlDoc = new DOMParser().parseFromString(r.data, 'text/html');
          return getQuestion(htmlDoc, urls[idx]);
        })
      );
      setEvents([timerEvent(TimerEventType.SWITCH, 0)]);
    });

    setQuestionStatuses(
      new Array(urls.length)
        .fill(undefined)
        .map(() => ({ isAnswered: false, isCorrect: false } as QuestionStatus))
    );

    setResponses(
      new Array(urls.length).fill(undefined).map(
        () =>
          ({
            filledInAnswer: '',
            singleOptionIdx: -1,
            multiOptionIdx: {},
          } as UserResponse)
      )
    );
    setIsSubmitted(false);
  }, [quizId, mmtUrl]);

  function onResponseUpdate(
    questionIdx: number,
    response: UserResponse,
    isAnswered: boolean,
    isCorrect: boolean
  ) {
    setResponses((prev) => {
      prev[questionIdx] = response;
      return prev;
    });
    setQuestionStatuses((prev) => {
      prev[questionIdx] = { isAnswered, isCorrect };
      return prev;
    });
  }

  if (!questions) return <CircularProgress />;
  const response = responses[questionIdx];
  const question = questions[questionIdx];
  return (
    <LayoutWithFixedMenu
      menu={
        <QuestionNavigation
          questionStatuses={questionStatuses}
          questionIdx={questionIdx}
          isSubmitted={isSubmitted}
          events={events}
          onClose={() => setShowDashboard(false)}
          onSelect={(i) => setQuestionIdx2(i)}
        />
      }
      topOffset={64}
      showDashboard={showDashboard}
      setShowDashboard={setShowDashboard}
    >
      <Box px="10px" maxWidth="800px" m="auto">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <h2>
            Question {questionIdx + 1} of {questions.length}
          </h2>
          <QuizTimer
            events={events}
            onPause={() => onPause()}
            onUnpause={() => onUnpause()}
          />
        </Box>

        <Box my="10px">
          <QuestionDisplay
            response={response}
            //questionUrl={questionUrl}
            question={question}
            isSubmitted={isSubmitted}
            onResponseUpdate={(response, isAnswered, isCorrect) => {
              forceRerender();
              onResponseUpdate(questionIdx, response, isAnswered, isCorrect);
            }}
          />
        </Box>

        <Box>
          <Button
            onClick={() => setQuestionIdx2(questionIdx - 1)}
            disabled={questionIdx <= 0}
            size="small"
            variant="contained"
            sx={{ mr: '10px' }}
          >
            <NavigateBeforeIcon />
            Prev
          </Button>

          <Button
            onClick={() => setQuestionIdx2(questionIdx + 1)}
            disabled={questionIdx >= questionUrls.length - 1}
            size="small"
            variant="contained"
          >
            Next
            <NavigateNextIcon />
          </Button>
        </Box>

        {isSubmitted ? (
          <i style={{ margin: '20px 0', color: '#333', fontSize: '26px' }}>
            You answered{' '}
            {questionStatuses.reduce(
              (prev, s) => prev + (s.isCorrect ? 1 : 0),
              0
            )}{' '}
            out of {questionUrls.length} questions correctly
          </i>
        ) : (
          <Button
            onClick={() => {
              const left = questionStatuses.filter((s) => !s.isAnswered).length;
              const leftStatement =
                left > 0 ? `You did not answer ${left} questions.` : '';
              if (
                confirm(leftStatement + ' Are you sure you want to submit?')
              ) {
                setIsSubmitted(true);
                setEvents((prev) => [
                  ...prev,
                  timerEvent(TimerEventType.SUBMIT),
                ]);
              }
            }}
            sx={{ my: '20px' }}
            variant="contained"
          >
            Submit
          </Button>
        )}
      </Box>
    </LayoutWithFixedMenu>
  );
}
