import ArticleIcon from '@mui/icons-material/Article';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import { Box, Button, Card, IconButton, Tooltip } from '@mui/material';
import { COURSES_INFO } from '@stex-react/utils';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToursAutocomplete } from '../components/ToursAutocomplete';
import { getLocaleObject } from '../lang/utils';
import MainLayout from '../layouts/MainLayout';
import styles from '../styles/utils.module.scss';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

function ELink({ href, children }: { href: string; children: any }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
function CourseThumb({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { home } = getLocaleObject(router);
  const t = home.courseThumb;

  const {
    courseName,
    courseHome,
    imageLink,
    notesLink,
    slidesLink,
    cardsLink,
    forumLink,
  } = COURSES_INFO[courseId];
  const width = courseId === 'iwgs-1' ? 83 : courseId === 'iwgs-2' ? 165 : 200;
  return (
    <Card
      sx={{
        backgroundColor: 'hsl(210, 20%, 95%)',
        border: '1px solid #CCC',
        p: '10px',
        m: '10px',
        width: '218px',
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
              style={{ display: 'block' }}
              priority={true}
            />
            <span
              style={{ fontSize: '16px', marginTop: '5px', fontWeight: 'bold' }}
            >
              {courseName}
            </span>
          </Link>
        </Box>
        <Box
          display="flex"
          justifyContent="space-evenly"
          mt="5px"
          gap="5px"
          flexWrap="wrap"
        >
          <Link href={notesLink} passHref>
            <Button size="small" variant="contained">
              {t.notes}&nbsp;
              <ArticleIcon />
            </Button>
          </Link>

          <Tooltip title={home.cardIntro}>
            <Link href={cardsLink} passHref>
              <Button size="small" variant="contained">
                {t.cards}&nbsp;
                <Image
                  src="/noun-flash-cards-2494102.svg"
                  width={25}
                  height={25}
                  alt=""
                />
              </Button>
            </Link>
          </Tooltip>

          <Link href={slidesLink} passHref>
            <Button size="small" variant="contained">
              {t.slides}&nbsp;
              <SlideshowIcon />
            </Button>
          </Link>
          <Link href={forumLink} passHref>
            <Button size="small" variant="contained">
              {t.forum}&nbsp;
              <QuestionAnswerIcon />
            </Button>
          </Link>
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
        Wissenseinheit vermittelte Wissen konzentrieren. Auf dieser Seite
        liefern wir thematisch geordnet Einstiegspunkte für FAU-Kurse und das
        zugrunde liegende CS/AI-Curriculum.
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
        unit. On this page we supply entry points for FAU courses and the
        underlying CS/AI Curriculum by topic.
      </>
    );
  }
}

const StudentHomePage: NextPage = () => {
  const router = useRouter();
  const { home: t } = getLocaleObject(router);

  return (
    <MainLayout title="Courses | VoLL-KI">
      <Box m="0 auto" maxWidth="800px">
        <Box mx="10px">
          <Box className={styles['descriptive-box']}>
            <Tooltip
              title={
                <Box sx={{ fontSize: 'medium' }}>
                  <span>{t.expIconHover1}</span>
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
            <h2>{t.courseSection}</h2>
          </Box>
          <Box display="flex" flexWrap="wrap">
            {['ai-2', 'iwgs-2', 'krmt'].map((courseId) => (
              <CourseThumb key={courseId} courseId={courseId} />
            ))}
          </Box>
          <h2>{t.otherCourses}</h2>
          <Box display="flex" flexWrap="wrap">
            {['ai-1', 'iwgs-1', 'lbs'].map((courseId) => (
              <CourseThumb key={courseId} courseId={courseId} />
            ))}
          </Box>
          <hr style={{ width: '90%' }} />
          <h1>{t.guidedTourHeader}</h1>
          <ToursAutocomplete />
          <br />
          <hr style={{ width: '90%' }} />
          <br />
          <Box className={styles['descriptive-box']}>{t.footerInfo}</Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default StudentHomePage;
