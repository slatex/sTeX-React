import { Box, Button, TextField } from '@mui/material';
import { UserInfo, getUserInfo } from '@stex-react/api';
import { localStore } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

interface Course {
  name: string;
  description: string;
}

const COURSE_DESCRIPTIONS: { [courseId: string]: Course } = {
  AI: {
    name: 'Artiticial Intelligence',
    description:
      'A course that introduces the foundation of symbolic and statistical Artifical Intelligence',
  },
  EDU: {
    name: 'Educational Concepts',
    description:
      'Concepts pertainin to understanding the learner like learner model, guided tour, competency etc.',
  },
  EIDA: {
    name: 'Data Structures and Algorithms',
    description:
      'A course that introduces mathematical modeling of computational problems, as well as common algorithms, algorithmic paradigms, and data structures used to solve these problems.',
  },
  GDP: {
    name: '',
    description: '',
  },
  GENERAL: {
    name: 'General knowledge',
    description: 'Misc items such as time, distance, currency, units',
  },
  GLOIN: {
    name: '',
    description: '',
  },
  LinAlg: {
    name: 'Linear Algebra',
    description: '',
  },
  Calc: {
    name: 'Calculus',
    description: '',
  },
  School: {
    name: 'School',
    description: '',
  },
  TheoCS: {
    name: 'Theoretical Computer Science',
    description:
      'A course on the basic theoretical computer science. It covers formal languages, finite automata, grammars, the theory of computation, Turing machines, and the basics of complexity theory.',
  },
  'Math:stochastics': {
    name: 'Stochastics',
    description: '',
  },
};

const TO_EXCLUDE = ['AI', 'EDU', 'GENERAL', 'School'];

const COURSE_LIST = Object.keys(COURSE_DESCRIPTIONS).filter(
  (id) => !TO_EXCLUDE.includes(id)
);

interface GradeInfo {
  grade?: string;
}

function gradeInfoKey(courseId: string) {
  return 'grade-' + courseId;
}

function getGradeInfoFromLocalStorage() {
  const gradeInfo: { [courseId: string]: GradeInfo } = {};
  COURSE_LIST.forEach((courseId) => {
    const grade = localStore?.getItem(gradeInfoKey(courseId));
    if (grade) gradeInfo[courseId] = { grade };
  });
  return gradeInfo;
}
const MyCourseHistory = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [courseInfo, setCourseInfo] = useState<{
    [courseId: string]: GradeInfo;
  }>(getGradeInfoFromLocalStorage());

  useEffect(() => {
    getUserInfo().then(setUserInfo);
  }, []);

  return (
    <MainLayout title="My course History| ALeA">
      <Box maxWidth="800px" m="auto" p="10px">
        <table style={{ border: '1px solid #CCC' }}>
          {COURSE_LIST.map((courseId, idx) => (
            <tr
              key={courseId}
              style={{ background: idx % 2 == 0 ? 'white' : '#DDD' }}
            >
              <td>
                {COURSE_DESCRIPTIONS[courseId].name}
                <br />
                <i>{COURSE_DESCRIPTIONS[courseId].description}</i>
              </td>
              <td style={{ paddingLeft: '10px' }}>
                <TextField
                  label="Grade"
                  value={courseInfo[courseId]?.grade ?? ''}
                  onChange={(e) => {
                    const grade = e.target.value;
                    setCourseInfo((prev) => {
                      const newCourseInfo = { ...prev };
                      newCourseInfo[courseId] = { grade };
                      localStore?.setItem(gradeInfoKey(courseId), grade);
                      return newCourseInfo;
                    });
                  }}
                  sx={{ minWidth: '150px' }}
                  margin="dense"
                />
              </td>
            </tr>
          ))}
        </table>
        <Button
          sx={{ mt: '10px' }}
          onClick={() => {
            console.log(courseInfo);
          }}
          variant="contained"
        >
          Submit
        </Button>
      </Box>
    </MainLayout>
  );
};

export default MyCourseHistory;
