import { OpenInNew } from '@mui/icons-material';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import {
  canAccessResource,
  createQuiz,
  deleteQuiz,
  getAuthHeaders,
  getCourseInfo,
  getQuizStats,
  Phase,
  Quiz,
  QuizStatsResponse,
  updateQuiz,
} from '@stex-react/api';
import { getQuizPhase } from '@stex-react/quiz-utils';
import { mmtHTMLToReact, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { Action, CourseInfo, CURRENT_TERM, ResourceName, roundToMinutes } from '@stex-react/utils';
import axios, { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import { CheckboxWithTimestamp } from './CheckBoxWithTimestamp';
import { QuizFileReader } from './QuizFileReader';
import { QuizStatsDisplay } from './QuizStatsDisplay';

const NEW_QUIZ_ID = 'New';

function isNewQuiz(quizId: string) {
  return quizId === NEW_QUIZ_ID;
}

function getFormErrorReason(
  quizStartTs: number,
  quizEndTs: number,
  feedbackReleaseTs: number,
  manuallySetPhase: string,
  problems: { [problemId: string]: string },
  title: string
) {
  const phaseTimes = [quizStartTs, quizEndTs, feedbackReleaseTs].filter((ts) => ts !== 0);
  for (let i = 0; i < phaseTimes.length - 1; i++) {
    if (phaseTimes[i] > phaseTimes[i + 1]) return 'Phase times are not in order.';
  }
  if (!problems || Object.keys(problems).length === 0) return 'No problems found.';
  if (title.length === 0) return 'No title set.';
  return undefined;
}

const QuizDurationInfo = ({ quizStartTs, quizEndTs, feedbackReleaseTs }) => {
  const quizDuration = dayjs(quizEndTs).diff(dayjs(quizStartTs), 'minutes');
  const feedbackDuration = dayjs(feedbackReleaseTs).diff(dayjs(quizEndTs), 'minutes');
  if (!(quizEndTs - quizStartTs)) return null;
  return (
    <Box
      sx={{
        backgroundColor: '#edf7ed',
        p: '5px',
        borderRadius: '5px',
        border: '1px solid #edf7ed',
        marginTop: '5px',
      }}
    >
      <p style={{ color: '#1e4620' }}>
        Quiz is <strong>{`${quizDuration} minutes`}</strong> long, and it will take additional{' '}
        <strong>{`${feedbackDuration} minutes`}</strong> for feedback release
      </p>
    </Box>
  );
};
interface QuizDashboardProps {
  courseId: string;
}

const QuizDashboard: NextPage<QuizDashboardProps> = ({ courseId }) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>(NEW_QUIZ_ID);

  const [title, setTitle] = useState<string>('');
  const [quizStartTs, setQuizStartTs] = useState<number>(roundToMinutes(Date.now()));
  const [quizEndTs, setQuizEndTs] = useState<number>(roundToMinutes(Date.now()));
  const [feedbackReleaseTs, setFeedbackReleaseTs] = useState<number>(roundToMinutes(Date.now()));
  const [courseTerm, setCourseTerm] = useState<string>(CURRENT_TERM);
  const [manuallySetPhase, setManuallySetPhase] = useState<string>(Phase.UNSET);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [problems, setProblems] = useState<{ [problemId: string]: string }>({});
  const [stats, setStats] = useState<QuizStatsResponse>({
    attemptedHistogram: {},
    scoreHistogram: {},
    requestsPerSec: {},
    perProblemStats: {},
    totalStudents: 0,
  });
  const [accessType, setAccessType] = useState<'PREVIEW_ONLY' | 'MUTATE'>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [canAccess, setCanAccess] = useState(false);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});
  const { mmtUrl } = useContext(ServerLinksContext);
  const isNew = isNewQuiz(selectedQuizId);

  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId);
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
      .get(`/api/quiz/get-all-quizzes?courseId=${courseId}&courseTerm=${courseTerm}`, {
        headers: getAuthHeaders(),
      })
      .then((res) => {
        const allQuizzes: Quiz[] = res.data;
        allQuizzes?.sort((a, b) => b.quizStartTs - a.quizStartTs);
        setQuizzes(allQuizzes);
        if (allQuizzes?.length) setSelectedQuizId(allQuizzes[0].id);
      });
  }, [courseId, courseTerm]);

  useEffect(() => {
    if (!selectedQuizId || selectedQuizId === NEW_QUIZ_ID) return;

    getQuizStats(selectedQuizId, courseId, courseTerm).then(setStats);
    const interval = setInterval(() => {
      getQuizStats(selectedQuizId, courseId, courseTerm).then(setStats);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedQuizId]);

  useEffect(() => {
    if (selectedQuizId === NEW_QUIZ_ID) {
      const ts = roundToMinutes(Date.now());
      setQuizStartTs(ts);
      setQuizEndTs(ts);
      setFeedbackReleaseTs(ts);
      setManuallySetPhase(Phase.UNSET);
      setTitle('');
      setProblems({});
      setCourseTerm(CURRENT_TERM);
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
    setCourseTerm(selected.courseTerm);
  }, [selectedQuizId, quizzes]);

  useEffect(() => {
    setQuizEndTs((prev) => Math.max(prev, quizStartTs));
    setFeedbackReleaseTs((prev) => Math.max(prev, quizStartTs, quizEndTs));
  }, [quizStartTs, quizEndTs]);
  useEffect(() => {
    getCourseInfo().then(setCourses);
  }, [mmtUrl]);

  if (!selectedQuiz && !isNew) return <>Error</>;

  useEffect(() => {
    async function checkHasAccessAndGetTypeOfAccess() {
      const canMutate = await canAccessResource(ResourceName.COURSE_QUIZ, Action.MUTATE, {
        courseId,
        instanceId: CURRENT_TERM,
      });
      if (canMutate) {
        setAccessType('MUTATE');
        setCanAccess(true);
        return;
      }
      const canPreview = await canAccessResource(ResourceName.COURSE_QUIZ, Action.PREVIEW, {
        courseId,
        instanceId: courseTerm,
      });
      if (canPreview) {
        setAccessType('PREVIEW_ONLY');
        setCanAccess(true);
      } else {
        setCanAccess(false);
      }
    }
    checkHasAccessAndGetTypeOfAccess();
  }, []);

  async function handleDelete(quizId: string) {
    await deleteQuiz(quizId, courseId, courseTerm);
    setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
    setSelectedQuizId(NEW_QUIZ_ID);
  }

  if (!canAccess) return <>Unauthorized</>;

  return (
    <Box m="auto" maxWidth="800px" p="10px">
      {accessType == 'PREVIEW_ONLY' && (
        <Typography fontSize={16} color="red">
          You don't have access to mutate this course Quizzes
        </Typography>
      )}
      <Select value={selectedQuizId} onChange={(e) => setSelectedQuizId(e.target.value)}>
        {accessType == 'MUTATE' ? (
          <MenuItem value="New">New</MenuItem>
        ) : (
          <MenuItem value="New">Select Quiz</MenuItem>
        )}
        {quizzes.map((quiz) => (
          <MenuItem key={quiz.id} value={quiz.id}>
            {mmtHTMLToReact(quiz.title)}&nbsp;({quiz.id})
          </MenuItem>
        ))}
      </Select>

      <h2>
        {isNew && accessType == 'MUTATE'
          ? 'New Quiz'
          : selectedQuizId === 'New'
          ? ''
          : selectedQuizId}
      </h2>
      <b>{mmtHTMLToReact(title)}</b>
      {selectedQuiz && (
        <b>
          <br />
          Current State: {getQuizPhase(selectedQuiz)}
        </b>
      )}
      <QuizDurationInfo
        quizStartTs={quizStartTs}
        quizEndTs={quizEndTs}
        feedbackReleaseTs={feedbackReleaseTs}
      />
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
        <InputLabel id="manually-set-phase-label">Manually set phase</InputLabel>
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
      {accessType == 'MUTATE' && <QuizFileReader setTitle={setTitle} setProblems={setProblems} />}
      <br />
      <i>{Object.keys(problems).length} problems found.</i>
      <br />

      {selectedQuiz && <b style={{ color: 'red' }}>{formErrorReason}</b>}
      <br />
      {accessType == 'MUTATE' && (
        <Button
          disabled={!!formErrorReason || isUpdating}
          variant="contained"
          onClick={async (e) => {
            setIsUpdating(true);
            const quiz = {
              id: selectedQuizId,
              title,
              courseId,
              courseTerm,
              quizStartTs,
              quizEndTs,
              feedbackReleaseTs,
              manuallySetPhase,
              problems,
            } as Quiz;
            let resp: AxiosResponse;
            try {
              resp = await (isNew ? createQuiz(quiz) : updateQuiz(quiz));
            } catch (e) {
              alert(e);
              location.reload();
            }
            if (![200, 204].includes(resp.status)) {
              alert(`Error: ${resp.status} ${resp.statusText}`);
            } else {
              alert(`Quiz ${isNew ? 'created' : 'updated'} successfully.`);
            }
            location.reload();
          }}
        >
          {isNew ? 'Create New Quiz' : 'Update Quiz'}
        </Button>
      )}
      <br />
      {accessType == 'MUTATE' && !isNew && (
        <Button
          onClick={() => handleDelete(selectedQuizId)}
          variant="contained"
          sx={{ mt: '10px' }}
        >
          DELETE QUIZ
        </Button>
      )}
      <br />
      <br />
      {!isNew && (
        <a href={`/quiz/${selectedQuizId}`} target="_blank">
          <Button variant="contained">
            Go To Quiz&nbsp;
            <OpenInNew />
          </Button>
        </a>
      )}

      <QuizStatsDisplay
        stats={stats}
        maxProblems={Object.keys(selectedQuiz?.problems || {}).length || 1}
      />
    </Box>
  );
};

export default QuizDashboard;
