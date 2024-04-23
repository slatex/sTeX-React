import ArticleIcon from '@mui/icons-material/Article';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import QuizIcon from '@mui/icons-material/Quiz';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import {
  Box,
  Button,
  Card,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
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
import { ReactNode, useContext, useEffect, useState } from 'react';

import Diversity3 from '@mui/icons-material/Diversity3';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';

const UniversityDetail = {
  FAU: {
    fullName: 'Friedrich-Alexander-Universität Erlangen-Nürnberg',
    logo: 'https://community.fau.de/wp-content/themes/community.fau-erlangen/img/FAU_Logo_Bildmarke.svg',
  },
  Jacobs: {
    fullName: 'Jacobs University',
    logo: '/jacoblogo.png',
  },
  IISc: {
    fullName: 'India Institute of Science and Technology',
    logo: '/iisc.png',
  },
  'Heriot Watt': {
    fullName: 'Heriot-Watt University',
    logo: '/heriott.png',
  },
};

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

export function CourseThumb({ course }: { course: CourseInfo }) {
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

          {hasQuiz && (
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

const StudentHomePage: NextPage = () => {
  const router = useRouter();
  const { query } = router;
  const { home: t, studyBuddy: s } = getLocaleObject(router);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});
  const institution = query.institution as string;
  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl, institution as string).then(setCourses);
  }, [mmtUrl, institution]);
  return (
    <MainLayout title="Courses | VoLL-KI">
      <Box m="0 auto" maxWidth="800px">
        <Box mx="10px">
          <br />
          <Box display="flex" alignItems="center" mb={4}>
            <Image
              src={UniversityDetail[institution]?.logo}
              alt={UniversityDetail[institution]?.fullName}
              width={150}
              height={150}
            />
            <Typography
              fontFamily={'Roboto'}
              fontWeight={500}
              ml={2}
              color={'#04316a'}
            >
              {UniversityDetail[institution]?.fullName}
            </Typography>
          </Box>
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
          <hr style={{ width: '90%' }} />
        </Box>
      </Box>
    </MainLayout>
  );
};

export default StudentHomePage;
