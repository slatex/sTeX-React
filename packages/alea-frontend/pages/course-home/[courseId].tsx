import ArticleIcon from '@mui/icons-material/Article';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import QuizIcon from '@mui/icons-material/Quiz';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import { Box, Button, CircularProgress } from '@mui/material';
import { getCourseInfo } from '@stex-react/api';
import {
  ContentFromUrl,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
import {
  BG_COLOR,
  CourseInfo,
  Window,
  XhtmlContentUrl,
} from '@stex-react/utils';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { RecordedSyllabus } from '../../components/RecordedSyllabus';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';

function CourseComponentLink({
  href,
  children,
}: {
  href: string;
  children: any;
}) {
  return (
    <Link href={href} style={{ flexGrow: 1 }}>
      <Button
        variant="contained"
        sx={{ width: '100%', height: '48px', fontSize: '16px' }}
      >
        {children}
      </Button>
    </Link>
  );
}

const BG_COLORS = {
  'iwgs-1': 'linear-gradient(to right, #00010e, #060844)',
  'iwgs-2': 'linear-gradient(to right, #f3f7dc, #8f9868)',
  krmt: 'linear-gradient(to right, #e8e9bf, #f5f5b7)',
};

export function CourseHeader({ courseInfo }: { courseInfo: CourseInfo }) {
  const courseId = courseInfo.courseId;
  if (!courseInfo) return <></>;
  const { courseName, imageLink } = courseInfo;
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

      <Box m="20px 0 32px">
        <span style={{ fontWeight: 'bold', fontSize: '32px' }}>
          {courseName}
        </span>
      </Box>
    </Box>
  );
}

const CourseHomePage: NextPage = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const courseId = router.query.courseId as string;
  const [courses, setCourses] = useState<
    { [id: string]: CourseInfo } | undefined
  >(undefined);
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

  const { notesLink, slidesLink, cardsLink, forumLink, quizzesLink } =
    courseInfo;

  const locale = router.locale || 'en';
  const { home } = getLocaleObject(router);
  const t = home.courseThumb;

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ' Course Home | VoLL-KI'}
      bgColor={BG_COLOR}
    >
      <CourseHeader courseInfo={courseInfo} />

      <Box
        maxWidth="900px"
        m="auto"
        px="10px"
        display="flex"
        flexDirection="column"
      >
        <Box
          display="flex"
          width="100%"
          gap="10px"
          flexWrap="wrap"
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
            <Image
              src="/noun-flash-cards-2494102.svg"
              width={35}
              height={35}
              alt=""
            />
          </CourseComponentLink>
          <CourseComponentLink href={forumLink}>
            {t.forum}&nbsp;
            <QuestionAnswerIcon fontSize="large" />
          </CourseComponentLink>
          <CourseComponentLink href={quizzesLink}>
            {t.quizzes}&nbsp;
            <QuizIcon fontSize="large" />
          </CourseComponentLink>
        </Box>
        <Box {...({ style: { '--document-width': `100%` } } as any)}>
          <ContentFromUrl
            url={XhtmlContentUrl(
              courseInfo.notesArchive,
              `${courseInfo.landingFilepath}.${locale}.xhtml`
            )}
            skipSidebar={true}
          />
        </Box>
        <br />
        <br />

        <RecordedSyllabus courseId={courseId} />
      </Box>
    </MainLayout>
  );
};
export default CourseHomePage;
