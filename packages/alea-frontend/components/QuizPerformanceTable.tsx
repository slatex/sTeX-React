import {
  Box,
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
  QuizStubInfo,
  RecorrectionInfo,
  getPreviousQuizInfo,
} from '@stex-react/api';
import { PRIMARY_COL, convertHtmlStringToPlain } from '@stex-react/utils';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { getLocaleObject } from '../lang/utils';
import { useRouter } from 'next/router';
import {
  NoMaxWidthTooltip,
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';

function RecorrectionInfo({
  recorrectionInfo,
}: {
  recorrectionInfo?: RecorrectionInfo[];
}) {
  if (!recorrectionInfo?.length) return null;
  return (
    <NoMaxWidthTooltip
      title={
        <Box
          maxWidth="600px"
          color="#333"
          border="1px solid #CCC"
          p="5px"
          borderRadius="5px"
          boxShadow="2px 7px 31px 8px rgba(0,0,0,0.33)"
        >
          <Typography variant="h6">This quiz was re-corrected</Typography>
          <ul>
            {recorrectionInfo.map((r, idx) => (
              <li key={idx} style={{ marginBottom: '10px' }}>
                <Typography variant="body1">
                  The problem{' '}
                  <b>{mmtHTMLToReact(r.problemHeader || r.problemId)}</b>
                  &nbsp; was re-corrected on{' '}
                  {dayjs(r.recorrectedTs).format('MMM DD')}.
                  <br />
                  {mmtHTMLToReact(r.description)}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
      }
    >
      <InfoIcon />
    </NoMaxWidthTooltip>
  );
}

function QuizPerformanceTable({
  quizList,
  header,
}: {
  quizList: QuizStubInfo[];
  header: string;
}) {
  const { quizPerformanceTable: t } = getLocaleObject(useRouter());
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
              <TableCell sx={{ wordBreak: 'break-word' }}>
                <b>{t.quizName}</b>
              </TableCell>
              <TableCell sx={{ wordBreak: 'break-word' }}>
                <b>{t.quizDate}</b>
              </TableCell>
              <TableCell sx={{ wordBreak: 'break-word' }}>
                <b>{t.maxPoint}</b>
              </TableCell>
              <TableCell sx={{ wordBreak: 'break-word' }}>
                <b>{t.myScore}</b>
              </TableCell>
              <TableCell sx={{ wordBreak: 'break-word' }}>
                <b>{t.averageScore}</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizList
              .sort((a, b) => b.quizStartTs - a.quizStartTs)
              .map((quiz) => (
                <TableRow key={quiz.quizId}>
                  <TableCell
                    sx={{
                      color: PRIMARY_COL,
                      wordBreak: 'break-word',
                      minWidth: '100px',
                    }}
                  >
                    <Box display="flex" alignContent="center">
                      <Link
                        href={`/quiz/${quiz.quizId}`}
                        style={{ marginRight: '5px' }}
                      >
                        {convertHtmlStringToPlain(quiz.title)}
                      </Link>
                      <RecorrectionInfo
                        recorrectionInfo={
                          previousQuizData?.quizInfo[quiz.quizId]
                            ?.recorrectionInfo
                        }
                      />
                    </Box>
                  </TableCell>
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
                    {previousQuizData?.quizInfo[quiz.quizId]?.maxPoints}
                  </TableCell>
                  <TableCell>
                    {previousQuizData?.quizInfo[quiz.quizId]?.score?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {previousQuizData?.quizInfo[
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
