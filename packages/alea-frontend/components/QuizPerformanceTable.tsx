import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  GetPreviousQuizInfoResponse,
  getPreviousQuizInfo,
} from '@stex-react/api';
import { PRIMARY_COL, convertHtmlStringToPlain } from '@stex-react/utils';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function QuizPerformanceTable({ quizList, header }) {
  const [previousQuizData, setPreviousQuizData] =
    useState<GetPreviousQuizInfoResponse>();
  useEffect(() => {
    getPreviousQuizInfo().then(setPreviousQuizData);
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
                    <TableCell
                      sx={{ color: PRIMARY_COL, wordBreak: 'break-word' }}
                    >
                      {convertHtmlStringToPlain(quiz.title)}
                    </TableCell>
                  </Link>
                  <TableCell>
                    <Tooltip
                      title={`${dayjs(quiz.quizStartTs).format(
                        'MMM-DD HH:mm'
                      )} to ${dayjs(quiz.quizEndTs).format('MMM-DD HH:mm')}`}
                    >
                      <span>{dayjs(quiz.quizStartTs).format('MMM-DD')}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {previousQuizData?.quizinfo[quiz.quizId]?.maxPoints}
                  </TableCell>
                  <TableCell>
                    {previousQuizData?.quizinfo[quiz.quizId]?.score?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {previousQuizData?.quizinfo[
                      quiz.quizId
                    ]?.averageScore?.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default QuizPerformanceTable;
