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
import { HomeworkInfo, LearnerHomeworkInfo, getHomeworkList } from '@stex-react/api';
import { PRIMARY_COL } from '@stex-react/utils';
import { getLocaleObject } from '../lang/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

function HomeworkPerformanceTable({ courseId }: { courseId: string }) {
  const { homeworkPerformanceTable: t, homework: tHW } = getLocaleObject(useRouter());
  const [homeworkData, setHomeworkData] = useState<LearnerHomeworkInfo[]>([]);

  useEffect(() => {
    const getHomeworkData = async () => {
      try {
        const data = await getHomeworkList(courseId);
        const mappedData: LearnerHomeworkInfo[] = data.map((homework: HomeworkInfo) => ({
          name: homework.homeworkName,
          homeworkGivenDate: new Date(homework.homeworkGivenDate).toLocaleDateString('en-GB'),
          answerReleaseDate: new Date(homework.answerReleaseDate).toLocaleDateString('en-GB'),
          maxPoints: 100,
          myScore: 0,
          avgScore: 0,
          archive: homework.archive,
          filepath: homework.filepath,
        }));
        setHomeworkData(mappedData);
      } catch (error) {
        console.error('Error fetching homework data:', error);
      }
    };

    getHomeworkData();
  }, [courseId]);

  return (
    <>
      <Typography variant="h5" sx={{ m: '30px 0 15px' }}>
        {tHW.givenHomeworks}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>{t.homeworkName}</b>
              </TableCell>
              <TableCell>
                <b>{t.homeworkGivenDate}</b>
              </TableCell>
              <TableCell>
                <b>{t.answerReleaseDate}</b>
              </TableCell>
              <TableCell>
                <b>{t.maxPoints}</b>
              </TableCell>
              <TableCell>
                <b>{t.myScore}</b>
              </TableCell>
              <TableCell>
                <b>{t.averageScore}</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {homeworkData.map((homework, index) => (
              <TableRow key={index}>
                <TableCell sx={{ color: PRIMARY_COL, wordBreak: 'break-word', minWidth: '100px' }}>
                  <Link
                    href={{
                      pathname: '/homework-doc',
                      query: {
                        archive: homework.archive,
                        filepath: homework.filepath,
                        courseId: courseId,
                      },
                    }}
                    style={{
                      textDecoration: 'none',
                      color: PRIMARY_COL,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {homework.name}
                  </Link>
                </TableCell>
                <TableCell sx={{ color: PRIMARY_COL, wordBreak: 'break-word', minWidth: '100px' }}>
                  <Link
                    href={{
                      pathname: '/homework-doc',
                      query: {
                        archive: homework.archive,
                        filepath: homework.filepath,
                        courseId: courseId,
                      },
                    }}
                    style={{
                      textDecoration: 'none',
                      color: PRIMARY_COL,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {homework.homeworkGivenDate}
                  </Link>
                </TableCell>
                <TableCell sx={{ color: PRIMARY_COL, wordBreak: 'break-word', minWidth: '100px' }}>
                  {homework.answerReleaseDate}
                </TableCell>
                <TableCell sx={{ color: PRIMARY_COL, wordBreak: 'break-word', minWidth: '100px' }}>
                  {homework.maxPoints}
                </TableCell>
                <TableCell sx={{ color: PRIMARY_COL, wordBreak: 'break-word', minWidth: '100px' }}>
                  {homework.myScore}
                </TableCell>
                <TableCell sx={{ color: PRIMARY_COL, wordBreak: 'break-word', minWidth: '100px' }}>
                  {homework.avgScore}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default HomeworkPerformanceTable;
