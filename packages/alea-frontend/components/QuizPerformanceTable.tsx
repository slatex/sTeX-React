import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import {
    GetPreviousQuizInfoResponse,
    getQuizPerformance,
} from '@stex-react/api';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import { PRIMARY_COL } from '@stex-react/utils';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function QuizPerofrmanceTable({ quizList, header }) {
  const [previousQuizData, setPreviousQuizData] =
    useState<GetPreviousQuizInfoResponse>();
  useEffect(() => {
    getQuizPerformance().then(setPreviousQuizData);
  }, []);
  return (
    <>
      <Typography variant="h5" sx={{ m: '30px 0 15px' }}>
        {header}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Quiz Name</b>
              </TableCell>
              <TableCell>
                <b>Quiz Time</b>
              </TableCell>
              <TableCell>
                <b>Max Points</b>
              </TableCell>
              <TableCell>
                <b>My Score</b>
              </TableCell>
              <TableCell>
                <b>Average Score</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizList
              .sort((a, b) => b.quizStartTs - a.quizStartTs)
              .map((quiz) => (
                <TableRow key={quiz.quizId}>
                  <Link href={`/quiz/${quiz.quizId}`}>
                    <TableCell sx={{ color: PRIMARY_COL }}>
                      {mmtHTMLToReact(quiz.title)}
                    </TableCell>
                  </Link>
                  <TableCell>
                    {dayjs(quiz.quizStartTs).format('MMM-DD HH:mm')} to{' '}
                    {dayjs(quiz.quizEndTs).format('HH:mm')}
                  </TableCell>
                  <TableCell>
                    {previousQuizData?.quizinfo[quiz.quizId]?.maxPoints}
                  </TableCell>
                  <TableCell>
                    {previousQuizData?.quizinfo[quiz.quizId]?.score}
                  </TableCell>
                  <TableCell>
                    {previousQuizData?.quizinfo[quiz.quizId]?.averageScore}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default QuizPerofrmanceTable;
