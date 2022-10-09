import ArticleIcon from '@mui/icons-material/Article';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import { Box, Button, Card } from '@mui/material';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ToursAutocomplete } from '../components/ToursAutocomplete';
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
  width = 200,
}: {
  courseName: string;
  imageLink: string;
  notesLink: string;
  slidesLink?: string;
  width?: number;
}) {
  return (
    <Card
      sx={{
        backgroundColor: 'hsl(210, 20%, 95%)',
        border: '1px solid #CCC',
        p: '10px',
        m: '10px',
        width: '203px',
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
        <Box display="flex" justifyContent="flex-end" mt="5px">
          <Link href={notesLink} passHref>
            <Button size="small" variant="contained">
              Notes&nbsp;
              <ArticleIcon />
            </Button>
          </Link>
          {slidesLink && (
            <Link href={slidesLink} passHref>
              <Button size="small" variant="contained" sx={{ ml: '10px' }}>
                Slides&nbsp;
                <SlideshowIcon />
              </Button>
            </Link>
          )}
        </Box>
      </Box>
    </Card>
  );
}

const StudentHomePage: NextPage = () => {
  return (
    <MainLayout title="Courses | VoLL-KI">
      <Box m="0 auto" maxWidth="800px">
        <Box mx="10px">
          <Box className={styles['descriptive-box']}>
            <h1>Voll-KI based Courses at FAU</h1>
            The <ELink href="https://voll-ki.fau.de">
              VoLL-KI Project
            </ELink>{' '}
            supplies{' '}
            <ELink href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/acm">
              AI-enhanced course materials
            </ELink>{' '}
            for courses in Computer Science and Artificial Intelligence at FAU.
            These are interactive documents that adapt to the users preferences
            and competencies focused on the knowledge conveyed in a particular
            knowledge unit. On this page we supply entry points for FAU courses
            and the underlying CS/AI Curriculum by topic.
            <h2>Current semester &#40;WS 22/23&#41;</h2>
          </Box>
          <Box display="flex" flexWrap="wrap">
            <CourseThumb
              courseName="Artificial Intelligence - I"
              imageLink="/ai-1.jpg"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FAI%26filepath%3Dcourse%2Fnotes%2Fnotes.xhtml"
              slidesLink="/course-view/ai-1"
            />
            <CourseThumb
              courseName="IWGS - I"
              imageLink="/iwgs-1.jpg"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FIWGS%26filepath%3Dcourse%2Fnotes%2Fnotes.xhtml"
              width={83}
            />
            <CourseThumb
              courseName="Logik-Basierte Sprachverarbeitung"
              imageLink="/lbs.jpg"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FLBS%26filepath%3Dcourse%2Fnotes%2Fnotes.xhtml"
            />
          </Box>
          <h2>Other Courses</h2>
          <Box display="flex" flexWrap="wrap">
            <CourseThumb
              courseName="Artificial Intelligence - II"
              imageLink="/ai-2.jpg"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FAI%26filepath%3Dcourse%2Fnotes%2Fnotes.xhtml?inDocPath=-kpmihn"
            />
            <CourseThumb
              courseName="IWGS - II"
              imageLink="/iwgs-2.jpg"
              notesLink="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FIWGS%26filepath%3Dcourse%2Fnotes%2Fnotes.xhtml?inDocPath=-9o7e"
              width={165}
            />
          </Box>
          <hr />
          <h1>Topic-Based, Free Style Learning</h1>
          <ToursAutocomplete />
          <br />
          <hr />
          <br />
          <Box className={styles['descriptive-box']}>
            <ELink href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/acm">
              Active course materials
            </ELink>{' '}
            incorporate{' '}
            <ELink href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/lss">
              learning support services
            </ELink>{' '}
            based on a{' '}
            <ELink href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/um">
              model
            </ELink>{' '}
            that is updated with every interaction with the materials. Such{' '}
            <ELink href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/um">
              models of a user&apos;s preferences and competencies
            </ELink>{' '}
            contain highly sensitive personal data. Therefore the{' '}
            <ELink href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/lss">
              learning support services
            </ELink>{' '}
            (and corresponding user model data collection) are only enabled when
            the user is logged in via the{' '}
            <ELink href="https://www.sso.uni-erlangen.de/">
              FAU Single-Signon Service
            </ELink>{' '}
            and are kept secure and under exclusive control of the respective
            user in the{' '}
            <ELink href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/trust-zone">
              Voll-KI Trust Zone
            </ELink>
            .
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default StudentHomePage;
