import { Box, Typography } from '@mui/material';
import { HomeworkStatsInfo } from '@stex-react/api';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import { useRouter } from 'next/router';
import Chart from 'react-google-charts';
import { getLocaleObject } from '../lang/utils';
import { BarChart } from '../pages/quiz/results';

const HomeworkStats = ({ title, stats }: { title: string; stats: HomeworkStatsInfo }) => {
  const { homeworkManager: t } = getLocaleObject(useRouter());
  return (
    <Box
      sx={{
        width: '100%',
        mb: 3,
      }}
    >
      <Typography variant="h6" my={3}>
        {t.homeworkStats} for <b>{mmtHTMLToReact(title)}</b>
      </Typography>
      <h3>
        Homework attempted by <b style={{ color: 'red' }}>{stats?.totalStudentAttend}</b> students
      </h3>
      {/* <Chart
        chartType="LineChart"
        data={[[column1, column2], ...vals]}
        width="100%"
        height="400px"
        options={{
          vAxis: { minValue: 0 },
          hAxis: {
            title: 'Time',
            format: 'dd MMM HH:mm:ss',
          },
        }}
        legendToggle
      /> */}
      <br />
      <h2>Scores</h2>
      <BarChart
        data={stats?.answerHistogram.map((bucket) => ({
          key: bucket.questionId,
          value: bucket.answerCount,
        }))}
        column1="Score"
        column2="Number of students"
      />
      {stats?.gradingStates != null && (
        <Chart
          chartType="ColumnChart"
          data={[
            ['Question', 'Graded', 'Partially graded', 'Ungraded'],
            ...stats.gradingStates.map((question) => {
              const { questionId, graded, partiallyGraded: partially_graded, ungraded } = question;

              console.log(stats.gradingStates);
              return [questionId, graded, ungraded, partially_graded];
            }),
          ]}
          width="100%"
          height="400px"
          options={{
            vAxis: { minValue: 0 },
            isStacked: true,
            series: {
              0: { color: '#109618' },
              1: { color: '#ff9900' },
              2: { color: '#dc3912' },
            },
          }}
          legendToggle
        />
      )}
      {stats?.averageStudentScore != null && (
        <Chart
          chartType="ColumnChart"
          data={[
            ['Quotient', 'AvgQuotient'],
            ...stats.averageStudentScore.map((problem) => {
              const { questionId, averageScore: average_score } = problem;

              return [questionId, average_score];
            }),
          ]}
          width="100%"
          height="400px"
        />
      )}
    </Box>
  );
};
export default HomeworkStats;
