import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { PRIMARY_COL } from '@stex-react/utils';

import Link from 'next/link';

import { getLocaleObject } from '../lang/utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Homework {
  name: string;
  date: string;
  maxPoints: number;
  myScore: number;
  avgScore: number;
  archive: string;
  filepath: string;
}
function HomeworkPerformanceTable({ courseId }: { courseId: string }) {
  const { homeworkPerformanceTable: t, homework: tHW } = getLocaleObject(useRouter());
  const [homeworkData, setHomeworkData] = useState<Homework[]>([]);

  useEffect(() => {
    const getHomeworkData = async () => {
      try {
        const response = await axios.get(`/api/homework-handler?courseId=${courseId}`);
        const data = response.data;
        const mappedData: Homework[] = data.map((homework: any) => ({
          name: homework.homeworkName,
          date: new Date(homework.homeworkDate).toLocaleDateString('en-GB'),
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
  console.log('hda', homeworkData);
  // const homeworkData = [
  //   {
  //     name: 'Prolog',
  //     date: '25-10-2024',
  //     maxPoints: 90,
  //     myScore: 85,
  //     avgScore: 75,
  //     archive: 'courses/FAU/AI/hwexam',
  //     filepath: 'WS2324/assignments/a1.xhtml',
  //   },
  //   {
  //     name: 'Recap',
  //     date: '02-11-2024',
  //     maxPoints: 100,
  //     myScore: 90,
  //     avgScore: 80,
  //     archive: 'courses/FAU/AI/hwexam',
  //     filepath: 'WS2324/assignments/a2.xhtml',
  //   },
  //   {
  //     name: 'Agents',
  //     date: '08-11-2024',
  //     maxPoints: 80,
  //     myScore: 45,
  //     avgScore: 40,
  //     archive: 'courses/FAU/AI/hwexam',
  //     filepath: 'WS2324/assignments/a3.xhtml',
  //   },
  // ];

  return (
    <>
      <Typography variant="h5" sx={{ m: '30px 0 15px' }}>
        {tHW.previousHomeworks}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>{t.homeworkName}</b>
              </TableCell>
              <TableCell>
                <b>{t.homeworkDate}</b>
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
                    style={{ textDecoration: 'none', color: PRIMARY_COL }}
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
                    style={{ textDecoration: 'none', color: PRIMARY_COL }}
                  >
                    {homework.date}
                  </Link>
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
