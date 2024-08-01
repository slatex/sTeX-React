import { OpenInNew } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import {
  Phase,
  Quiz,
  QuizStatsResponse,
  UserInfo,
  canAccessResource,
  createQuiz,
  getAuthHeaders,
  getCourseInfo,
  getQuizStats,
  getUserInfo,
  updateQuiz,
} from '@stex-react/api';
import { getQuizPhase } from '@stex-react/quiz-utils';
import {
  ServerLinksContext,
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';
import { Action, CourseInfo, CURRENT_TERM, getResourceId, ResourceName, roundToMinutes } from '@stex-react/utils';
import axios, { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import { CheckboxWithTimestamp } from '../../components/CheckBoxWithTimestamp';
import { QuizFileReader } from '../../components/QuizFileReader';
import { QuizStatsDisplay } from '../../components/QuizStatsDisplay';
import MainLayout from '../../layouts/MainLayout';

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

const QuizDurationInfo = ({ quizStartTs, quizEndTs, feedbackReleaseTs }) => {
  const quizDuration = dayjs(quizEndTs).diff(dayjs(quizStartTs), 'minutes');
  const feedbackDuration = dayjs(feedbackReleaseTs).diff(
    dayjs(quizEndTs),
    'minutes'
  );
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
        Quiz is <strong>{`${quizDuration} minutes`}</strong> long, and it will
        take additional <strong>{`${feedbackDuration} minutes`}</strong> for
        feedback release
      </p>
    </Box>
  );
};

const QuizDashboardPage: NextPage = () => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>(NEW_QUIZ_ID);

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [canAccess, setCanAccess] = useState(false);
  const [courseId, setCourseId] = useState('ai-1');
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
      .get('/api/get-all-quizzes', { headers: getAuthHeaders() })
      .then((res) => {
        const allQuizzes: Quiz[] = res.data;
        allQuizzes?.sort((a, b) => b.quizStartTs - a.quizStartTs);
        setQuizzes(allQuizzes);
        if (allQuizzes?.length) setSelectedQuizId(allQuizzes[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedQuizId || selectedQuizId == NEW_QUIZ_ID) return;

    getQuizStats(selectedQuizId).then(setStats);
    const interval = setInterval(() => {
      getQuizStats(selectedQuizId).then(setStats);
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
    setCourseId(selected.courseId);
    setTitle(selected.title);
    setProblems(selected.problems);
    setCourseTerm(selected.courseTerm);
  }, [selectedQuizId, quizzes]);

  useEffect(() => {
    setQuizEndTs((prev) => Math.max(prev, quizStartTs));
    setFeedbackReleaseTs((prev) => Math.max(prev, quizStartTs, quizEndTs));
  }, [quizStartTs, quizEndTs]);
  useEffect(() => {
    getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  if (!selectedQuiz && !isNew) return <>Error</>;

  useEffect(()=>{
    async function isUserAuthorized(){
    if(!await canAccessResource(getResourceId(ResourceName.COURSE_QUIZ, { courseId, instanceId : courseTerm }), Action.MUTATE)){
        setCanAccess(false);
        return;
    }
    setCanAccess(true);
    }
    isUserAuthorized()
  }, [])

  if(!canAccess) return <>UnAuthorized</>;

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

        <h2>{isNew ? 'New Quiz' : selectedQuizId}</h2>
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
        <FormControl variant="outlined" sx={{ minWidth: '300px', m: '10px 0' }}>
          <InputLabel id="course-id-label">Course Id</InputLabel>
          <Select
            label="Course Id"
            labelId="course-id-label"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {['', ...Object.keys(courses)].map((enumValue) => (
              <MenuItem key={enumValue} value={enumValue}>
                {enumValue}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
            console.log(resp?.data);
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
    </MainLayout>
  );
};

export default QuizDashboardPage;
