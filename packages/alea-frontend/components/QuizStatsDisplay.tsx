import { QuizStatsResponse } from '@stex-react/api';
import { BarChart } from '../pages/quiz/results';

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

      <h2>Scores</h2>
      <BarChart
        data={Object.keys(stats.scoreHistogram).sort().map((score) => ({
          key: score.toString(),
          value: +stats.scoreHistogram[score] ?? 0,
        }))}
        column1="Score"
        column2="Number of students"
      />
    </>
  );
}
