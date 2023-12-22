import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { MaAI_COURSES, PRIMARY_COL, localStore } from '@stex-react/utils';
import type { NextPage } from 'next';
import Link from 'next/link';
import MainLayout from '../../layouts/MainLayout';
import { useRouter } from 'next/router';
import { getLocaleObject } from '../../lang/utils';
import CloseIcon from '@mui/icons-material/Close';
import { useReducer } from 'react';
import { Diversity3 } from '@mui/icons-material';

const RECENT_COURSE_KEY = 'recent-study-buddy-courses';
function getRecentCourses() {
  const chosenCourses = localStore?.getItem(RECENT_COURSE_KEY);
  if (chosenCourses) {
    return chosenCourses.split(',');
  } else {
    return [];
  }
}
function addRecentCourse(courseCode: string) {
  const chosenCourses = getRecentCourses();
  if (!chosenCourses.includes(courseCode)) {
    chosenCourses.push(courseCode);
    localStore?.setItem(RECENT_COURSE_KEY, chosenCourses.join(','));
  }
}
function removeRecentCourse(courseCode: string) {
  const chosenCourses = getRecentCourses();
  if (chosenCourses.includes(courseCode)) {
    localStore?.setItem(
      RECENT_COURSE_KEY,
      chosenCourses.filter((c) => c !== courseCode).join(',')
    );
  }
}

function ChosenStudyBuddyCourses() {
  const chosenCourses = getRecentCourses();
  const { studyBuddy: t } = getLocaleObject(useRouter());
  const [, forceRerender] = useReducer((x) => x + 1, 0);

  if (!chosenCourses?.length) return <></>;
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
        mt: '10px',
      }}
    >
      <Box>{t.recent}:&nbsp;</Box>
      {chosenCourses.map((courseCode) => (
        <Box
          key={courseCode}
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: PRIMARY_COL,
            color: 'white',
            borderRadius: '5px',
            padding: '5px',
            cursor: 'pointer',
          }}
        >
          {MaAI_COURSES[courseCode].courseName}
          <IconButton
            onClick={() => {
              removeRecentCourse(courseCode);
              forceRerender();
            }}
            size="small"
          >
            <Tooltip title={t.removeFromRecents}>
              <CloseIcon htmlColor="white" />
            </Tooltip>
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}
const Courses: NextPage = () => {
  const router = useRouter();
  const courseList = MaAI_COURSES;
  const { studyBuddy: t } = getLocaleObject(useRouter());
  const [, forceRerender] = useReducer((x) => x + 1, 0);

  return (
    <MainLayout title="Courses-List">
      <Box
        sx={{
          margin: 'auto',
          textAlign: 'center',
          maxWidth: '800px',
          m: '0 auto',
          p: '0 10px',
        }}
      >
        <Typography
          variant="h3"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="primary"
        >
          Study Buddy <Diversity3 sx={{ ml: '5px' }} fontSize="inherit" />
        </Typography>
        <Typography variant="body1">
          {t.findCourse}
        </Typography>
        <br />
        <Autocomplete
          id="combo-box-demo"
          options={Object.keys(courseList).map((courseCode) => ({
            label: courseList[courseCode].courseName,
            id: courseCode,
          }))}
          sx={{ width: 300 }}
          renderInput={(params) => {
            console.log(params);
            return <TextField {...params} label="Course" />;
          }}
          onChange={async (e, v) => {
            const courseCode = v?.id;
            if (courseCode) {
              addRecentCourse(courseCode);
              forceRerender();
              await new Promise((r) => setTimeout(r, 500));
              router.push(`/study-buddy/${courseCode}`);
            }
          }}
        />
        <ChosenStudyBuddyCourses />
        <TableContainer component={Paper} sx={{ mt: '20px' }}>
          <Table sx={{ textAlign: 'center', maxWidth: '800px' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: PRIMARY_COL }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                  {t.allCourses}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(courseList).map((courseCode) => (
                <TableRow key={courseCode}>
                  <TableCell>
                    <Link
                      href={`/study-buddy/${courseCode}`}
                      onClick={() => addRecentCourse(courseCode)}
                    >
                      {courseList[courseCode].courseName}
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
