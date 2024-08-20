import ArticleIcon from '@mui/icons-material/Article';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import QuizIcon from '@mui/icons-material/Quiz';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  TextareaAutosize,
  Typography,
} from '@mui/material';
import { getCourseInfo, getRagResponse } from '@stex-react/api';
import {
  ContentFromUrl,
  DisplayReason,
  DocumentWidthSetter,
  ExpandableContent,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
import { BG_COLOR, CourseInfo, XhtmlContentUrl } from '@stex-react/utils';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { RecordedSyllabus } from '../../components/RecordedSyllabus';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';

const queryReferencesText = 'Check out these handpicked references for your query :- ';

function CourseComponentLink({ href, children }: { href: string; children: any }) {
  return (
    <Link href={href}>
      <Button variant="contained" sx={{ width: '100%', height: '48px', fontSize: '16px' }}>
        {children}
      </Button>
    </Link>
  );
}

const BG_COLORS = {
  'iwgs-1': 'linear-gradient(to right, #00010e, #060844)',
  'iwgs-2': 'radial-gradient(circle, #5b6956, #8f9868)',
  krmt: 'radial-gradient(circle, white, #f5f5b7)',
  gdp: 'radial-gradient(circle, #4bffd7, #a11cff)',
};

export function CourseHeader({
  courseId,
  courseName,
  imageLink,
}: {
  courseId: string;
  courseName: string;
  imageLink?: string;
}) {
  if (!courseName || !courseId) return <></>;
  if (!imageLink) {
    return (
      <Box m="20px" textAlign="center" fontWeight="bold" fontSize="32px">
        {courseName}
      </Box>
    );
  }
  const allowCrop = ['ai-1', 'ai-2', 'lbs'].includes(courseId);
  return (
    <Box textAlign="center">
      <Link href={`/course-home/${courseId}`}>
        <Box
          display="flex"
          position="relative"
          width="100%"
          maxHeight="200px"
          overflow="hidden"
          borderBottom="2px solid #DDD"
          sx={{ backgroundImage: BG_COLORS[courseId] }}
        >
          {allowCrop ? (
            <img
              src={imageLink}
              alt={courseName}
              style={{
                objectFit: 'cover',
                width: '100%',
                aspectRatio: '16/9',
              }}
            />
          ) : (
            <img
              src={imageLink}
              alt={courseName}
              style={{
                objectFit: 'contain',
                maxHeight: '200px',
                margin: 'auto',
              }}
            />
          )}
        </Box>
      </Link>
      <Box m="20px 0 32px" fontWeight="bold" fontSize="32px">
        {courseName}
      </Box>
    </Box>
  );
}

const CourseHomePage: NextPage = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const courseId = router.query.courseId as string;
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [references, setReferences] = useState<{ archive: string; filepath: string }[]>([]);
  const [loading, setIsLoading] = useState(false);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }

  const { notesLink, slidesLink, cardsLink, forumLink, quizzesLink, hasQuiz } = courseInfo;

  const locale = router.locale || 'en';
  const { home, courseHome: tCourseHome } = getLocaleObject(router);
  const t = home.courseThumb;

  async function handleQuery(query: string) {
    setIsLoading(true);
    const res = await getRagResponse(query);
    setReferences(res.sources);
    setIsLoading(false);
  }

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ` ${tCourseHome.title} | VoLL-KI`}
      bgColor={BG_COLOR}
    >
      <CourseHeader
        courseName={courseInfo.courseName}
        imageLink={courseInfo.imageLink}
        courseId={courseId}
      />

      <Box maxWidth="900px" m="auto" px="10px" display="flex" flexDirection="column">
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill,minmax(185px, 1fr))"
          gap="10px"
          ref={containerRef}
        >
          <CourseComponentLink href={notesLink}>
            {t.notes}&nbsp;
            <ArticleIcon fontSize="large" />
          </CourseComponentLink>
          <CourseComponentLink href={slidesLink}>
            {t.slides}&nbsp;
            <SlideshowIcon fontSize="large" />
          </CourseComponentLink>
          <CourseComponentLink href={cardsLink}>
            {t.cards}&nbsp;{' '}
            <Image src="/noun-flash-cards-2494102.svg" width={35} height={35} alt="" />
          </CourseComponentLink>
          <CourseComponentLink href={forumLink}>
            {t.forum}&nbsp;
            <QuestionAnswerIcon fontSize="large" />
          </CourseComponentLink>
          {hasQuiz && (
            <CourseComponentLink href={quizzesLink}>
              {t.quizzes}&nbsp;
              <QuizIcon fontSize="large" />
            </CourseComponentLink>
          )}

          <CourseComponentLink href={`/study-buddy/${courseId}`}>
            {t.studyBuddy}&nbsp;
            <Diversity3Icon fontSize="large" />
          </CourseComponentLink>
        </Box>
        {courseId === 'iwgs-1' && (
          <Box sx={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <TextareaAutosize
              minRows={2}
              placeholder="Write Your Query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                padding: '5px',
                fontSize: '16px ',
                marginBottom: '20px',
                width: '100%',
              }}
            />
            <Button
              variant="contained"
              sx={{ width: '100px', height: '48px' }}
              onClick={() => handleQuery(query)}
            >
              {loading ? <CircularProgress color="inherit" /> : 'Query'}
            </Button>
          </Box>
        )}
        {references.length > 0 && (
          <>
            <Typography fontWeight="bold">{queryReferencesText}</Typography>
            <Box
              bgcolor="#DDD"
              borderRadius="5px"
              mb="15px"
              sx={{
                padding: '10px',
              }}
            >
              <Box width="600px" m="0 auto 30px" p="10px">
                <DocumentWidthSetter>
                  {references.map((ref, idx) => (
                    <>
                      <Divider sx={{ marginBottom: '20px', marginTop: '20px', fontWeight: 'bold' }}>
                        Reference - {idx + 1}
                      </Divider>
                      <ExpandableContent
                        key={ref.filepath}
                        contentUrl={XhtmlContentUrl(ref.archive, ref.filepath + '.xhtml')}
                        noFurtherExpansion={true}
                      />
                    </>
                  ))}
                </DocumentWidthSetter>
              </Box>
            </Box>
          </>
        )}
        <DocumentWidthSetter>
          <ContentFromUrl
            displayReason={DisplayReason.NOTES}
            url={XhtmlContentUrl(
              courseInfo.notesArchive,
              `${courseInfo.landingFilepath}.${locale}.xhtml`
            )}
          />
        </DocumentWidthSetter>
        <br />
        <br />

        <RecordedSyllabus courseId={courseId} />
      </Box>
    </MainLayout>
  );
};
export default CourseHomePage;
