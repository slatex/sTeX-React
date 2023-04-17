import ArticleIcon from '@mui/icons-material/Article';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import { Box, Button, Card, IconButton, Tooltip } from '@mui/material';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToursAutocomplete } from '../components/ToursAutocomplete';
import { getLocaleObject } from '../lang/utils';
import MainLayout from '../layouts/MainLayout';
import styles from '../styles/utils.module.scss';

function ELink({ href, children }: { href: string; children: any }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
function CourseThumb({
  courseName,
  imageLink,
  notesLink,
  slidesLink = undefined,
  cardsLink = undefined,
  width = 200,
}: {
  courseName: string;
  imageLink: string;
  notesLink: string;
  slidesLink?: string;
  cardsLink?: string;
  width?: number;
}) {
  const router = useRouter();
  const { home } = getLocaleObject(router);
  const t = home.courseThumb;

  return (
    <Card
      sx={{
        backgroundColor: 'hsl(210, 20%, 95%)',
        border: '1px solid #CCC',
        p: '10px',
        m: '10px',
        width: '208px',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="100%"
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Image src={imageLink} width={width} height={100} alt={courseName} />
          <span style={{ fontSize: '18px', marginTop: '5px' }}>
            {courseName}
          </span>
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
          {cardsLink && (
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
          )}
          {slidesLink && (
            <Link href={slidesLink} passHref>
              <Button size="small" variant="contained">
                {t.slides}&nbsp;
                <SlideshowIcon />
              </Button>
            </Link>
          )}
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
                <Box sx={{ fontSize: 'large' }}>
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
            <CourseThumb
              courseName="Artificial Intelligence - II"
              imageLink="/ai-2.jpg"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FAI%26filepath%3Dcourse%2Fnotes%2Fnotes2.xhtml?inDocPath=-kpmihn"
              cardsLink="/flash-cards/ai-2"
            />
            <CourseThumb
              courseName="IWGS - II"
              imageLink="/iwgs-2.jpg"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FIWGS%26filepath%3Dcourse%2Fnotes%2Fnotes-part2.xhtml?inDocPath=-9o7e"
              width={165}
              cardsLink="/flash-cards/iwgs-2"
            />
            <CourseThumb
              courseName="Knowledge Representation for Mathematical Theories"
              imageLink="/krmt.jpg"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FKRMT%26filepath%3Dcourse%2Fnotes%2Fnotes.xhtml"
              cardsLink="/flash-cards/krmt"
            />
          </Box>
          <h2>{t.otherCourses}</h2>
          <Box display="flex" flexWrap="wrap">
            <CourseThumb
              courseName="Artificial Intelligence - I"
              imageLink="/ai-1.jpg"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FAI%26filepath%3Dcourse%2Fnotes%2Fnotes1.xhtml"
              cardsLink="/flash-cards/ai-1"
              slidesLink="/course-view/ai-1"
            />
            <CourseThumb
              courseName="IWGS - I"
              imageLink="/iwgs-1.jpg"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FIWGS%26filepath%3Dcourse%2Fnotes%2Fnotes-part1.xhtml"
              cardsLink="/flash-cards/iwgs-1"
              width={83}
            />
            <CourseThumb
              courseName="Logic-based Natural Language Semantics"
              imageLink="/lbs.jpg"
              cardsLink="/flash-cards/lbs"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FLBS%26filepath%3Dcourse%2Fnotes%2Fnotes.xhtml"
            />
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
