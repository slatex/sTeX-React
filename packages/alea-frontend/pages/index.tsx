import ArticleIcon from '@mui/icons-material/Article';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import QuizIcon from '@mui/icons-material/Quiz';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import { Box, Button, Card, IconButton, Tooltip } from '@mui/material';
import { getCourseInfo } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  CURRENT_TERM,
  CourseInfo,
  PRIMARY_COL,
  PRIMARY_COL_DARK_HOVER,
} from '@stex-react/utils';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState, ReactNode } from 'react';
import { getLocaleObject } from '../lang/utils';
import MainLayout from '../layouts/MainLayout';
import styles from '../styles/utils.module.scss';
import Diversity3 from '@mui/icons-material/Diversity3';

function ELink({ href, children }: { href: string; children: any }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function ColoredIconButton({ children }: { children: ReactNode }) {
  return (
    <IconButton
      sx={{
        bgcolor: PRIMARY_COL,
        '&:hover, &.Mui-focusVisible': { bgcolor: PRIMARY_COL_DARK_HOVER },
      }}
    >
      {children}
    </IconButton>
  );
}

function CourseThumb({ course }: { course: CourseInfo }) {
  const router = useRouter();
  const { home } = getLocaleObject(router);
  const t = home.courseThumb;
  const {
    courseId,
    courseName,
    courseHome,
    imageLink,
    notesLink,
    slidesLink,
    cardsLink,
    forumLink,
    quizzesLink,
    hasQuiz,
  } = course;
  const width = courseId === 'iwgs-1' ? 83 : courseId === 'iwgs-2' ? 165 : 200;
  return (
    <Card
      sx={{
        backgroundColor: 'hsl(210, 20%, 95%)',
        border: '1px solid #CCC',
        p: '10px',
        m: '10px',
        width: '200px',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="100%"
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Link href={courseHome} style={{ textAlign: 'center' }}>
            <Image
              src={imageLink}
              width={width}
              height={100}
              alt={courseName}
              style={{ display: 'block', margin: 'auto' }}
              priority={true}
            />
            <span
              style={{ fontSize: '16px', marginTop: '5px', fontWeight: 'bold' }}
            >
              {courseName.length > 50 ? courseId.toUpperCase() : courseName}
            </span>
          </Link>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          mt="5px"
          gap="5px"
          flexWrap="wrap"
        >
          <Tooltip title={t.notes}>
            <Link href={notesLink} passHref>
              <Button size="small" variant="contained">
                {t.notes}&nbsp;
                <ArticleIcon />
              </Button>
            </Link>
          </Tooltip>

          <Tooltip title={t.slides}>
            <Link href={slidesLink} passHref>
              <Button size="small" variant="contained">
                {t.slides}&nbsp;
                <SlideshowIcon />
              </Button>
            </Link>
          </Tooltip>

          <Tooltip title={home.cardIntro}>
            <Link href={cardsLink} passHref>
              <ColoredIconButton>
                <Image
                  src="/noun-flash-cards-2494102.svg"
                  width={25}
                  height={25}
                  alt=""
                />
              </ColoredIconButton>
            </Link>
          </Tooltip>

          <Tooltip title={t.forum}>
            <Link href={forumLink} passHref>
              <ColoredIconButton>
                <QuestionAnswerIcon htmlColor="white" />
              </ColoredIconButton>
            </Link>
          </Tooltip>

          {course.isCurrent && hasQuiz && (
            <Tooltip title={t.quizzes}>
              <Link href={quizzesLink} passHref>
                <ColoredIconButton>
                  <QuizIcon htmlColor="white" />
                </ColoredIconButton>
              </Link>
            </Tooltip>
          )}

          <Tooltip title={t.studyBuddy}>
            <Link href={`/study-buddy/${courseId}`} passHref>
              <ColoredIconButton>
                <Diversity3 htmlColor="white" />
              </ColoredIconButton>
            </Link>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
}

function SiteDescription({ lang }: { lang: string }) {
  if (lang === 'de') {
    return (
      <>
        Das <ELink href="https://voll-ki.fau.de">VoLL-KI-Projekt</ELink> liefert{' '}
        <ELink href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/Adaptive-Course-Materials">
          KI-erweiterte Kursmaterialien
        </ELink>{' '}
        für Kurse in Informatik und Künstlicher Intelligenz an der FAU. Dies
        sind interaktive Dokumente, die sich an die Präferenzen und Kompetenzen
        der Benutzer anpassen und sich auf das in einer bestimmten
        Wissenseinheit vermittelte Wissen konzentrieren.
      </>
    );
  }
  if (lang === 'en') {
    return (
      <>
        The <ELink href="https://voll-ki.fau.de">VoLL-KI Project</ELink>{' '}
        supplies{' '}
        <ELink href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/Adaptive-Course-Materials">
          AI-enhanced course materials
        </ELink>{' '}
        for courses in Computer Science and Artificial Intelligence at FAU.
        These are interactive documents that adapt to the users preferences and
        competencies focused on the knowledge conveyed in a particular knowledge
        unit.
      </>
    );
  }
}

const StudentHomePage: NextPage = () => {
  const router = useRouter();
  const { home: t, studyBuddy: s } = getLocaleObject(router);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  return (
    <MainLayout title="Courses | VoLL-KI">
      <Box m="0 auto" maxWidth="800px">
        <Box mx="10px">
          <Box className={styles['descriptive-box']}>
            <Tooltip
              title={
                <Box sx={{ fontSize: 'medium' }}>
                  <span style={{ display: 'block' }}>{t.expIconHover1}</span>
                  <span>{t.expIconHover2}</span>
                </Box>
              }
            >
              <IconButton
                sx={{ float: 'right', zIndex: 2 }}
                size="large"
                onClick={() => router.push('/exp')}
              >
                <Image
                  height={30}
                  width={30}
                  src="/experiment.svg"
                  alt="Experiments"
                />
              </IconButton>
            </Tooltip>
            <h1>{t.header}</h1>
            <SiteDescription lang={router.locale} />
          </Box>
          <br />
          <Link href="/study-buddy">
            <Tooltip
              title={
                <Box sx={{ fontSize: 'medium' }}>{t.studyBuddyTooltip}</Box>
              }
            >
              <Button variant="contained">{s.studyBuddyMasterCourse}</Button>
            </Tooltip>
          </Link>

          <h2>{`${t.courseSection} (${CURRENT_TERM})`}</h2>
          <Box display="flex" flexWrap="wrap">
            {Object.values(courses)
              .filter((course) => course.isCurrent)
              .map((c) => (
                <CourseThumb key={c.courseId} course={c} />
              ))}
          </Box>
          <h2>{t.otherCourses}</h2>
          <Box display="flex" flexWrap="wrap">
            {Object.values(courses)
              .filter((course) => !course.isCurrent)
              .map((c) => (
                <CourseThumb key={c.courseId} course={c} />
              ))}
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default StudentHomePage;
