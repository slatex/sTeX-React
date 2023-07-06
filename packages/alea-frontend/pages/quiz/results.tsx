import { Box, FormControl, InputLabel, MenuItem, Select, Tab, Tabs } from '@mui/material';
import { getSectionInfo } from '@stex-react/utils';
import axios from 'axios';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Chart from 'react-google-charts';
import MainLayout from '../../layouts/MainLayout';
import { QuizResult } from '../../shared/quiz';
import { MdViewer } from '@stex-react/markdown';

function getChartCell(id: string) {
  return (
    <Box
      p={2}
      m="auto"
      border="1px solid #EEE"
      borderRadius="10px"
      id={id}
    ></Box>
  );
}
function BarChart({
  data,
  column1,
  column2,
}: {
  data: { key: string; value: number }[];
  column1: string;
  column2: string;
}) {
  return (
    <Chart
      chartType="ColumnChart"
      data={[[column1, column2], ...data.map((d) => [d.key, d.value])]}
      width="100%"
      height="400px"
      options={{ vAxis: { minValue: 0 } }}
      legendToggle
    />
  );
}

function TimingInfo({
  title,
  times,
  unit,
}: {
  title: string;
  times: { name: string; duration: number }[];
  unit: string;
}) {
  const data = times.map((t) => ({
    key: t.name,
    value: t.duration,
  }));
  return (
    <>
      <MdViewer content={title} />
      <BarChart data={data} column1="User name" column2={`Time (${unit})`} />
    </>
  );
}

function QuizSummary({ quizResults }: { quizResults: QuizResult[] }) {
  const quizNames = [...new Set(quizResults.map((r) => r.quizName))];
  return (
    <Box>
      {quizNames.map((quizName) => (
        <TimingInfo
          key={quizName}
          title={quizName}
          unit="min"
          times={quizResults
            .filter((r) => r.quizName === quizName)
            .map((r) => ({
              name: r.quizTakerName,
              duration: Math.round(r.duration_ms / 6000) / 10,
            }))}
        />
      ))}
    </Box>
  );
}

function urlToName(url: string) {
  const info = getSectionInfo(url);
  return `### [${info.archive}: ${info.filepath}](${url})`;
}

function QuestionSummary({ quizResults }: { quizResults: QuizResult[] }) {
  const [quizName, setQuizName] = useState('All');
  const questions = quizResults
    .filter(
      (r) => !quizName.length || quizName === 'All' || r.quizName === quizName
    )
    .map((r) =>
      r.questionInfo.map((q) => ({
        qName: urlToName(q.url),
        quizTakerName: r.quizTakerName,
        duration_ms: q.duration_ms,
      }))
    )
    .flat();
  const quizNames = [...new Set(quizResults.map((r) => r.quizName))];
  const questionNames = [...new Set(questions.map((q) => q.qName))];
  return (
    <Box>
      <FormControl>
        <InputLabel id="quiz-select-label">Quiz</InputLabel>
        <Select
          labelId="quiz-select-label"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          label="Quiz"
        >
          <MenuItem value="All">All</MenuItem>
          {quizNames.map((quizName) => (
            <MenuItem key={quizName} value={quizName}>
              {quizName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {questionNames.map((questionName) => (
        <TimingInfo
          key={questionName}
          title={questionName}
          unit="sec"
          times={questions
            .filter((q) => q.qName === questionName)
            .map((q) => ({
              name: q.quizTakerName,
              duration: Math.round(q.duration_ms / 1000),
            }))}
        />
      ))}
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <span>{children}</span>
        </Box>
      )}
    </div>
  );
}

const QuizResultsPage: NextPage = () => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    axios.get('/api/read-quiz-results').then((r) => {
      setQuizResults(r.data.data);
    });
  }, []);
  return (
    <MainLayout title="Quizzes | VoLL-KI">
      <Box m="auto" maxWidth="800px" p="10px">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(e, n) => setTabValue(n)}
            aria-label="basic tabs example"
          >
            <Tab label="Quizzes" />
            <Tab label="Questions" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <QuizSummary quizResults={quizResults} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <QuestionSummary quizResults={quizResults} />
        </TabPanel>
      </Box>
    </MainLayout>
  );
};

export default QuizResultsPage;
