import { Box, Button, InputAdornment, TextField } from '@mui/material';
import { LMSEvent, UserInfo, getUserInfo, reportEvent } from '@stex-react/api';
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
    name: 'Foundation of Logic in Computer Science',
    description:
      'A first year course on the foundations of Logic in Computer Science. The course covers the syntax and semantics of propositional and first-order logic as representation languages, proof methods (calculi) like natural deduction and resolution, and meta-properties like soundness and completness of calculi. ',
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
  grade?: number;
  percentage?: number;
}

function gradeInfoKey(courseId: string) {
  return 'grade-' + courseId;
}

function getGradeInfoFromLocalStorage() {
  const gradeInfo: { [courseId: string]: GradeInfo } = {};
  COURSE_LIST.forEach((courseId) => {
    const gInfo = localStore?.getItem(gradeInfoKey(courseId));
    if (gInfo) gradeInfo[courseId] = JSON.parse(gInfo) ?? {};
  });
  return gradeInfo;
}

function clamp(num: number, min: number, max: number) {
  if (isNaN(num)) return undefined;
  return Math.min(Math.max(num, min), max);
}

function setGradeInfoToLocalStorage(gradeInfo: {
  [courseId: string]: GradeInfo;
}) {
  COURSE_LIST.forEach((courseId) => {
    const gInfo = gradeInfo[courseId] ?? {};
    localStore?.setItem(gradeInfoKey(courseId), JSON.stringify(gInfo));
  });
}
const MyCourseHistory = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [courseInfo, setCourseInfo] = useState<{
    [courseId: string]: GradeInfo;
  }>(getGradeInfoFromLocalStorage());

  useEffect(() => {
    getUserInfo().then(setUserInfo);
  }, []);

  if (!userInfo) {
    return (
      <MainLayout title="My course History| ALeA">
        Please Login To Continue
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Initialize Course Grades | ALeA">
      <Box maxWidth="800px" m="auto" p="10px">
        <h2>Initialize Course Grades</h2>
        <p>
          By telling us your grades for previously taken courses, you will allow
          us customize the materials on this platform as per your needs.
        </p>
        <p>
          <b>Note 1:</b> You may have taken other courses that topics specified
          in some of the courses listed below. In such a case, please use your
          best judgement to assign a grade to the course.
        </p>
        <p>
          <b>Note 2:</b> It is preferred that you enter your scores in German
          grade scale (1.0-5.0). If you are unable to convert to your scores to
          this scale, you can enter your scores in percentage scale.
        </p>
        <p>
          <b>Note 3:</b> Once submitted, these grades can be reset only after
          resetting your learner model. So please be careful while entering the
          grades.
        </p>
        <table>
          <tr style={{ fontSize: 'large' }}>
            <th>Course</th>
            <th>
              Grade
              <br />
              (1.0-5.0)
            </th>
            <th>
              Percentage
              <br />
              (0-100%)
            </th>
          </tr>
          {COURSE_LIST.map((courseId, idx) => (
            <tr key={courseId} style={{ borderBottom: '1px solid #DDD' }}>
              <td>
                <b>{COURSE_DESCRIPTIONS[courseId].name} ({courseId})</b>
                <br />
                <i>{COURSE_DESCRIPTIONS[courseId].description}</i>
                {!COURSE_DESCRIPTIONS[courseId].description?.length && (
                  <a
                    href="https://github.com/slatex/sTeX-React/blob/main/packages/alea-frontend/pages/course-grade-init.tsx"
                    target="_blank"
                  >
                    <b>
                      <u>Enter {courseId} description here</u>
                    </b>
                  </a>
                )}
              </td>
              <td style={{ paddingLeft: '10px' }}>
                <TextField
                  value={courseInfo[courseId]?.grade ?? ''}
                  type="number"
                  onChange={(e) => {
                    setCourseInfo((prev) => {
                      const grade = clamp(parseFloat(e.target.value), 1, 5);
                      const info = { grade };
                      const newCourseInfo = { ...prev, [courseId]: info };
                      setGradeInfoToLocalStorage(newCourseInfo);
                      return newCourseInfo;
                    });
                  }}
                  sx={{ width: '80px' }}
                  margin="dense"
                />
              </td>
              <td>
                <TextField
                  value={courseInfo[courseId]?.percentage ?? ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  type="number"
                  onChange={(e) => {
                    setCourseInfo((prev) => {
                      const perc = clamp(parseFloat(e.target.value), 0, 100);
                      const info = { percentage: perc };
                      const newCourseInfo = { ...prev, [courseId]: info };
                      setGradeInfoToLocalStorage(newCourseInfo);
                      return newCourseInfo;
                    });
                  }}
                  sx={{ width: '100px' }}
                  margin="dense"
                />
              </td>
            </tr>
          ))}
        </table>
        <Button
          sx={{ mt: '10px' }}
          onClick={() => {
            if (!confirm('Submit grade information?')) return;
            const promises = COURSE_LIST.map((courseId) => {
              const course = courseInfo[courseId];
              const grade = course?.grade;
              const percentage = course?.percentage;
              if (!grade && !percentage) return;
              const event: LMSEvent = { type: 'course-init', course: courseId };
              if (grade) event.grade = grade.toString();
              if (percentage) event.percentage = percentage.toString();
              return reportEvent(event);
            }).filter((x) => x);
            Promise.all(promises).then(() => alert('Submitted successfully'));
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
