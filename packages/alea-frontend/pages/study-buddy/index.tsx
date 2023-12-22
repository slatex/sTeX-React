import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { MaAI_COURSES, PRIMARY_COL } from '@stex-react/utils';
import type { NextPage } from 'next';
import Link from 'next/link';
import MainLayout from '../../layouts/MainLayout';
import { useRouter } from 'next/router';
import { getLocaleObject } from '../../lang/utils';

const Courses: NextPage = () => {
  const courseList = MaAI_COURSES;
  const t = getLocaleObject(useRouter());
  return (
    <MainLayout title="Courses-List">
      <Box sx={{ margin: 'auto', maxWidth: '800px', mt: '10px' }}>
        <TableContainer component={Paper} sx={{ mt: '10px' }}>
          <Table sx={{ textAlign: 'center', maxWidth: '800px' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: PRIMARY_COL }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                  {t.studyBuddy.allCourses}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                  {t.studyBuddy.studyBuddyLink}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(courseList).map((courseCode) => (
                <TableRow key={courseCode}>
                  <TableCell>{courseList[courseCode].courseName}</TableCell>
                  <TableCell>
                    <Link href={`/study-buddy/${courseCode}`} passHref>
                      <Button variant="contained">
                        {t.studyBuddy.goToStudyBuddy}
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </MainLayout>
  );
};

export default Courses;
