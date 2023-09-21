import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Phase, Quiz, getAuthHeaders } from '@stex-react/api';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import axios from 'axios';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { CheckboxWithTimestamp, roundToMinutes } from './CheckBoxWithTimestamp';
import { QuizFileReader } from './QuizFileReader';

function getFormErrorReason(
  quizStartTs: number,
  quizEndTs: number,
  feedbackReleaseTs: number,
  manuallySetPhase: string,
  problems: { [problemId: string]: string },
  title: string
) {
  const phaseTimes = [quizStartTs, quizEndTs, feedbackReleaseTs].filter(
    (ts) => ts !== 0
  );
  for (let i = 0; i < phaseTimes.length - 1; i++) {
    if (phaseTimes[i] > phaseTimes[i + 1])
      return 'Phase times are not in order.';
  }
  if (!problems || Object.keys(problems).length === 0)
    return 'No problems found.';
  if (title.length === 0) return 'No title set.';
  return undefined;
}

const QuizDashboardPage: NextPage = () => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>('New');

  const [title, setTitle] = useState<string>('');
  const [quizStartTs, setQuizStartTs] = useState<number>(
    roundToMinutes(Date.now())
  );
  const [quizEndTs, setQuizEndTs] = useState<number>(
    roundToMinutes(Date.now())
  );
  const [feedbackReleaseTs, setFeedbackReleaseTs] = useState<number>(
    roundToMinutes(Date.now())
  );
  const [manuallySetPhase, setManuallySetPhase] = useState<string>(Phase.UNSET);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [problems, setProblems] = useState<{ [problemId: string]: string }>({});
  const router = useRouter();

  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId);
  const isNewQuiz = selectedQuizId === 'New';
  const formErrorReason = getFormErrorReason(
    quizStartTs,
    quizEndTs,
    feedbackReleaseTs,
    manuallySetPhase,
    problems,
    title
  );

  useEffect(() => {
    axios
      .get('/api/get-all-quizzes', { headers: getAuthHeaders() })
      .then((res) => {
        setQuizzes(res.data);
        if (res.data?.length) setSelectedQuizId(res.data[0].id);
        console.log(res.data);
      });
  }, []);

  useEffect(() => {
    if (isNewQuiz) {
      const ts = roundToMinutes(Date.now());
      setQuizStartTs(ts);
      setQuizEndTs(ts);
      setFeedbackReleaseTs(ts);
      setManuallySetPhase(Phase.UNSET);
      setTitle('');
      setProblems({});
      return;
    }

    const selected = quizzes.find((quiz) => quiz.id === selectedQuizId);
    if (!selected) return;
    setQuizStartTs(selected.quizStartTs);
    setQuizEndTs(selected.quizEndTs);
    setFeedbackReleaseTs(selected.feedbackReleaseTs);
    setManuallySetPhase(selected.manuallySetPhase);
    setTitle(selected.title);
    setProblems(selected.problems);
  }, [selectedQuizId, quizzes]);

  if (!selectedQuiz && !isNewQuiz) return <>Error</>;

  return (
    <MainLayout title="Quizzes | VoLL-KI">
      <Box m="auto" maxWidth="800px" p="10px">
        <Select
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
        >
          <MenuItem value="New">New</MenuItem>
          {quizzes.map((quiz) => (
            <MenuItem key={quiz.id} value={quiz.id}>
              {mmtHTMLToReact(quiz.title)}&nbsp;({quiz.id})
            </MenuItem>
          ))}
        </Select>

        <h2>{isNewQuiz ? 'New Quiz' : 'Quiz'}</h2>
        <b>{mmtHTMLToReact(title)}</b>
        <CheckboxWithTimestamp
          timestamp={quizStartTs}
          setTimestamp={setQuizStartTs}
          label="Quiz start time"
        />
        <CheckboxWithTimestamp
          timestamp={quizEndTs}
          setTimestamp={setQuizEndTs}
          label="Quiz end time"
        />
        <CheckboxWithTimestamp
          timestamp={feedbackReleaseTs}
          setTimestamp={setFeedbackReleaseTs}
          label="Feedback release time"
        />
        <FormControl variant="outlined" sx={{ minWidth: '300px', m: '10px 0' }}>
          <InputLabel id="manually-set-phase-label">
            Manually set phase
          </InputLabel>
          <Select
            label="Manually Set Phase"
            labelId="manually-set-phase-label"
            value={manuallySetPhase}
            onChange={(e) => setManuallySetPhase(e.target.value)}
          >
            {Object.values(Phase).map((enumValue) => (
              <MenuItem key={enumValue} value={enumValue}>
                {enumValue}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <QuizFileReader setTitle={setTitle} setProblems={setProblems} />
        <i>{Object.keys(problems).length} problems found.</i>
        <br />

        <b style={{ color: 'red' }}>{formErrorReason}</b>
        <br />
        <Button
          disabled={!!formErrorReason}
          variant="contained"
          onClick={(e) => {
            axios
              .post(
                '/api/create-quiz',
                {
                  title,
                  quizStartTs,
                  quizEndTs,
                  feedbackReleaseTs,
                  manuallySetPhase,
                  problems,
                },
                { headers: getAuthHeaders() }
              )
              .then((res) => {
                console.log(res.data);
              });
          }}
        >
          {isNewQuiz ? 'Create New Quiz' : 'Update Quiz'}
        </Button>
        <br />
        <br />
        {!isNewQuiz && (
          <Button onClick={() => router.push(`/quiz/${selectedQuizId}`)}>
            Go To Quiz
          </Button>
        )}
      </Box>
    </MainLayout>
  );
};

export default QuizDashboardPage;
