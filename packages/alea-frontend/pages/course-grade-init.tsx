import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { LMSEvent, UserInfo, getUserInfo, reportEvent } from '@stex-react/api';
import { localStore } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useRouter } from 'next/router';
import { getLocaleObject } from '../lang/utils';

interface LanguageStrings {
  en: string;
  de: string;
}
interface Course {
  name: LanguageStrings;
  description: LanguageStrings;
}

const COURSE_DESCRIPTIONS: { [courseId: string]: Course } = {
  AI: {
    name: {
      en: 'Artificial Intelligence',
      de: 'Künstliche Intelligenz',
    },
    description: {
      en: 'A course that introduces the foundation of symbolic and statistical Artificial Intelligence',
      de: 'Ein Kurs, der die Grundlagen der symbolischen und statistischen künstlichen Intelligenz einführt',
    },
  },
  EDU: {
    name: {
      en: 'Educational Concepts',
      de: 'Bildungskonzepte',
    },
    description: {
      en: 'Concepts pertaining to understanding the learner like learner model, guided tour, competency etc.',
      de: 'Konzepte zur Erfassung des Lernenden wie Lernmodell, geführte Tour, Kompetenz usw.',
    },
  },
  EIDA: {
    name: {
      en: 'Data Structures and Algorithms',
      de: 'Einführung in die Algorithmik',
    },
    description: {
      en: 'A course that introduces mathematical modeling of computational problems, as well as common algorithms, algorithmic paradigms, and data structures used to solve these problems.',
      de: 'Ein Kurs, der die mathematische Modellierung von Berechnungsproblemen sowie gängige Algorithmen, algorithmische Paradigmen und Datenstrukturen zur Lösung dieser Probleme einführt.',
    },
  },
  GDP: {
    name: {
      en: 'Foundations of Programming',
      de: 'Grundlagen der Programmierung',
    },
    description: {
      en: 'A first programming course. It covers algorithms, programs, syntax/semantics, basic data types, control structures, OOP: objects/classes/methods, O-notation, exceptions, assertions, testing, verification, debugging',
      de: 'Ein erster Programmierkurs. Er behandelt Algorithmen, Programme, Syntax/Semantik, grundlegende Datentypen, Kontrollstrukturen, OOP: Objekte/Klassen/Methoden, O-Notation, Ausnahmen, Aussagen, Tests, Verifikation, Debugging',
    },
  },
  GENERAL: {
    name: {
      en: 'General knowledge',
      de: 'Allgemeinwissen',
    },
    description: {
      en: 'Misc items such as time, distance, currency, units',
      de: 'Verschiedene Themen wie Zeit, Entfernung, Währung, Einheiten',
    },
  },
  GLOIN: {
    name: {
      en: 'Foundation of Logic in Computer Science',
      de: 'Grundlagen der Logik in der Informatik',
    },
    description: {
      en: 'A first-year course on the foundations of Logic in Computer Science. The course covers the syntax and semantics of propositional and first-order logic as representation languages, proof methods (calculi) like natural deduction and resolution, and meta-properties like soundness and completeness of calculi. ',
      de: 'Ein Kurs im ersten Studienjahr über die Grundlagen der Logik in der Informatik. Der Kurs behandelt die Syntax und Semantik der Aussagen- und Prädikatenlogik als Repräsentationssprachen, Beweismethoden (Kalküle) wie natürliche Deduktion und Resolution sowie Metaeigenschaften wie Vollständigkeit und Korrektheit von Kalkülen.',
    },
  },
  LinAlg: {
    name: {
      en: 'Linear Algebra',
      de: 'Lineare Algebra',
    },
    description: {
      en: 'A first course in linear algebra. The course covers number systems, vector spaces, linear mappings and equation systems, matrices and their operations, determinants, eigenvectors, eigenvalues, scalar products.',
      de: 'Ein erster Kurs in linearer Algebra. Der Kurs behandelt Zahlensysteme, Vektorräume, lineare Abbildungen und Gleichungssysteme, Matrizen und ihre Operationen, Determinanten, Eigenvektoren, Eigenwerte, Skalarprodukte.',
    },
  },
  Calc: {
    name: {
      en: 'Calculus',
      de: 'Infinitesimalrechnung',
    },
    description: {
      en: "A first course on calculus. The course covers real and complex numbers, sequences, series, and limits, univariate real functions, continuity, differentiability, differentiation, integration, Taylor series, Newton's method.",
      de: 'Ein erster Kurs in Differential- und Integralrechnung. Der Kurs behandelt reelle und komplexe Zahlen, Folgen, Reihen und Grenzwerte, univariate reale Funktionen, Stetigkeit, Differenzierbarkeit, Ableitung, Integration, Taylor-Reihen, Newton-Verfahren.',
    },
  },
  School: {
    name: {
      en: 'Highschool',
      de: 'Schule',
    },
    description: {
      en: 'Anything taught in high school',
      de: 'Alles, was in der Schule unterrichtet wird',
    },
  },
  TheoCS: {
    name: {
      en: 'Theoretical Computer Science',
      de: 'Theoretische Informatik',
    },
    description: {
      en: 'A course on the basic theoretical computer science. It covers formal languages, finite automata, grammars, the theory of computation, Turing machines, and the basics of complexity theory.',
      de: 'Ein Kurs über die grundlegende theoretische Informatik. Er behandelt formale Sprachen, endliche Automaten, Grammatiken, die Berechenbarkeitstheorie, Turing-Maschinen und die Grundlagen der Komplexitätstheorie.',
    },
  },
  'Math:stochastics': {
    name: {
      en: 'Stochastics',
      de: 'Stochastik',
    },
    description: {
      en: 'A first course in Stochastics and Statistics. It covers probability spaces, random variables, prior/conditional probabilities and their rules, various types of distributions, independence, Markov chains, expectation and variance, statistical analysis, regression, variance analysis',
      de: 'Ein erster Kurs in Stochastik und Statistik. Er behandelt Wahrscheinlichkeitsräume, Zufallsvariablen, vorherige/bedingte Wahrscheinlichkeiten und ihre Regeln, verschiedene Arten von Verteilungen, Unabhängigkeit, Markov-Ketten, Erwartungswert und Varianz, statistische Analyse, Regression, Varianzanalyse',
    },
  },
};

const TO_EXCLUDE = ['AI', 'EDU', 'GENERAL', 'School'];

const POSSIBLE_GERMAN_GRADES = [
  '1.0',
  '1.3',
  '1.7',
  '2.0',
  '2.3',
  '2.7',
  '3.0',
  '3.3',
  '3.7',
  '4.0',
  '5.0',
];

const COURSE_LIST = Object.keys(COURSE_DESCRIPTIONS).filter(
  (id) => !TO_EXCLUDE.includes(id)
);
interface GradeInfo {
  grade?: string;
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
  const { locale } = useRouter();
  const { learnerModelPriming: t } = getLocaleObject({ locale });
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [courseInfo, setCourseInfo] = useState<{
    [courseId: string]: GradeInfo;
  }>(getGradeInfoFromLocalStorage());

  useEffect(() => {
    getUserInfo().then(setUserInfo);
  }, []);
  const lang = locale ?? 'en';

  if (!userInfo) {
    return (
      <MainLayout title={`${t.learnerModelPriming} | ALeA`}>
        {t.loginToContinue}
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${t.learnerModelPriming} | ALeA`}>
      <Box maxWidth="800px" m="auto" p="10px">
        <h2>{t.learnerModelPriming}</h2>
        <p>{t.intro}</p>
        <p>{t.disclaimer}</p>
        <p>
          <b>{t.note} 1:</b> {t.note1}
        </p>
        <p>
          <b>{t.note} 2:</b> {t.note2}
        </p>
        <p>
          <b>{t.note} 3:</b> {t.note3}
        </p>
        <table>
          <tr style={{ fontSize: 'large' }}>
            <th>{t.course}</th>
            <th>
              {t.grade}
              <br />
              (1.0-5.0)
            </th>
            <th>
              {t.percentage}
              <br />
              (0-100%)
            </th>
          </tr>
          {COURSE_LIST.map((courseId, idx) => (
            <tr key={courseId} style={{ borderBottom: '1px solid #DDD' }}>
              <td>
                <b>
                  {COURSE_DESCRIPTIONS[courseId].name[lang]} ({courseId})
                </b>
                <br />
                <i>{COURSE_DESCRIPTIONS[courseId].description[lang]}</i>
                {!COURSE_DESCRIPTIONS[courseId].description[lang]?.length && (
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
                <Select
                  value={courseInfo[courseId]?.grade ?? ''}
                  onChange={(e) => {
                    setCourseInfo((prev) => {
                      const grade = e.target.value;
                      const info = { grade };
                      const newCourseInfo = { ...prev, [courseId]: info };
                      setGradeInfoToLocalStorage(newCourseInfo);
                      return newCourseInfo;
                    });
                  }}
                  sx={{ width: '70px' }}
                  margin="dense"
                >
                  <MenuItem key={'empty'} value={''}>
                    {'N/A'}
                  </MenuItem>
                  {POSSIBLE_GERMAN_GRADES.map((v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </Select>
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
            if (!confirm(t.submitConfirmation)) return;
            const promises = COURSE_LIST.map((courseId) => {
              const course = courseInfo[courseId];
              const grade = course?.grade;
              const percentage = course?.percentage;
              if (!grade && !percentage) return;
              const event: LMSEvent = { type: 'course-init', course: courseId };
              if (grade) event.grade = grade;
              if (percentage) event.percentage = percentage.toString();
              return reportEvent(event);
            }).filter((x) => x);
            Promise.all(promises).then(() => alert(t.submitSuccess));
          }}
          variant="contained"
        >
          {t.submit}
        </Button>
      </Box>
    </MainLayout>
  );
};

export default MyCourseHistory;
