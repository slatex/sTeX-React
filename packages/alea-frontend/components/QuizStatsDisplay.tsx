import { QuizStatsResponse } from '@stex-react/api';
import { BarChart, TimedLineChart } from '../pages/quiz/results';
import Chart from 'react-google-charts';
import { convertHtmlStringToPlain } from '@stex-react/utils';

export function QuizStatsDisplay({
  stats,
  maxProblems,
}: {
  stats: QuizStatsResponse;
  maxProblems: number;
}) {
  const totalStudents = Object.values(stats.attemptedHistogram).reduce(
    (a, b) => a + +b,
    0
  );
  return (
    <>
      <h2>
        Quiz attempted by <b style={{ color: 'red' }}>{totalStudents}</b>{' '}
        students
      </h2>

      <h2>Problems attempted</h2>
      <BarChart
        data={Array.from({ length: maxProblems + 1 }).map((_, idx) => ({
          key: idx.toString(),
          value: +stats.attemptedHistogram[idx],
        }))}
        column1="Attempted Problems"
        column2="Number of students"
      />
      <br />

      <h2>Response Rates</h2>
      <TimedLineChart
        data={Object.keys(stats.requestsPerSec)
          .map((s) => +s)
          .sort((a, b) => a - b)
          .map((ts) => ({
            ts: +ts,
            value: +stats.requestsPerSec[ts] ?? 0,
          }))}
        column1="Time"
        column2="Responses/sec"
      />
      <br />

      <h2>Scores</h2>
      <BarChart
        data={Object.keys(stats.scoreHistogram)
          .map((s) => +s)
          .sort((a, b) => a - b)
          .map((score) => ({
            key: (Math.round(score * 100) / 100).toString(),
            value: +stats.scoreHistogram[score] ?? 0,
          }))}
        column1="Score"
        column2="Number of students"
      />
      <Chart
        chartType="ColumnChart"
        data={[
          ['Question', 'Correct', 'Partial', 'Incorrect'],
          ...Object.keys(stats.perProblemStats).map((problemId) => {
            const { correct, incorrect, partial, header, maxPoints } =
              stats.perProblemStats[problemId];
            let disp = header ? convertHtmlStringToPlain(header) : '';
            disp += ` (${problemId}) [${maxPoints}]`;
            return [disp, correct, partial, incorrect];
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
    </>
  );
}
